'use strict'

import SETTINGS from './static/settings.js';
import { updateData } from './main.js';

let languageCycle = 0;

function switchLang(str) {
    let targetLang = SETTINGS.UILang;
    if (targetLang == Lang.ENGLISH) {
        return str.split("|").length > 0 ? str.split("|")[1] : str.split("|")[0];
    } else {
        return str.split("|")[0];
    }
}

function toggleVisibility() {
    $('.config').fadeToggle(150, function() {
        if (this.style.display == 'block') {
            SETTINGS.configOpened = true;
        } else {
            SETTINGS.configOpened = false;
            saveConfig();
            updateData(true);
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

    for (const adv of advData.special) {
        $(`.specialMsg > option[value="${adv.id}"]`).text(`${switchLang(adv.name)}`);
    }

    $('.direction > option').each(function() {
        if (!SETTINGS.route.directionInfo || SETTINGS.route.directionInfo.length < 2) return;
        let UPTerminus = StationCodeList.get(SETTINGS.route.directionInfo[0]);
        let DNTerminus = StationCodeList.get(SETTINGS.route.directionInfo[1]);
        let Text = switchLang("往 |To ")

        if ($(this).val() == "UP") {
            $(this).text(Text + switchLang(UPTerminus.name));
        } else if ($(this).val() == "DOWN") {
            $(this).text(Text + switchLang(DNTerminus.name));
        } else {
            $(this).text(switchLang("雙向|Both"));
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
        let customRTColor = $('.rtColor').val()

        if (!parseFloat(customFontRatio)) {
            customFontRatio = 1;
        } else {
            customFontRatio = parseFloat(customFontRatio)
        }

        if (!$('.rtColor').val()) {
            customRTColor = '000000';
        }

        SETTINGS.route = new Route("CUSTOM", ETA_API.NONE, "Custom Route", customRTColor, false, false)

        let defPreset = UIPreset["default"]
        defPreset.fontRatio = customFontRatio
        SETTINGS.uiPreset = defPreset;

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

            customArrivalData.push(new ArrivalEntry(destination, timetilnexttrain, SETTINGS.route, platform, false, false));
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

    SETTINGS.dpMode = DisplayMode[$('.dpMode').val()];
    SETTINGS.showPlatform = $('.showPlat').is(':checked')
}

function setupUI() {
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

    $('.route').empty()
    for (const key in RouteList) {
        if (RouteList[key].hidden) continue;
        $('.route').append(`<option value="${key}">${switchLang(RouteList[key].name)}</option>`)
    }

    $('.specialMsg').empty();
    for (const adv of advData.special) {
        $('.specialMsg').append(`<option value="${adv.id}">${switchLang(adv.name)}`);
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

function error(text) {
    $('#error').show();
    $('#error').text(text);
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

$(document).ready(async function() {
    setupUI();
    saveConfig();
    registerUIControlEvent();
    updateUILanguage(SETTINGS.UILang);
});

$(window).on('keydown', function(e) {
    /* Enter key */
    if (e.which == 13) {
        toggleVisibility()
    }
})