'use strict'

import SETTINGS from './static/settings.js';
import HEADER_BAR from './header_bar.js'
import PROMO from './promo.js'

let arrivalVisibility = [true, true, true, true];
let languageCycle = 0;
let cycleShowTtnt = false;
let etaData = [];

function drawUI() {
    // Promo is responsive for cycling the language, so let it go first
    PROMO.draw(etaData, cycleLanguage, (newVisibility) => arrivalVisibility = newVisibility);
    HEADER_BAR.draw();
    
    $('body').css('--route-color', "#" + SETTINGS.route.color);
    
    if(SETTINGS.direction == "BOTH_SPLIT") {
        $(".divider").show();
    } else {
        $(".divider").hide();
    }
    
    const isPaxUpdating = etaData[0]?.paxLoad?.length == 1;
    $(".notice-paxload").css('visibility', isPaxUpdating ? 'visible' : 'hidden');

    let entryIndex = 0;
    $('#arrivalOverlay > tbody > tr').each(function(i) {
        const thisRowIsVisible = arrivalVisibility[i];
        const thisRowHaveETA = entryIndex <= etaData.length - 1 && etaData[entryIndex] != null;
        
        // ETA is not displayed if first train is over 20 min.
        const arrivalEntryValid = SETTINGS.debugMode ? true : etaData[0]?.ttnt <= 20; 

        if (!thisRowIsVisible || !thisRowHaveETA || !arrivalEntryValid) {
            $(this).replaceWith(`<tr><td class="destination">&nbsp;</td><td style="width:10%">&nbsp;</td><td class="eta">&nbsp;</td></tr>`);
            return;
        }

        let entry = etaData[entryIndex];
        let viaData = entry.via ? ViaData[SETTINGS.route.initials]?.[SETTINGS.stn.initials] : null;
        let stationName;
        if(entry.via) {
            stationName = `${switchLang(entry.dest)}${switchLang(viaData.via)}${switchLang(viaData.name)}`;
        } else {
            stationName = switchLang(entry.dest);
        }

        let timetext = "";
        let time = "";

        if (SETTINGS.dpMode == DisplayMode.NT4_CT) {
            time = getETAtime(entry.time, entry.isDeparture);
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
        const lrtElement = entry.route.isLRT ? `<span class="lrt-route" style="border-color:#${entry.route.secondaryColor}">${entry.route.initials}</span>` : "";
        const platformElement = SETTINGS.showPlatform ? `<td class="plat"><span class="plat-circle" style="background-color: #${entry.route.color}">${entry.plat}</span></td>` : `<td class="plat"></td>`;
        const ETAElement = `<td class="eta scalable">${time} <span class="etamin">${switchLang(timetext)}</span></td>`
        const destElement = `<td class="destination scalable">${lrtElement}${stationName}</td>`;

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

/* This function puts the arrival destination text into a hidden element to calculate the width and make changes accordingly */
/* Hacky solution, but if it works then it works. */
function adjustLayoutSize() {
    $('.destination').each(function() {
        if(SETTINGS.stn.marquee) {
            return;
        }
        
        const ogSize = SETTINGS.uiPreset.fontRatio * parseInt($(this).css("font-size"));
        const PADDING = 80 * (window.innerWidth / 1920);
        const tdWidth = $(this).width() - PADDING;
        let percentW = 1;
        
        $('#widthCheck').html($(this).html())
        $('#widthCheck').css("font-size", ogSize);
        $('#widthCheck').css("font-family", $(this).css("font-family"));
        $("#widthCheck").css("letter-spacing", $(this).css("letter-spacing"));
        $("#widthCheck").css("font-weight", $(this).css("font-weight"));
        
        let resultWidth = $('#widthCheck').width();
        
        if (resultWidth > tdWidth) {
            percentW = (tdWidth / resultWidth);
        }
        
        $(this).css("font-size", `${ogSize * (percentW)}px`);
    });
}

function switchLang(str) {
    let targetLang = languageCycle;
    
    let name = str.split("|");
    return name[targetLang % name.length];
}

function getETAmin(eta, departure) {
    if (eta == 0 || eta == 1) {
        return "";
    }
    // MTR PIDS clamp eta at 99
    if(eta > 99) return "99";
    return eta;
}

function getETAtime(time, departure) {
    return time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false
    });
}

function cycleLanguage() {
    languageCycle++;
}

function updateETAData(newData) {
    etaData = newData;
}

function changeUIPreset() {
    let preset = UIPreset[SETTINGS.route.initials] ?? UIPreset["default"];

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
            PROMO.cycle()
            PROMO.draw(etaData, cycleLanguage, (newVisibility) => arrivalVisibility = newVisibility)
            cycleLanguage();
            drawUI();
        }
    });
}

function setup() {
    HEADER_BAR.setup();
    PROMO.setup();
    setupDebugKeybind();
}

export default {setup: setup, draw: drawUI, switchLang: switchLang, cycleLanguage: cycleLanguage, updateETAData: updateETAData};