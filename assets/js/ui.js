'use strict'

import SETTINGS from './static/settings.js';
import HEADER_BAR from './header_bar.js'
import PROMO from './promo.js'

import { PIDS_OVERRIDE_DATA, UIPreset, DisplayMode, getRoute } from './static/data.js';

const Chinese = /\p{Script=Han}/u;

let arrivalVisibility = [true, true, true, true];
let languageCycle = 0;
let pauseUIUpdate = false;

const MARQUEE_SCROLL_TIME = 10 * 1000;

function drawUI(etaData) {
    if(pauseUIUpdate) return;
    
    // Promo is responsive for cycling the language, so let it go first
    PROMO.draw(etaData, cycleLanguage, () => {
        marquee.startScroll = Date.now();
    }, (newVisibility) => arrivalVisibility = newVisibility);
    HEADER_BAR.draw();
    
    $('body').css('--route-color', getRoute(SETTINGS.route).color);
    
    if(SETTINGS.direction == "BOTH_SPLIT") {
        $(".divider").show();
    } else {
        $(".divider").hide();
    }

    let entryIndex = 0;
    $('#arrivalOverlay > tbody > tr').each(function(i) {
        const thisRowIsVisible = arrivalVisibility[i];
        const thisRowHaveETA = entryIndex <= etaData.length - 1 && etaData[entryIndex] != null;

        let arrivalEntryValid = null;
        // ETA is not displayed if first train is over 20 min.
        do {
            arrivalEntryValid = SETTINGS.debugMode ? true : (etaData[0]?.ttnt <= SETTINGS.firstTrainCutoff && isArrivalEntryValid(etaData[entryIndex]));
            if(etaData[entryIndex] == null) break;
            if(!arrivalEntryValid) entryIndex++;
        } while(!arrivalEntryValid);
            
        let entry = etaData[entryIndex];

        if (!thisRowIsVisible || !thisRowHaveETA || !arrivalEntryValid || entry == null) {
            $(this).replaceWith(`<tr><td class="destination">&nbsp;</td><td style="width:10%">&nbsp;</td><td class="eta">&nbsp;</td></tr>`);
            return;
        }
        
        let pidsOverrideData = entry.via ? PIDS_OVERRIDE_DATA[SETTINGS.route]?.[SETTINGS.station] ?? PIDS_OVERRIDE_DATA[SETTINGS.route].default : null;
        let fullDestinationName = specialCaseDestination(entry.dest);

        let destinationName;
        if(entry.via) {
            let destinationName = switchLang(fullDestinationName);
            destinationName = `${destinationName}<span class="${pidsOverrideData?.viaSmall && Chinese.test(destinationName) ? "via-zh" : ""}">${switchLang(pidsOverrideData.via)}</span>${switchLang(pidsOverrideData.name)}`;
        } else {
            destinationName = switchLang(fullDestinationName);
        }

        let timetext = "";
        let time = "";

        if (SETTINGS.displayMode == DisplayMode.NT4_CT) {
            time = getETAtime(entry.ttnt, entry.absTime, entry.isDeparture);
        } else {
            time = getETAmin(entry.ttnt, entry.isDeparture);

            if(entry.ttnt == 0) {
                timetext = "";
            } else if(entry.ttnt == 1) {
                timetext = entry.isDeparture ? "正在離開|Departing" : "即將抵達|Arriving";
            } else {
                timetext = "分鐘|min";
            }
        }

        let tableRow = "";
        const lrtElement = entry.route.isLRT ? `<span class="lrt-route" style="border-color: ${entry.route.secondaryColor}">${entry.route.initials}</span>` : "";
        const platformElement = SETTINGS.showPlatform ? `<td class="plat"><span class="plat-circle" style="background-color: ${entry.route.color}">${entry.plat}</span></td>` : `<td class="plat"></td>`;
        const ETAElement = `<td class="eta scalable">${time} <span class="etamin">${switchLang(timetext)}</span></td>`
        const destElement = `<td class="destination scalable">${lrtElement}<div class="destination-name">${destinationName}</div></td>`;

        tableRow += destElement;
        tableRow += platformElement;
        tableRow += ETAElement;

        tableRow = `<tr>${tableRow}</tr>`

        $(this).replaceWith(tableRow);
        entryIndex++;
    });

    changeUIPreset();
    adjustLayoutSize();
}

/* Show "Airport & AsiaWorld-Expo" before Airport Station */
function specialCaseDestination(str) {
    if(str == "博覽館|AsiaWorld–Expo" && SETTINGS.station != "AIR" && SETTINGS.station != "AWE") {
        return "機場及博覽館|Airport & AsiaWorld–Expo";
    }
    return str;
}

let animFrame = null;

/* This function puts the arrival destination text into a hidden element to calculate the width and make changes accordingly */
/* Hacky solution, but if it works then it works. */
function adjustLayoutSize() {
    $('.destination').each(function() {
        let isMarquee = (PIDS_OVERRIDE_DATA?.[SETTINGS.route]?.[SETTINGS.station] ?? PIDS_OVERRIDE_DATA[SETTINGS.route]?.default)?.marquee;

        const ogSize = SETTINGS.uiPreset.fontRatio * parseInt($(this).css("font-size"));
        const PADDING = 120 * (window.innerWidth / 1920);
        const tdWidth = $(this).outerWidth(true) - PADDING;
        let percentW = 1;
        
        $('#check-content').html($(this).html());
        $('#check-content').css("font-size", ogSize);
        $('#check-content').css("font-family", $(this).css("font-family"));
        $("#check-content").css("letter-spacing", $(this).css("letter-spacing"));
        $("#check-content").css("font-weight", $(this).css("font-weight"));
        
        let resultWidth = $('#check-content').outerWidth(true);
        
        if (resultWidth > tdWidth) {
            percentW = (tdWidth / resultWidth);

            if(isMarquee) {
                $(this).find(".destination-name").addClass("marquee");
            } else {
                $(this).css("font-size", `${ogSize * (percentW)}px`);
            }
        } else {
            $(this).removeClass("marquee");
            $(this).css("font-size", `${ogSize}px`);   
        }
    });

    if(document.querySelectorAll(".marquee").length > 0) {
        if(animFrame == null) {
            animFrame = requestAnimationFrame(startMarqueeLoop);
        }
    } else {
        if(animFrame != null) {
            cancelAnimationFrame(animFrame);
            animFrame = null;
        };
    }
}

const marquee = {
    progress: 100,
    startScroll: -1
}

function startMarqueeLoop() {
    let endScroll = marquee.startScroll + MARQUEE_SCROLL_TIME;
    let scrollProgress = (Date.now() - marquee.startScroll) / (endScroll - marquee.startScroll);

    marquee.progress = scrollProgress * 105; // +5 for padding
    let translationPercentage = (-marquee.progress * 2) + 100;

    document.querySelectorAll(".marquee").forEach(e => {
        e.style.transform = `translateX(${translationPercentage}%)`
    });
    animFrame = requestAnimationFrame(startMarqueeLoop);
}

function getETAmin(eta, departure) {
    if (eta == 0 || eta == 1) {
        return "";
    }
    // MTR PIDS clamp eta at 99
    if(eta > 99) return "99";
    return eta;
}

function getETAtime(ttnt, absTime, departure) {
    let arrivalDate = absTime ?? new Date(Date.now() + (ttnt * 1000 * 60));
    return arrivalDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false
    });
}

function isArrivalEntryValid(arrivalEntry) {
    return arrivalEntry == null || arrivalEntry.plat.length > 0 && arrivalEntry.dest.length > 0 && !isNaN(parseInt(arrivalEntry.ttnt))
    && (arrivalEntry.dest != "不載客列車|Not in Service" || parseInt(arrivalEntry.ttnt) <= 1);
}

function switchLang(str) {
    let targetLang = languageCycle;
    
    let name = str.split("|");
    return name[targetLang % name.length];
}

function cycleLanguage() {
    languageCycle++;
}

function changeUIPreset() {
    let preset = UIPreset[SETTINGS.route] ?? UIPreset["default"];

    $("body").css("--font-weight", preset.fontWeight);
    $("body").css("--platcircle-family", preset.platformCircle);

    $(".destination").each(function() {
        let isChinese = Chinese.test($(this).text());
        if (isChinese) {
            $(this).css("letter-spacing", preset.chinFontSpacing);
        } else {
            $(this).css("letter-spacing", `normal`);
        }
    });

    SETTINGS.uiPreset = preset;
}

function setupDebugKeybind() {
    $(window).on('keydown', function(e) {
        /* G key */
        if (e.which == 71 && SETTINGS.debugMode) {
            PROMO.cycle();
            PROMO.draw([], cycleLanguage, (newVisibility) => arrivalVisibility = newVisibility);
            cycleLanguage();
            drawUI([]);
        }

        if(e.which == 70 && SETTINGS.debugMode) {
            pauseUIUpdate = !pauseUIUpdate;
        }
    });
}

async function setup() {
    await HEADER_BAR.setup();
    PROMO.setup()
    setupDebugKeybind();
}

export default {setup, draw: drawUI, switchLang: switchLang, cycleLanguage };