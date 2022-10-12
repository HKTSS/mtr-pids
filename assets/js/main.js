'use strict'

let arrivalVisibility = [true, true, true, true];
let nextAdvTime;
let languageCycle = 0;
let arrivalData = []
let configOpened = false;
let debugMode = false;
let showingSpecialMessage = false;
let currentAdvId = 0;
let marqueeX = 0;

let selectedData = {
    direction: 'UP',
    route: null,
    stn: null,
    onlineMode: true,
    showPlatform: true,
    API: ETA_API.MTR_OPEN,
    uiPreset: null,
    UILang: 'en',
    dpMode: DisplayMode.NORMAL,
    specialMsgID: "NONE"
}

function updateClock() {
    let currDate = new Date();
    let strMin = `${currDate.getMinutes()}`.padStart(2, '0');
    let strHour = `${currDate.getHours()}`.padStart(2, '0');
    $('.clock').text(`${strHour}:${strMin}`);
}

function switchLang(str, isUI = false) {
    if (isUI == true) {
        let targetLang = selectedData.UILang;
        if (targetLang == Lang.ENGLISH) {
            return str.split("|").length > 0 ? str.split("|")[1] : str.split("|")[0];
        } else {
            return str.split("|")[0];
        }
    }

    let targetLang = languageCycle;

    let name = str.split("|");
    return name[targetLang % name.length];
}

/* This function puts the arrival destination text into a hidden element to calculate the width and make changes accordingly */
/* Hacky solution, but if it works then it works. */
function adjustLayoutSize() {
    $('.destination').each(function() {
        if(selectedData.stn.marquee) {
            return;
        }

        const ogSize = selectedData.uiPreset.fontRatio * parseInt($(this).css("font-size"));
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
        const ogSize = selectedData.uiPreset.fontRatio * parseInt($(this).css("font-size"));
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
        selectedData.UILang = lang;
        $(`#langchoose`).text(lang == 'EN' ? 'EN' : '中');
    }
}

function drawUI() {
    /* Draw focus back to the main window instead of the advertisement iframe */
    window.focus();
    renderAdv();
    updateClock();

    $("body").css("--route-color", `#${selectedData.route.color}`);

    let entryIndex = 0;
    $('#arrivalOverlay > tbody > tr').each(function (i) {
        let thisRowIsVisible = arrivalVisibility[i];
        let arrivalEntryValid = entryIndex <= arrivalData.length - 1 && arrivalData[entryIndex] != null;

        if (!thisRowIsVisible || !arrivalEntryValid) {
            $(this).replaceWith(`<tr><td class="destination">&nbsp;</td><td style="width:10%">&nbsp;</td><td class="eta">&nbsp;</td></tr>`);
            return;
        }

        let entry = arrivalData[entryIndex];
        let viaData = entry.via ? ViaData[selectedData.route.initials]?.[selectedData.stn.initials] : null;
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
        const platformElement = selectedData.showPlatform ? `<td class="plat"><span class="platcircle">${entry.plat}</span></td>` : `<td class="plat"></td>`
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

function toggleConfigPage() {
    $('.config').fadeToggle(150, function() {
        if (this.style.display == 'block') {
            configOpened = true;
        } else {
            configOpened = false;
            saveConfig();
            updateData(true);
        }
    })

    updateUILanguage(selectedData.UILang);
}

function updateUILanguage(lang) {
    $('.lang').hide()
    $('.lang-' + lang).show()

    $('.route > option').each(function() {
        $(this).text(switchLang(RouteList[$(this).val()].name, true));
    });

    $('.station > option').each(function() {
        $(this).text(switchLang(StationCodeList.get($(this).val()).name, true));
    });

    $('.dpMode > option').each(function() {
        $(this).text(switchLang(DisplayMode[$(this).val()], true))
    })

    for (const adv of advData.special) {
        $(`.specialMsg > option[value="${adv.id}"]`).text(`${switchLang(adv.name, true)}`);
    }

    $('.direction > option').each(function() {
        if (!selectedData.route.directionInfo || selectedData.route.directionInfo.length < 2) return;
        let UPTerminus = StationCodeList.get(selectedData.route.directionInfo[0]);
        let DNTerminus = StationCodeList.get(selectedData.route.directionInfo[1]);
        let Text = switchLang("往 |To ", true)

        if ($(this).val() == "UP") {
            $(this).text(Text + switchLang(UPTerminus.name, true));
        } else if ($(this).val() == "DOWN") {
            $(this).text(Text + switchLang(DNTerminus.name, true));
        } else {
            $(this).text(switchLang("雙向|Both", true));
        }
    });
}

function cycleLanguage() {
    languageCycle++;
    changeUIPreset();
}

async function updateWeather() {
    let weatherData = await fetchWeatherData();
    if (weatherData == null) return;
    /* Update weather icon */
    let weatherIconList = weatherData.rhrread.icon;
    let weatherWarningList = weatherData.warning.details;

    $('.weatherIcon').empty()
    for (const iconID of weatherIconList) {
        let icon = WeatherIcon[iconID];
        if (icon == null) continue;
        $('.weatherIcon').append(`<img src=${icon}>`);
    }

    if (weatherWarningList) {
        for (const warns of weatherWarningList) {
            let code = warns.subtype ? warns.subtype : warns.warningStatementCode
            let icon = WeatherIcon[code];

            /* Skip if there's no corresponding icon */
            if (!icon) continue;
            $('.weatherIcon').append(`<img src='${icon}'>`);
        }
    }

    /* Update temperature */
    let temperatureData = weatherData.rhrread.temperature.data;
    let temperature = 0;

    /* Average the temperature collected from all stations */
    for (const place of temperatureData) {
        temperature = temperature + parseInt(place.value);
    }

    temperature = Math.round(temperature / temperatureData.length)
    $('.weather').text(temperature + WeatherUnit);
}

async function fetchWeatherData() {
    try {
        let rhrread = await fetch(WEATHER_API.HKO_RHRREAD.url);
        let warning = await fetch(WEATHER_API.HKO_WARNING_INFO.url);

        return {
            rhrread: await rhrread.json(),
            warning: await warning.json()
        }
    } catch (err) {
        error(`Cannot fetch weather:\n${err}`)
        return null;
    }
}

async function getETAData(direction) {
    let api = selectedData.route.api;
    if (configOpened || api == ETA_API.NONE || selectedData.dpMode == DisplayMode.AD) return;

    if (api == ETA_API.MTR_OPEN || api == ETA_API.MTR || api == ETA_API.MTR_LR) {
        const response = await fetch(getAPIURL(api, selectedData.route.initials, selectedData.stn.initials, null));
        if (!response.ok) {
            error(`Cannot fetch arrival data (${response.status}).`)
            return []
        }

        const data = await response.json();

        if (data.status == 0) {
            error(`No ETA Available:\n${data.message}`)
            return []
        }

        if (api == ETA_API.MTR_LR) {
            let finalArray = []
            for (const platform of data.platform_list) {
                let currentPlatform = platform.platform_id
                let isDeparture = false;
                if (platform.end_service_status == 1) continue;

                for (const entry of platform.route_list) {
                    /* Replace to only numbers, e.g. 2 min -> 2 */
                    let ttnt = entry.time_en.replace(/[^0-9.]/g, '')
                    if (!parseInt(ttnt)) {
                        if (entry.time_en == "-") ttnt = 0;
                        if (entry.time_en == "Arriving") ttnt = 1;
                        if (entry.time_en == "Departing") isDeparture = true;
                    }

                    let convertedEntry = new ArrivalEntry(`${entry.dest_ch}|${entry.dest_en}`, ttnt, RouteList[`LR${entry.route_no}`], currentPlatform, true, isDeparture, null, 0, "")
                    finalArray.push(convertedEntry)
                }
            }

            /* Sort by ETA */
            finalArray.sort((a, b) => a.ttnt - b.ttnt)
            $('#error').hide()
            return finalArray;
        }

        if (api == ETA_API.MTR_OPEN || api == ETA_API.MTR) {
            const routeAndStation = `${selectedData.route.initials}-${selectedData.stn.initials}`

            let tempArray = []
            let finalArray = []
            let arrUP, arrDN;

            if (direction == 'BOTH') {
                if (data.data[routeAndStation].hasOwnProperty('UP')) {
                    arrUP = data.data[routeAndStation]['UP'];
                } else {
                    arrUP = [];
                }

                if (data.data[routeAndStation].hasOwnProperty('DOWN')) {
                    arrDN = data.data[routeAndStation]['DOWN'];
                } else {
                    arrDN = [];
                }

                /* Merge array from both directions */
                tempArray = arrUP.concat(arrDN)

            } else if (routeAndStation in data.data) {
                if (selectedData.direction in data.data[routeAndStation]) {
                    tempArray = data.data[routeAndStation][selectedData.direction]
                } else {
                    tempArray = [];
                }
            }

            /* Sort by ETA */
            tempArray.sort((a, b) => a.ttnt - b.ttnt);

            /* Convert data to adapt to a standardized format */
            for (const entry of tempArray) {
                let isDeparture = false;
                let route = RouteList[selectedData.route.initials];
                let arrTime = new Date(entry.time.replace(/-/g, "/"));
                let sysTime = new Date(data.sys_time.replace(/-/g, "/"));

                /* Calculate the time difference */
                let ttnt = Math.max(Math.ceil((arrTime - sysTime) / 60000), 0);
                let destName = StationCodeList.get(entry.dest).name;

                if (entry.timeType == "D") {
                    isDeparture = true;
                }

                /* EAL only */
                if (selectedData.route.initials == "EAL") {
                    if (selectedData.direction == "BOTH") {
                        /* If this entry is for the UP Direction */
                        if (arrUP.includes(entry)) {
                            entry.firstClass = 4;
                        } else {
                            entry.firstClass = 6;
                        }
                    } else {
                        entry.firstClass = selectedData.direction == "UP" ? 4 : 6
                    }
                }

                let convertedEntry = new ArrivalEntry(destName, ttnt, route, entry.plat, false, isDeparture, entry.paxLoad ? entry.paxLoad : null, entry.firstClass, entry.route, false);
                finalArray.push(convertedEntry)
            }

            $('#error').hide()
            return finalArray;
        }
    }

    if (api == ETA_API.METRO_RIDE) {
        let finalArray = [];

        if (direction == "BOTH") {
            const response1 = await fetch(`https://MTRData.kennymhhui.repl.co/metroride?line=${selectedData.route.initials}&sta=${selectedData.stn.MRCode}&dir=UP`)
            const response2 = await fetch(`https://MTRData.kennymhhui.repl.co/metroride?line=${selectedData.route.initials}&sta=${selectedData.stn.MRCode}&dir=DOWN`)
            const data1 = await response1.json()
            const data2 = await response2.json()

            for (const entry of data1.eta) {
                let station = null;
                for (stn of StationCodeList.values()) {
                    if (stn.MRCode == entry.destination) {
                        station = stn;
                        break;
                    }
                }
                if (station == null) return [];

                let convertedEntry = new ArrivalEntry(station.name, entry.ttnt, RouteList[selectedData.route.initials], entry.platform, false)
                finalArray.push(convertedEntry)
            }

            for (const entry of data2.eta) {
                let station = null;
                for (stn of StationCodeList.values()) {
                    if (stn.MRCode == entry.destination) {
                        station = stn;
                        break;
                    }
                }
                if (station == null) return [];

                let convertedEntry = new ArrivalEntry(station.name, entry.ttnt, RouteList[selectedData.route.initials], entry.platform, false, false, null, 0, "")
                finalArray.push(convertedEntry)
            }

            finalArray.sort((a, b) => a.ttnt - b.ttnt)
            $('#error').hide()
            return finalArray;
        }

        const response = await fetch(getAPIURL(api, selectedData.route.initials, selectedData.stn.MRCode, direction))
        const data = await response.json()

        for (const entry of data.eta) {
            let station = null;
            for (stn of StationCodeList.values()) {
                if (stn.MRCode == entry.destination) {
                    station = stn;
                    break;
                }
            }
            if (station == null) return [];

            let convertedEntry = new ArrivalEntry(station.name, entry.ttnt, RouteList[selectedData.route.initials], entry.platform, false)
            finalArray.push(convertedEntry)
        }
        $('#error').hide()
        return finalArray;
    }
}

async function updateData(forced) {
    if (configOpened && !forced) return;
    if (!selectedData.onlineMode) return drawUI();

    let newArrivalData = await getETAData(selectedData.direction);
    if (newArrivalData == null) return;

    arrivalData = newArrivalData;
    drawUI();
}

function saveConfig() {
    if (selectedData.onlineMode) {
        selectedData.route = RouteList[$(`.route`).val()]
        selectedData.uiPreset = UIPreset[selectedData.route.initials]
        selectedData.direction = $('.direction').val()
        selectedData.stn = StationCodeList.get($('.station').val())
    } else {
        let customFontRatio = $('.fontRatioCustom').val()
        let customRTColor = $('.rtColor').val()

        if (!parseFloat(customFontRatio)) {
            customFontRatio = 1;
        } else {
            customFontRatio = parseFloat(customFontRatio)
        }

        if (!$('.rtColor').val()) {
            customRTColor = '000000'
        }

        selectedData.route = new Route("CUSTOM", ETA_API.NONE, "Custom Route", customRTColor, false, false)

        let defPreset = UIPreset["default"]
        defPreset.fontRatio = customFontRatio
        selectedData.uiPreset = defPreset;

        let customArrivalData = []
        for (let i = 0; i < 4; i++) {
            let destination = $(`#dest${i + 1}`).val()
            let platform = $(`#plat${i + 1}`).val()
            let timetilnexttrain = $(`#ttnt${i + 1}`).val()

            if (!destination && !platform && !timetilnexttrain) {
                customArrivalData.push(null)
                continue;
            }

            if (!platform) platform = 1;
            if (!timetilnexttrain) timetilnexttrain = 0;

            customArrivalData.push(new ArrivalEntry(destination, timetilnexttrain, selectedData.route, platform, false, false));
        }

        arrivalData = customArrivalData;
    }

    let specialMsgID = $('.specialMsg').val() == null ? 'NONE' : $('.specialMsg').val();

    if (specialMsgID != 'NONE') {
        showingSpecialMessage = true;
        selectedData.specialMsgID = specialMsgID;
    } else {
        showingSpecialMessage = false;
        selectedData.specialMsgID = "NONE";
    }

    selectedData.dpMode = DisplayMode[$('.dpMode').val()];
    selectedData.showPlatform = $('.showPlat').is(':checked')
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

    if (selectedData.dpMode == DisplayMode.NT4 && !showingSpecialMessage) {
        arrivalVisibility = [true, true, true, true];
        $('#advertisement').hide();
        return;
    } else {
        $('#advertisement').show();
    }

    if (nextAdCycle.isPaxLoad && !selectedData.route.hasPaxLoad) {
        cycleAdv();
        renderAdv();
    }

    if (nextAdCycle.framesrc == null && (selectedData.dpMode == DisplayMode.AD || selectedData.dpMode == DisplayMode.ADNT1)) {
        cycleAdv();
        renderAdv();
    }

    if (showingSpecialMessage) {
        nextAdCycle = advData.special.filter(e => e.id == selectedData.specialMsgID)[0];
    }

    for (const adv of advData.cycle) {
        $(`.promo-${adv.id}`).hide()
    }

    for (const adv of advData.special) {
        $(`.promo-${adv.id}`).hide()
    }

    if (nextAdCycle.framesrc == null && !showingSpecialMessage) {
        arrivalVisibility = [true, true, true, true];
        $('#advertisement').hide();
    } else {
        $('#advertisement').show();
        $(`.promo-${nextAdCycle.id}`).show();
        arrivalVisibility = [false, false, false, true];
    }

    if (selectedData.dpMode == DisplayMode.AD) {
        arrivalVisibility = [false, false, false, false];
    }

    if (showingSpecialMessage) {
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
            for (pax of arrivalData[0].paxLoad) {
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
    let preset = UIPreset[selectedData.route.initials] || UIPreset["default"];

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

    selectedData.uiPreset = preset;
}

function setupUI() {
    updateStation();
    $('.dpMode').empty()
    for (const mode in DisplayMode) {
        let modeName = DisplayMode[mode];
        $('.dpMode').append(`<option value=${mode}>${switchLang(modeName, true)}</option>`)
    }

    if (!document.fullscreenEnabled) {
        $('.tfs').hide();
    }

    $('.route').empty()
    for (const key in RouteList) {
        if (RouteList[key].hidden) continue;
        $('.route').append(`<option value="${key}">${switchLang(RouteList[key].name)}</option>`)
    }
    selectedData.route = RouteList[$('.route').val()]

    $('.specialMsg').empty();
    for (const adv of advData.special) {
        $('.specialMsg').append(`<option value="${adv.id}">${switchLang(adv.name, true)}`);
    }
}

function updateStation() {
    /* Show the corresponding station list of the route */
    $('.station').empty();

    for (const stnCode of selectedData.route.stations) {
        $('.station').append(`<option value="${stnCode}">${switchLang(StationCodeList.get(stnCode).name, true)}`);
    }
    selectedData.stn = StationCodeList.get(selectedData.route.stations[0]);
}

function error(text) {
    $('#error').show();
    $('#error').text(text);
}

$(document).ready(async function() {
    parseQuery();
    updateWeather();
    saveConfig();
    setupUI();
    renderAdv(true);
    updateData(true);
    updateUILanguage(selectedData.UILang);
    setInterval(updateData, 10 * 1000, false);
    setInterval(drawUI, 1 * 1000);
    setInterval(updateWeather, 60 * 1000, false);

    if (!debugMode) {
        toggleConfigPage();
    } else {
        selectedData.dpMode = DisplayMode.NT4
    }

    $('.onlineMode').on('change', function() {
        selectedData.onlineMode = $(this).is(':checked')
        if (selectedData.onlineMode) {
            $(".online").show()
            $(".offline").hide()
            selectedData.route = RouteList[$('.route').val()];
        } else {
            $(".online").hide()
            $(".offline").show()
        }
    })

    $('.route').on('change', function() {
        selectedData.route = RouteList[$(this).val()];
        updateStation()
        updateUILanguage(selectedData.UILang)

        if (selectedData.route.isLRT) {
            $('.direction').prop("disabled", true);
        } else {
            $('.direction').prop("disabled", false);
        }
    })

    $('#langchoose').on('click', function() {
        let toggledLang = selectedData.UILang == Lang.ENGLISH ? Lang.CHINESE : Lang.ENGLISH
        selectedData.UILang = toggledLang;
        $(`#langchoose`).text(toggledLang == Lang.ENGLISH ? 'EN' : '中')
        updateUILanguage(toggledLang)
    })

    $('.saveCfg').on('click', function() {
        toggleConfigPage()
    })

    $('.tfs').on('click', function() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    })
})

$(window).on('keydown', function(e) {
    /* Enter key */
    if (e.which == 13) {
        toggleConfigPage()
    }

    /* G key */
    if (e.which == 71 && debugMode) {
        cycleAdv()
        renderAdv()
        drawUI()
    }
})