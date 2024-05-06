'use strict'

import { WEATHER_API, WeatherIcon, WeatherUnit } from './static/weatherdata.js';
import SETTINGS from './static/settings.js';
import MAIN from './main.js';

function updateClock() {
    let currDate = new Date();
    let strMin = currDate.toLocaleTimeString('en-US', {minute: '2-digit', timeZone: 'Asia/Hong_Kong'});
    let strHour = currDate.toLocaleTimeString('en-US', {hour: '2-digit', hour12: false, timeZone: 'Asia/Hong_Kong'});
    $('.clock').text(`${strHour}:${strMin}`);
}

async function updateWeather() {
    let weatherData = await fetchWeatherData();
    if (weatherData == null) return;
    /* Update weather icon */
    let weatherIconList = weatherData.rhrread.icon;
    let weatherWarningList = weatherData.warning.details;
    
    let wIconCount = 0;
    $('.weatherIcon').empty();
    for (const iconID of weatherIconList) {
        wIconCount++;
        if(wIconCount > 4) continue;
        $('.weatherIcon').append(`<img src=./assets/img/w_icon/${iconID}.png>`);
    }

    if (weatherWarningList) {
        for (const warns of weatherWarningList) {
            let code = warns.subtype ? warns.subtype : warns.warningStatementCode;
            let icon = WeatherIcon[code];

            /* Skip if there's no corresponding icon */
            if (!icon) continue;
            wIconCount++;
            if(wIconCount > 4) continue;
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
        return null;
    }
}

function updateHeader() {
    if(SETTINGS.rtHeader) {
        $('.t1').hide();
        $('.t2').show();
        $("#titlebar").addClass("rtcolor");
        $(".rtname").text(MAIN.switchLang(SETTINGS.route.name));
        $('body').css("--title-height", `17vh`);
    } else {
        $('.t2').hide();
        $('.t1').show();
        $("#titlebar").removeClass("rtcolor");
        $('body').css("--title-height", `13.7vh`);
    }
}

function draw() {
    updateHeader();
    updateClock();
}

$(document).ready(function() {
    draw();
    updateWeather();
    setInterval(updateWeather, 60 * 1000, false);
});

export default {draw: draw}