'use strict'

import SETTINGS from './static/settings.js';
import API from './api.js'

let arrivalVisibility = [true, true, true, true];
let nextAdvTime;
let languageCycle = 0;
let arrivalData = [];
let currentAdvId = 0;

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

        $('.widthCheck').html($(this).html())
        $('.widthCheck').css("font-size", ogSize);
        $('.widthCheck').css("font-family", $(this).css("font-family"));
        $(".widthCheck").css("letter-spacing", $(this).css("letter-spacing"));
        $(".widthCheck").css("font-weight", $(this).css("font-weight"));

        let resultWidth = $('.widthCheck').width();

        if (resultWidth > tdWidth) {
            percentW = (tdWidth / resultWidth);
        }

        $(this).css("font-size", `${ogSize * (percentW)}px`);
    });

    let etaMaxSize = 0;

    $('.eta').each(function() {
        const ogSize = SETTINGS.uiPreset.fontRatio * parseInt($(this).css("font-size"));
        const PADDING = 20 * (window.innerWidth / 1920);
        const tdWidth = $(this).width();

        $('.widthCheck').html($(this).html())
        $('.widthCheck').css("font-size", ogSize);
        $('.widthCheck').css("font-family", $(this).css("font-family"));
        $(".widthCheck").css("letter-spacing", $(this).css("letter-spacing"));
        $(".widthCheck").css("font-weight", $(this).css("font-weight"));

        let resultWidth = Math.max($('.widthCheck').width() + PADDING, tdWidth);
        etaMaxSize = Math.max(etaMaxSize, resultWidth);
    });

    $('body').css("--eta-width", `${etaMaxSize}px`);
}

function parseQuery() {
    let params = (new URL(document.location)).searchParams;
    let lang = params.get("lang");
    if (lang == null) return;

    if (lang == 'en' || lang == 'zh') {
        SETTINGS.UILang = lang;
        $(`#langchoose`).text(lang == 'EN' ? 'EN' : '中');
    }
}

function drawUI() {
    /* Draw focus back to the main window instead of the advertisement iframe */
    window.focus();
    renderAdv();

    $("body").css("--route-color", `#${SETTINGS.route.color}`);

    let entryIndex = 0;
    $('#arrivalOverlay > tbody > tr').each(function (i) {
        let thisRowIsVisible = arrivalVisibility[i];
        let arrivalEntryValid = entryIndex <= arrivalData.length - 1 && arrivalData[entryIndex] != null;

        if (!thisRowIsVisible || !arrivalEntryValid) {
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
        let time = getETAmin(entry.ttnt, false);

        if (entry.isDeparture == true) {
            if (entry.ttnt == 0) {
                timetext = "正在離開|Departing";
            } else {
                timetext = "分鐘|min";
            }
        } else {
            if (entry.ttnt == 0) {
                timetext = "";
            } else if (entry.ttnt == 1) {
                timetext = "即將抵達|Arriving";
            } else {
                timetext = "分鐘|min";
            }
        }

        let tableRow = "";
        const lrtElement = entry.route.isLRT ? `<span class="lrtrt" style="border-color:#${entry.route.color}">${entry.route.initials}</span>` : ""
        const platformElement = SETTINGS.showPlatform ? `<td class="plat"><span class="platcircle">${entry.plat}</span></td>` : `<td class="plat"></td>`
        const ETAElement = `<td class="eta scalable">${time} <span class="etamin">${switchLang(timetext)}</span></td>`
        const destElement = `<td class="destination scalable">${lrtElement}${stationName}</td>`

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
    return eta;
}

function cycleLanguage() {
    languageCycle++;
    changeUIPreset();
}

async function fetchETAData() {
    let api = SETTINGS.route.api;
    if (SETTINGS.configOpened || api == ETA_API.NONE || SETTINGS.dpMode == DisplayMode.AD) return;
 
    if(api == ETA_API.MTR_LR) {
        return API.getLightRail(SETTINGS.route.initials, SETTINGS.stn.initials);
    }

    if (api == ETA_API.MTR_OPEN || api == ETA_API.MTR) {
        return API.getMTRHeavyRail(api, SETTINGS.route.initials, SETTINGS.stn.initials, SETTINGS.direction);
    }

    if (api == ETA_API.METRO_RIDE) {
        return API.getMetroRide(SETTINGS.route.initials, SETTINGS.stn.MRCode, SETTINGS.direction);
    }

    if(api == ETA_API.HKT) {
        return API.getHKTramways(SETTINGS.stn.initials, SETTINGS.direction);
    }
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
        SETTINGS.route = RouteList.TCL;
        SETTINGS.uiPreset = UIPreset.default;
        SETTINGS.direction = "UP";
        SETTINGS.stn = StationCodeList.get("HOK");
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

        let defPreset = UIPreset.default;
        defPreset.fontRatio = customFontRatio;
        SETTINGS.uiPreset = defPreset;

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

function cycleAdv() {
    if (currentAdvId + 1 < advData.cycle.length) {
        currentAdvId++
    } else {
        currentAdvId = 0;
    }
    let nextAdCycle = advData.cycle[currentAdvId]
    nextAdvTime = Date.now() + nextAdCycle.duration;
}

function renderAdv(firstLoad) {
    if (firstLoad) {
        nextAdvTime = Date.now();
    }

    let nextAdCycle = advData.cycle[currentAdvId];
    if (Date.now() >= nextAdvTime) {
        cycleAdv();
        renderAdv(false);
        cycleLanguage();
    }

    if (SETTINGS.dpMode == DisplayMode.NT4 && !SETTINGS.showingSpecialMessage) {
        arrivalVisibility = [true, true, true, true];
        $('#advertisement').hide();
        return;
    } else {
        $('#advertisement').show();
    }

    if (nextAdCycle.isPaxLoad && !SETTINGS.route.hasPaxLoad) {
        cycleAdv();
        renderAdv();
    }

    if (nextAdCycle.framesrc == null && (SETTINGS.dpMode == DisplayMode.AD || SETTINGS.dpMode == DisplayMode.ADNT1)) {
        cycleAdv();
        renderAdv();
    }

    if (SETTINGS.showingSpecialMessage) {
        nextAdCycle = advData.special.filter(e => e.id == SETTINGS.specialMsgID)[0];
    }

    for (const adv of advData.cycle) {
        $(`.promo-${adv.id}`).hide()
    }

    for (const adv of advData.special) {
        $(`.promo-${adv.id}`).hide()
    }

    if (nextAdCycle.framesrc == null && !SETTINGS.showingSpecialMessage) {
        arrivalVisibility = [true, true, true, true];
        $('#advertisement').hide();
    } else {
        $('#advertisement').show();
        $(`.promo-${nextAdCycle.id}`).show();
        arrivalVisibility = [false, false, false, true];
    }

    if (SETTINGS.dpMode == DisplayMode.AD) {
        arrivalVisibility = [false, false, false, false];
    }

    if (SETTINGS.showingSpecialMessage) {
        let fullURL = nextAdCycle.framesrc + nextAdCycle.queryString;
        let needRefresh = false;
        $('#advertisement').show()
        if ($(`.promo-${nextAdCycle.id}`).length > 0) {
            if (fullURL != $(`.promo-${nextAdCycle.id}`).attr("src")) {
                needRefresh = true;
            }
        }

        if (needRefresh) {
            $(`.promo-${nextAdCycle.id}`).attr("src", fullURL);
            $(`.promo-${nextAdCycle.id}`).show();
        }
        return;
    }

    if (firstLoad) {
        $('#advertisement').empty();
        for (const cate in advData) {
            for (const adv of advData[cate]) {
                if (adv.framesrc != null) {
                    $('#advertisement').append(`<iframe style="display:block" class="promo-${adv.id} centeredItem" src=${adv.framesrc}></iframe>`);
                }
            }
        }
    }

    if (nextAdCycle.isPaxLoad) {
        let paxArray = []
        if (arrivalData[0] ?.paxLoad ?.length > 1) {
            for (let pax of arrivalData[0].paxLoad) {
                paxArray.push(pax.availability);
            }
            let firstClassCar = arrivalData[0].firstClassCar ? arrivalData[0].firstClassCar : 0;

            let curURL = $(`.promo-${nextAdCycle.id}`).attr("src");
            let fullURL = `${nextAdCycle.framesrc}?data=${paxArray.join(",")}&firstClass=${firstClassCar}`
            if (curURL == fullURL) return;

            $(`.promo-${nextAdCycle.id}`).attr("src", fullURL);
        } else {
            cycleAdv();
            renderAdv();
        }
    }
}

function changeUIPreset() {
    let preset = UIPreset[SETTINGS.route.initials] || UIPreset["default"];

    $('#titleOverlay').css(`width`, `${preset.titleWidth}%`);
    $('#arrivalOverlay').css(`width`, `${preset.ETAWidth}%`);
    $("body").css("--font-weight", preset.fontWeight);
    $("body").css("--platcircle-family", preset.platformCircle);
    $("body").css(`--title-family`, preset.title);
    $("body").css("--dest-family", preset.arrivals);
    $("body").css("--eta-family", preset.eta);

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
    renderAdv(true);
    updateData(true);
    setInterval(updateData, 10 * 1000, false);
    setInterval(drawUI, 1 * 1000);
})

$(window).on('keydown', function(e) {
    /* G key */
    if (e.which == 71 && SETTINGS.debugMode) {
        cycleAdv()
        renderAdv()
        drawUI()
    }
})
