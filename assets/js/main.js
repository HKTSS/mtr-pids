'use strict'

import API from './api.js'
import CONFIG_PANEL from './config_panel.js'
import SETTINGS from './static/settings.js';
import UI from './ui.js'

let arrivalData = [];

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

async function fetchETAData() {
    let api = SETTINGS.route.api;
    if (api == ETA_API.NONE || SETTINGS.dpMode == DisplayMode.AD) return;

    return API.fetchData(api, SETTINGS.route.initials, SETTINGS.stn.initials, SETTINGS.direction);
}

export async function updateData() {
    if (!SETTINGS.onlineMode) {
        arrivalData = SETTINGS.customArrivalData;
    } else {
        let newArrivalData = await fetchETAData();
        if (newArrivalData != null) {
            arrivalData = newArrivalData;
        }
    }
    UI.updateETAData(arrivalData);
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

$(document).ready(function() {
    parseQuery();
    setDefaultConfig();
    
    updateData();
    setInterval(updateData, 15 * 1000, false);
    
    CONFIG_PANEL.setup();
    UI.setup();

    UI.draw();
    setInterval(UI.draw, 1 * 1000, true);
});

$(window).on('keydown', function(e) {
    /* G key */
    if (e.which == 71 && SETTINGS.debugMode) {
        PROMO.cycle()
        PROMO.draw(arrivalData, cycleLanguage, (newVisibility) => arrivalVisibility = newVisibility)
        UI.cycleLanguage();
        UI.draw();
    }
});

export default { };