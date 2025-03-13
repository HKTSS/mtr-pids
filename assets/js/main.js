'use strict'

import SETTINGS from './static/settings.js';
import API from './api.js'
import TITLEBAR from './titlebar.js'

let arrivalVisibility = [true, true, true, true];
let nextPromoSwap = 0;
let languageCycle = 0;
let arrivalData = [];
let currentPromoScreen = 0;

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
    if (lang == null) return;

    if (lang == 'en' || lang == 'zh') {
        SETTINGS.UILang = lang;
        $(`#langchoose`).text(lang == 'EN' ? 'EN' : '中');
    }
}

function drawUI() {
    /* Draw focus back to the main window instead of the promotion iframe */
    window.focus();
    $('body').css('--route-color', "#" + SETTINGS.route.color);
    
    TITLEBAR.draw();
    renderPromo();
    
    if(arrivalData[0]?.paxLoad?.length == 1) {
        $(".notice-paxload").css('visibility', 'visible');
    } else {
        $(".notice-paxload").css('visibility', 'hidden');
    }

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
        const lrtElement = entry.route.isLRT ? `<span class="lrt-route" style="border-color:#${entry.route.secondaryColor}">${entry.route.initials}</span>` : ""
        const platformElement = SETTINGS.showPlatform ? `<td class="plat"><span class="plat-circle" style="background-color: #${entry.route.color}">${entry.plat}</span></td>` : `<td class="plat"></td>`
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
    changeUIPreset();
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

function cyclePromo() {
    if (currentPromoScreen + 1 < promotionData.cycle.length) {
        currentPromoScreen++
    } else {
        currentPromoScreen = 0;
    }
    let nextPromo = promotionData.cycle[currentPromoScreen]
    nextPromoSwap = Date.now() + nextPromo.duration;
}

function renderPromo() {
    let nextPromoCycle = promotionData.cycle[currentPromoScreen];
    let needRerender = false;
    if (Date.now() >= nextPromoSwap) {
        cyclePromo();
        cycleLanguage();
        needRerender = true;
    }

    if ((SETTINGS.dpMode == DisplayMode.NT4 || SETTINGS.dpMode == DisplayMode.NT4_CT) && !SETTINGS.showingSpecialMessage) {
        arrivalVisibility = [true, true, true, true];
        $('#promo').hide();
        return;
    } else {
        $('#promo').show();
    }

    if (nextPromoCycle.framesrc == null && (SETTINGS.dpMode == DisplayMode.AD || SETTINGS.dpMode == DisplayMode.ADNT1)) {
        cyclePromo();
        needRerender = true;
    }

    if (SETTINGS.showingSpecialMessage) {
        nextPromoCycle = promotionData.special.filter(e => e.id == SETTINGS.specialMsgID)[0];
    }

    for (const promo of promotionData.cycle) {
        $(`.promo-${promo.id}`).hide()
    }

    for (const promo of promotionData.special) {
        $(`.promo-${promo.id}`).hide()
    }

    if (nextPromoCycle.framesrc == null && !SETTINGS.showingSpecialMessage) {
        arrivalVisibility = [true, true, true, true];
        $('#promo').hide();
    } else {
        $('#promo').show();
        $(`.promo-${nextPromoCycle.id}`).show();
        arrivalVisibility = [false, false, false, true];
    }
    
    if (SETTINGS.dpMode == DisplayMode.AD) {
        $('#promo').addClass("promo-full");
        arrivalVisibility = [false, false, false, false];
    } else {
        $('#promo').removeClass("promo-full");
    }

    if (SETTINGS.showingSpecialMessage) {
        let fullURL = nextPromoCycle.framesrc + nextPromoCycle.queryString;
        let needRefreshPromoSrc = false;
        $('#promo').show();
        if ($(`.promo-${nextPromoCycle.id}`).length > 0) {
            if (fullURL != $(`.promo-${nextPromoCycle.id}`).attr("src")) {
                needRefreshPromoSrc = true;
            }
        }

        if (needRefreshPromoSrc) {
            $(`.promo-${nextPromoCycle.id}`).attr("src", fullURL);
            $(`.promo-${nextPromoCycle.id}`).show();
        }
    }

    if (nextPromoCycle.isPaxLoad) {
        let paxArray = []
        if (arrivalData[0] ?.paxLoad ?.length > 1) {
            for (let pax of arrivalData[0].paxLoad) {
                paxArray.push(pax.availability);
            }
            let firstClassCar = arrivalData[0].firstClassCar ? arrivalData[0].firstClassCar : 0;

            let curURL = $(`.promo-${nextPromoCycle.id}`).attr("src");
            let fullURL = `${nextPromoCycle.framesrc}?data=${paxArray.join(",")}&firstClass=${firstClassCar}`
            if (curURL == fullURL) return;

            $(`.promo-${nextPromoCycle.id}`).attr("src", fullURL);
        } else {
            cyclePromo();
            needRerender = true;
        }
    }

    if(needRerender) {
        renderPromo();
        return;
    }
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

    $('#promo').empty();
    for (const cate in promotionData) {
        for (const promo of promotionData[cate]) {
            if (promo.framesrc != null) {
                $('#promo').append(`<iframe style="display:block" class="promo-${promo.id} centeredItem" src=${promo.framesrc}></iframe>`);
            }
        }
    }

    setInterval(updateData, 15 * 1000, false);
    setInterval(drawUI, 1 * 1000, true);
    drawUI();
})

$(window).on('keydown', function(e) {
    /* G key */
    if (e.which == 71 && SETTINGS.debugMode) {
        cyclePromo()
        renderPromo()
        drawUI()
    }
})

export default {switchLang: switchLang};