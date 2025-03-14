'use strict'

import SETTINGS from './static/settings.js';
import API from './api.js'
import TITLEBAR from './titlebar.js'
import PROMO from './promo.js'

let arrivalVisibility = [true, true, true, true];
let languageCycle = 0;
let arrivalData = [];
let cycleShowTtnt = false;

function switchLang(str) {
    let targetLang = languageCycle;

    let name = str.split("|");
    return name[targetLang % name.length];
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

function parseQuery() {
    let params = (new URL(document.location)).searchParams;
    let lang = params.get("lang");

    if (lang == 'en' || lang == 'zh') {
        SETTINGS.UILang = lang;
        $(`#langchoose`).text(lang == 'EN' ? 'EN' : '中');
    }
    
    if(params.has("debug")) {
        SETTINGS.debugMode = true;
    }
}

function drawUI() {
    // Promo is responsive for cycling the language, so let it go first
    PROMO.draw(arrivalData, cycleLanguage, (newVisibility) => arrivalVisibility = newVisibility);
    TITLEBAR.draw();
    
    $('body').css('--route-color', "#" + SETTINGS.route.color);
    
    if(SETTINGS.direction == "BOTH_SPLIT") {
        $(".divider").show();
    } else {
        $(".divider").hide();
    }
    
    const isPaxUpdating = arrivalData[0]?.paxLoad?.length == 1;
    $(".notice-paxload").css('visibility', isPaxUpdating ? 'visible' : 'hidden');

    let entryIndex = 0;
    $('#arrivalOverlay > tbody > tr').each(function(i) {
        const thisRowIsVisible = arrivalVisibility[i];
        const thisRowHaveETA = entryIndex <= arrivalData.length - 1 && arrivalData[entryIndex] != null;
        
        // ETA is not displayed if first train is over 20 min.
        const arrivalEntryValid = SETTINGS.debugMode ? true : arrivalData[0]?.ttnt <= 20; 

        if (!thisRowIsVisible || !thisRowHaveETA || !arrivalEntryValid) {
            $(this).replaceWith(`<tr><td class="destination">&nbsp;</td><td style="width:10%">&nbsp;</td><td class="eta">&nbsp;</td></tr>`);
            return;
        }

        let entry = arrivalData[entryIndex];
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
                timetext = entry.isDeparture ? "正在離開|Departing" : "";
            } else if(entry.ttnt == 1) {
                timetext = entry.isDeparture ? "分鐘|min" : "即將抵達|Arriving";
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

function getETAmin(eta, departure) {
    if (eta == 0 || (eta == 1 && !departure)) {
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

async function fetchETAData() {
    let api = SETTINGS.route.api;
    if (SETTINGS.configOpened || api == ETA_API.NONE || SETTINGS.dpMode == DisplayMode.AD) return;

    return API.fetchData(api, SETTINGS.route.initials, SETTINGS.stn.initials, SETTINGS.direction);
}

export async function updateData(forced) {
    if (SETTINGS.configOpened && !forced) return;
    if (!SETTINGS.onlineMode) {
        arrivalData = SETTINGS.customArrivalData;
    } else {
        let newArrivalData = await fetchETAData();
        if (newArrivalData == null) return;
    
        arrivalData = newArrivalData;
    }

    
    drawUI();
}

function setDefaultConfig() {
    if (SETTINGS.onlineMode) {
        SETTINGS.route = Object.values(RouteList)[0];
        SETTINGS.stn = StationCodeList.get(SETTINGS.route.stations[0]);
        SETTINGS.uiPreset = UIPreset.default;
        SETTINGS.direction = "UP";
    } else {
        let customFontRatio = $('.fontRatioCustom').val();
        let customRTColor = $('.rtColor').val();

        if (!parseFloat(customFontRatio)) {
            customFontRatio = 1;
        } else {
            customFontRatio = parseFloat(customFontRatio)
        }

        if (!$('.rtColor').val()) {
            customRTColor = '000000';
        }

        SETTINGS.route = new Route("CUSTOM", ETA_API.NONE, "Custom Route", customRTColor, false, false);

        let defaultPreset = UIPreset.default;
        defaultPreset.fontRatio = customFontRatio;
        SETTINGS.uiPreset = defaultPreset;

        let customArrivalData = [];
        for (let i = 0; i < 4; i++) {
            let destination = $(`#dest${i + 1}`).val();
            let platform = $(`#plat${i + 1}`).val();
            let timetilnexttrain = $(`#ttnt${i + 1}`).val();

            if (!destination && !platform && !timetilnexttrain) {
                customArrivalData.push(null);
                continue;
            }

            if (!platform) platform = 1;
            if (!timetilnexttrain) timetilnexttrain = 0;

            customArrivalData.push(new ArrivalEntry(destination, timetilnexttrain, SETTINGS.route, platform, false, false));
        }

        arrivalData = customArrivalData;
    }

    let specialMsgID = $('.specialMsg').val() == null ? null : $('.specialMsg').val();

    if (specialMsgID != null) {
        SETTINGS.showingSpecialMessage = true;
        SETTINGS.specialMsgID = specialMsgID;
    } else {
        SETTINGS.showingSpecialMessage = false;
        SETTINGS.specialMsgID = null;
    }

    SETTINGS.dpMode = DisplayMode[$('.dpMode').val()];
    SETTINGS.showPlatform = $('.showPlat').is(':checked')
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

$(document).ready(function() {
    parseQuery();
    setDefaultConfig();
    updateData(true);

    setInterval(updateData, 15 * 1000, false);
    setInterval(drawUI, 1 * 1000, true);
    drawUI();
})

$(window).on('keydown', function(e) {
    /* G key */
    if (e.which == 71 && SETTINGS.debugMode) {
        PROMO.cycle()
        PROMO.draw(arrivalData, cycleLanguage, (newVisibility) => arrivalVisibility = newVisibility)
        cycleLanguage();
        drawUI();
    }
})

export default {switchLang: switchLang};