let arrivalVisibility = [true, true, true, true]
let nextAdvTime;
let languageCycle = 0
let arrivalData = []
let weatherData = {}
let configOpened = false;
let debugMode = false;
let showingSpecialMessage = false;
let currentAdvId = 0;
let marqueeX = 100;
let forceRefresh;

let selectedData = {
    direction: 'UP',
    route: null,
    stn: null,
    onlineMode: true,
    showPlatform: true,
    API: API.MTR_OPEN,
    uiPreset: null,
    UILang: 'EN',
    dpMode: DisplayMode.NORMAL,
    specialMsgID: "NONE",
    marquee: false
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
        if (targetLang == 'EN') {
            return str.split("|").length > 0 ? str.split("|")[1] : str.split("|")[0];
        } else {
            return str.split("|")[0];
        }
    }

    let targetLang = languageCycle

    let name = str.split("|");
    return name[targetLang % name.length];
}

/* This function puts the arrival destination text into a hidden element to calculate the width and make changes accordingly */
/* Hacky solution, but if it works then it works. */
function adjustFontSize() {
    $('.scalable').each(function() {
        let ogSize = selectedData.uiPreset.fontRatio * parseInt($(this).css("font-size"));
        const PADDING = 20
        let tdWidth = $(this).width() - PADDING;
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
}

function parseQuery() {
    let params = (new URL(document.location)).searchParams;
    let lang = params.get("lang");
    if (lang == null) return;
    lang = lang.toUpperCase();

    if (lang == 'EN' || lang == 'ZH') {
        selectedData.UILang = lang;
        $(`#langchoose`).text(lang == 'EN' ? 'EN' : '中');
    }
}

function drawUI() {
    /* Draw focus back to the main window instead of the advertisement iframe */
    window.focus();
    let entryIndex = 0;

    $("#arrivalOverlay").empty();
    renderAdv()

    for (let i = 0; i < 4; i++) {
        let thisRowIsVisible = arrivalVisibility[i];
        let arrivalEntryValid = entryIndex <= arrivalData.length - 1 && arrivalData[entryIndex] != null;

        if (!thisRowIsVisible || !arrivalEntryValid) {
            $('#arrivalOverlay').append(`<tr><td class="destination">&nbsp;</td><td style="width:10%">&nbsp;</td><td class="eta">&nbsp;</td></tr>`);
            continue;
        }

        let entry = arrivalData[entryIndex];
        let stationName = entry.via ? `${switchLang(entry.dest)}${switchLang(" 經| via ")}${switchLang(StationCodeList.get(entry.via).name)}` : switchLang(entry.dest);

        let timetext = "";
        let time = getETAmin(entry.ttnt, false);

        if (entry.isDeparture == true) {
            if (entry.ttnt == 0) {
                timetext = "正在離開|Departing";
            } else {
                time = getETAmin(entry.ttnt, true)
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
        let lrtElement = entry.route.isLRT ? `<span class="lrtrt" style="border-color:#${entry.route.color}">${entry.route.initials}</span>` : ""
        let platformElement = selectedData.showPlatform ? `<td style="width:10%"><span class="platcircle scalable" style="background-color:#${selectedData.route.color}">${entry.plat}</span></td>` : `<td style="width:10%"></td>`
        let ETAElement = `<td class="eta scalable">${time} <span class="etamin">${switchLang(timetext)}</span></td>`
        let destElement;

        if (entry.marquee && !Chinese.test(stationName)) {
            destElement = `<td class="destination"><div class="marquee" style="transform: translateX(${marqueeX}%)">${lrtElement}${stationName}</div></td>`
        } else {
            destElement = `<td class="destination scalable">${lrtElement}${stationName}</td>`
        }

        tableRow += destElement;
        tableRow += platformElement;
        tableRow += ETAElement;

        $('#arrivalOverlay').append(`<tr>${tableRow}</tr>`);
        entryIndex++;
    }

    changeUIPreset();
    adjustFontSize();
}

function getETAmin(eta, departure) {
    if (eta == 0 || (eta == 1 && !departure)) {
        return "";
    } else {
        return Math.min(eta, 99);
    }
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
    if (lang == 'EN') {
        $('.lang-en').show();
        $('.lang-zh').hide();
    } else if (lang == 'ZH') {
        $('.lang-zh').show();
        $('.lang-en').hide();
    }

    $('.route > option').each(function() {
        $(this).text(switchLang(RouteList[$(this).val()].name, true));
    });

    $('.station > option').each(function() {
        $(this).text(switchLang(StationCodeList.get($(this).val()).name, true));
    });

    $('.dpMode > option').each(function() {
        $(this).text(switchLang(DisplayMode[$(this).val()], true))
    })

    for (adv of advData.special) {
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
    marqueeX = -100;
    languageCycle++;
    forceRefresh = true;
    changeUIPreset();
}

async function updateWeather() {
    weatherData = await fetchWeatherData();
    if (weatherData == null) return;
    /* Update weather icon */
    let weatherIconList = weatherData.rhrread.icon;
    let weatherWarningList = weatherData.warning.details;

    $('.weatherIcon').empty()
    for (iconID of weatherIconList) {
        icon = WeatherIcon[iconID];
        if (icon == null) continue;
        $('.weatherIcon').append(`<img src=${icon}>`);
    }

    if (weatherWarningList) {
        for (warns of weatherWarningList) {
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
    for (place of temperatureData) {
        temperature = temperature + parseInt(place.value);
    }

    temperature = Math.round(temperature / temperatureData.length)
    $('.weather').text(temperature + WeatherUnit);
}

async function fetchWeatherData() {
    try {
        let rhrread = await fetch(`https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en`)
        let warning = await fetch(`https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warningInfo&lang=en`)

        return {
            rhrread: await rhrread.json(),
            warning: await warning.json()
        }
    } catch (err) {
        return null;
    }
}

async function fetchETAData(direction) {
    let api = selectedData.route.api;
    if (api == API.NONE) return;

    if (selectedData.dpMode == DisplayMode.AD || configOpened) return;

    if (api == API.MTR_LR) {
        const response = await fetch(`https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id=${selectedData.stn.initials}`);

        if (!response.ok) {
            error(`Cannot fetch arrival data (${response.status}).`)
            return []
        }

        const data = await response.json()

        if (data.status == 0) {
            error(`No arrival data:\n${data.message}`)
            return []
        }

        let finalArray = []
        for (platform of data.platform_list) {
            let currentPlatform = platform.platform_id
            let isDeparture = false;
            if (platform.end_service_status == 1) continue;

            for (entry of platform.route_list) {
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

    if (api == API.MTR_OPEN || api == API.MTR) {
        let response;
        if (api == API.MTR_OPEN) {
            try {
                response = await fetch(`https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${selectedData.route.initials}&sta=${selectedData.stn.initials}`);
            } catch {
                error("Cannot fetch arrival data: Invalid URL/CORS Error)")
                return;
            }
        } else {
            try {
                response = await fetch(`https://MTRData.kennymhhui.repl.co/mtr?line=${selectedData.route.initials}&sta=${selectedData.stn.initials}`);
            } catch {
                error("Cannot fetch arrival data: Invalid URL/CORS Error")
                return;
            }
        }

        if (!response.ok) {
            error(`Cannot fetch arrival data:\n${data.message}`)
            return []
        }

        const data = await response.json()
        const routeAndStation = `${selectedData.route.initials}-${selectedData.stn.initials}`

        if (data.status == 0) {
            error(`Cannot fetch arrival data:\n${data.message}`)
            return []
        }

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
        tempArray.sort((a, b) => a.ttnt - b.ttnt)

        /* Convert data to adapt to a standardized format */
        for (entry of tempArray) {
            let route = RouteList[selectedData.route.initials];
            let arrTime = new Date(entry.time);
            let sysTime = new Date(data.sys_time);
            let isDeparture;

            /* Calculate the time difference */
            let ttnt = Math.max(Math.ceil((arrTime - sysTime) / 60000), 0);
            let destName = StationCodeList.get(entry.dest).name

            if (entry.timeType == "D") {
                isDeparture = true;
            }

            // let marquee = entry.route ? true : false;
            let marquee = false;

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

            let convertedEntry = new ArrivalEntry(destName, ttnt, route, entry.plat, false, isDeparture, entry.paxLoad ? entry.paxLoad : null, entry.firstClass, entry.route, marquee)
            finalArray.push(convertedEntry)
        }

        $('#error').hide()
        return finalArray;
    }

    if (api == API.METRO_RIDE) {
        let finalArray = [];

        if (direction == "BOTH") {
            const response1 = await fetch(`https://MTRData.kennymhhui.repl.co/metroride?line=${selectedData.route.initials}&sta=${selectedData.stn.MRCode}&dir=UP`)
            const response2 = await fetch(`https://MTRData.kennymhhui.repl.co/metroride?line=${selectedData.route.initials}&sta=${selectedData.stn.MRCode}&dir=DOWN`)
            const data1 = await response1.json()
            const data2 = await response2.json()

            for (entry of data1.eta) {
                let station = null;
                for (stn of StationCodeList.values()) {
                    if (stn.MRCode == entry.destination) {
                        station = stn;
                        break;
                    }
                }
                if (station == null) return [];
                let stnName = station.name

                let convertedEntry = new ArrivalEntry(stnName, entry.ttnt, RouteList[selectedData.route.initials], entry.platform, false)
                finalArray.push(convertedEntry)
            }

            for (entry of data2.eta) {
                let station = null;
                for (stn of StationCodeList.values()) {
                    if (stn.MRCode == entry.destination) {
                        station = stn;
                        break;
                    }
                }
                if (station == null) return [];
                let stnName = station.name

                let convertedEntry = new ArrivalEntry(stnName, entry.ttnt, RouteList[selectedData.route.initials], entry.platform, false, false, null, 0, "")
                finalArray.push(convertedEntry)
            }
            finalArray.sort((a, b) => a.ttnt - b.ttnt)
            $('#error').hide()
            return finalArray;
        }

        let directionURL = `&dir=${direction}`
        const response = await fetch(`https://MTRData.kennymhhui.repl.co/metroride?line=${selectedData.route.initials}&sta=${selectedData.stn.MRCode}${directionURL}`)
        const data = await response.json()

        for (entry of data.eta) {
            let station = null;
            for (stn of StationCodeList.values()) {
                if (stn.MRCode == entry.destination) {
                    station = stn;
                    break;
                }
            }
            if (station == null) return [];
            let stnName = station.name

            let convertedEntry = new ArrivalEntry(stnName, entry.ttnt, RouteList[selectedData.route.initials], entry.platform, false)
            finalArray.push(convertedEntry)
        }
        $('#error').hide()
        return finalArray;
    }
}

async function updateData(forced) {
    if (configOpened && !forced) return;
    if (!selectedData.onlineMode) return drawUI();

    let newArrivalData = await fetchETAData(selectedData.direction);
    if (newArrivalData == null) return;

    arrivalData = newArrivalData
    drawUI()
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

        selectedData.route = new Route("CUSTOM", "NONE", "Custom Route", customRTColor, false, false)

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
        renderAdv();
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

    for (adv of advData.cycle) {
        $(`.promo-${adv.id}`).hide()
    }

    for (adv of advData.special) {
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

    const ONE_ROW_HEIGHT = $('#arrivalBackground tr td:first').height()
    const TITLE_HEIGHT = $('#titlebar').height();
    let finalHeight = $(window).height() - TITLE_HEIGHT - (ONE_ROW_HEIGHT * arrivalVisibility.filter(visible => visible == true).length);
    $('#advertisement').css("height", `${finalHeight}px`);

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
        $('#advertisement').empty()
        for (let cate in advData) {
            for (adv of advData[cate]) {
                if (adv.framesrc != null) {
                    $('#advertisement').append(`<iframe style="display:block" class="promo-${adv.id} centeredItem" src=${adv.framesrc}></iframe>`);
                }
            }
        }
    }

    if (nextAdCycle.isPaxLoad) {
        let paxArray = []
        if (arrivalData[0] && arrivalData[0].paxLoad && arrivalData[0].paxLoad.length > 1) {
            for (pax of arrivalData[0].paxLoad) {
                paxArray.push(pax.availability);
            }
            let firstClassCar = arrivalData[0].firstClassCar ? arrivalData[0].firstClassCar : 0

            let curURL = $(`.promo-${nextAdCycle.id}`).attr("src");
            let fullURL = `${nextAdCycle.framesrc}?data=${paxArray.join(",")}&firstClass=${firstClassCar}`
            if (curURL == fullURL) return;

            $(`.promo-${nextAdCycle.id}`).attr("src", fullURL);
        } else {
            cycleAdv()
            renderAdv()
        }
    }
}

function changeUIPreset() {
    selectedData.uiPreset = UIPreset[selectedData.route.initials]

    if (selectedData.uiPreset == null) {
        selectedData.uiPreset = UIPreset["default"]
    }

    let preset = selectedData.uiPreset;


    $('#titleOverlay').css(`width`, `${preset.titleWidth}%`)
    $('#arrivalOverlay').css(`width`, `${preset.ETAWidth}%`)

    $(".destination").each(function() {
        let isChinese = Chinese.test($(this).text());
        if (isChinese) {
            $(this).css("letter-spacing", preset.chinFontSpacing);
        } else {
            $(this).css("letter-spacing", `normal`);
        }

        $(this).css("font-weight", preset.fontWeight);
    })

    $(".eta").each(function() {
        $(this).css("font-weight", preset.fontWeight);
    })

    $("#titlebar").css(`font-family`, preset.title);
    $(".platcircle").css("font-family", preset.platformCircle);
    $(".destination").css("font-family", preset.arrivals);
    $(".eta").css("font-family", preset.eta);
}

function setupUI() {
    updateStation();
    $('.dpMode').empty()
    for (mode in DisplayMode) {
        let modeName = DisplayMode[mode];
        $('.dpMode').append(`<option value=${mode}>${switchLang(modeName, true)}</option>`)
    }

    if (!document.fullscreenEnabled) {
        $('.tfs').hide();
    }

    $('.route').empty()
    for (key in RouteList) {
        if (RouteList[key].hidden) continue;
        $('.route').append(`<option value="${key}">${switchLang(RouteList[key].name)}</option>`)
    }
    selectedData.route = RouteList[$('.route').val()]

    $('.specialMsg').empty();
    for (adv of advData.special) {
        $('.specialMsg').append(`<option value="${adv.id}">${switchLang(adv.name, true)}`);
    }
}

function updateStation() {
    /* Show the corresponding station list of the route */
    $('.station').empty();

    for (stnCode of selectedData.route.stations) {
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
    updateClock();
    updateWeather();
    saveConfig();
    setupUI();
    renderAdv(true);
    updateData(true);
    updateUILanguage(selectedData.UILang);
    setInterval(updateClock, 1000);
    setInterval(cycleLanguage, 10000);
    setInterval(updateData, 10000, false);
    setInterval(drawUI, 1000);
    setInterval(updateWeather, 60000, false);
    setInterval(updateMarquee, 1000)

    if (!debugMode) {
        toggleConfigPage();
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
        updateUILanguage()

        if (selectedData.route.isLRT) {
            $('.direction').prop("disabled", true);
        } else {
            $('.direction').prop("disabled", false);
        }
    })

    $('#langchoose').on('click', function() {
        let toggledLang = selectedData.UILang == 'EN' ? 'ZH' : 'EN'
        selectedData.UILang = toggledLang;
        $(`#langchoose`).text(toggledLang == 'EN' ? 'EN' : '中')
        updateUILanguage(selectedData.UILang)
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
        cycleLanguage()
        cycleAdv()
        renderAdv()
        drawUI()
    }
})

function updateMarquee() {
    if (marqueeX < -100) {
        marqueeX = 100;
        $('.marquee').css("transition", `0s`)
        $('.marquee').css("transform", `translateX(${marqueeX}%)`)
        return;
    }
    marqueeX -= 30;
    $('.marquee').css("transition", `1s linear`)
    $('.marquee').css("transform", `translateX(${marqueeX}%)`)
}