'use strict'

import SETTINGS from './static/settings.js';
import UI from './ui.js';
import { updateData } from './main.js';

let configOpened = false;

function switchLang(str) {
    let targetLang = SETTINGS.UILang;
    if (targetLang == Lang.ENGLISH) {
        return str.split("|").length > 0 ? str.split("|")[1] : str.split("|")[0];
    } else {
        return str.split("|")[0];
    }
}

function toggleVisibility() {
    $('.config').fadeToggle(150, 'swing', function () {
        if (this.style.display == 'block') {
            configOpened = true;
        } else {
            configOpened = false;
            saveConfig();
            updateData();
            UI.draw();
        }
    });
    

    updateUILanguage(SETTINGS.UILang);
}

function updateUILanguage(lang) {
    $('.lang').hide()
    $('.lang-' + lang).show()

    $('.route > option').each(function() {
        $(this).text(switchLang(RouteList[$(this).val()].name));
    });

    $('.station > option').each(function() {
        $(this).text(switchLang(StationCodeList.get($(this).val()).name));
    });

    $('.dpMode > option').each(function() {
        $(this).text(switchLang(DisplayMode[$(this).val()]))
    })

    for (const promo of promotionData.special) {
        $(`.specialMsg > option[value="${promo.id}"]`).text(`${switchLang(promo.name)}`);
    }

    $('.direction > option').each(function() {
        if (!SETTINGS.route.directionInfo || SETTINGS.route.directionInfo.length < 2) return;
        const UPTerminus = StationCodeList.get(SETTINGS.route.directionInfo[0]);
        const DNTerminus = StationCodeList.get(SETTINGS.route.directionInfo[1]);
        const toText = switchLang("往 |To ");
        
        const thisValue = $(this).val();
        
        if (thisValue == "UP") {
            $(this).text(toText + switchLang(UPTerminus.name));
        } else if (thisValue == "DOWN") {
            $(this).text(toText + switchLang(DNTerminus.name));
        } else if (thisValue == "BOTH") {
            $(this).text(switchLang("雙向|Both"));
        } else {
            $(this).text(switchLang("雙向 (分開)|Both (Split)"));
        }
    });
}

function saveConfig() {
    if (SETTINGS.onlineMode) {
        SETTINGS.route = RouteList[$(`.route`).val()]
        SETTINGS.uiPreset = UIPreset[SETTINGS.route.initials]
        SETTINGS.direction = $('.direction').val()
        SETTINGS.stn = StationCodeList.get($('.station').val())
    } else {
        let customFontRatio = $('.fontRatioCustom').val()
        let customRTColor = $('.rtColor').val().substring(1);

        if (!parseFloat(customFontRatio)) {
            customFontRatio = 1;
        } else {
            customFontRatio = parseFloat(customFontRatio)
        }

        SETTINGS.route = new Route("CST", ETA_API.NONE, "Custom Route", customRTColor, customRTColor, false);

        let defaultPreset = UIPreset["default"];
        defaultPreset.fontRatio = customFontRatio;
        SETTINGS.uiPreset = defaultPreset;

        let customArrivalData = [];
        for (let i = 0; i < 4; i++) {
            let destination = $(`#dest${i + 1}`).val();
            let platform = $(`#plat${i + 1}`).val();
            let timetilnexttrain = $(`#ttnt${i + 1}`).val();

            if (!destination && !platform && !timetilnexttrain) {
                customArrivalData.push(null)
                continue;
            }

            if (!platform) platform = 1;
            if (!timetilnexttrain) timetilnexttrain = 0;

            customArrivalData.push(new ArrivalEntry(destination, timetilnexttrain, new Date(Date.now() + (timetilnexttrain * 1000 * 60)), SETTINGS.route, platform, false, false));
        }

        SETTINGS.customArrivalData = customArrivalData;
    }

    let specialMsgID = $('.specialMsg').val() == null ? 'NONE' : $('.specialMsg').val();

    if (specialMsgID != 'NONE') {
        SETTINGS.showingSpecialMessage = true;
        SETTINGS.specialMsgID = specialMsgID;
    } else {
        SETTINGS.showingSpecialMessage = false;
        SETTINGS.specialMsgID = "NONE";
    }
    
    SETTINGS.rtHeader = $('#routeheader').is(':checked')
    SETTINGS.dpMode = DisplayMode[$('.dpMode').val()];
    SETTINGS.showPlatform = $('.showPlat').is(':checked')
}

function setupUI() {
    $('.route').empty()
    for (const key in RouteList) {
        if (RouteList[key].hidden) continue;
        $('.route').append(`<option value="${key}">${switchLang(RouteList[key].name)}</option>`)
    }
    SETTINGS.route = RouteList[$('.route').val()];
    
    updateStationList();

    $('.dpMode').empty()
    for (const mode in DisplayMode) {
        let modeName = DisplayMode[mode];
        $('.dpMode').append(`<option value=${mode}>${switchLang(modeName)}</option>`)
    }

    if (!document.fullscreenEnabled) {
        $('.tfs').hide();
    }

    $('.specialMsg').empty();
    for (const promo of promotionData.special) {
        $('.specialMsg').append(`<option value="${promo.id}">${switchLang(promo.name)}`);
    }

    /* Debug mode, also show the Config UI by default */
    if (!SETTINGS.debugMode) {
        toggleVisibility();
    } else {
        SETTINGS.dpMode = DisplayMode.NT4
    }
}

function updateStationList() {
    /* Show the corresponding station list of the route */
    $('.station').empty();

    for (const stnCode of SETTINGS.route.stations) {
        $('.station').append(`<option value="${stnCode}">${switchLang(StationCodeList.get(stnCode).name)}`);
    }
    SETTINGS.stn = StationCodeList.get(SETTINGS.route.stations[0]);
}

function registerUIControlEvent() {
    $('.onlineMode').on('change', function() {
        SETTINGS.onlineMode = $(this).is(':checked')
        if (SETTINGS.onlineMode) {
            $(".online").show()
            $(".offline").hide()
            SETTINGS.route = RouteList[$('.route').val()];
        } else {
            $(".online").hide()
            $(".offline").show()
        }
    });

    $('.route').on('change', function() {
        SETTINGS.route = RouteList[$(this).val()];
        updateStationList()
        updateUILanguage(SETTINGS.UILang)

        if (SETTINGS.route.isLRT) {
            $('.direction').prop("disabled", true);
        } else {
            $('.direction').prop("disabled", false);
        }
    });

    $('#langchoose').on('click', function() {
        let toggledLang = SETTINGS.UILang == Lang.ENGLISH ? Lang.CHINESE : Lang.ENGLISH
        SETTINGS.UILang = toggledLang;
        $(`#langchoose`).text(toggledLang == Lang.ENGLISH ? 'EN' : '中')
        updateUILanguage(toggledLang)
    });

    $('.saveCfg').on('click', function() {
        toggleVisibility()
    });

    $('.tfs').on('click', function() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    });
}

function setup() {
    setupUI();
    saveConfig();
    registerUIControlEvent();
    updateUILanguage(SETTINGS.UILang);
    
    $(window).on('keydown', function(e) {
        /* Enter key */
        if (e.key == "Escape") {
            toggleVisibility();
        }
    });
}

export default { setup: setup, toggle: toggleVisibility }