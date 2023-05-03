'use strict'

import { WEATHER_API, WeatherIcon, WeatherUnit } from './static/weatherdata.js'

function updateClock() {
    let currDate = new Date();
    let strMin = `${currDate.getMinutes()}`.padStart(2, '0');
    let strHour = `${currDate.getHours()}`.padStart(2, '0');
    $('.clock').text(`${strHour}:${strMin}`);
}

async function updateWeather() {
    let weatherData = await fetchWeatherData();
    if (weatherData == null) return;
    /* Update weather icon */
    let weatherIconList = weatherData.rhrread.icon;
    let weatherWarningList = weatherData.warning.details;

    $('.weatherIcon').empty();
    for (const iconID of weatherIconList) {
        let icon = WeatherIcon[iconID];
        if (icon == null) continue;
        $('.weatherIcon').append(`<img src=${icon}>`);
    }

    if (weatherWarningList) {
        for (const warns of weatherWarningList) {
            let code = warns.subtype ? warns.subtype : warns.warningStatementCode;
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
        return null;
    }
}

$(document).ready(function() {
    updateWeather();
    updateClock();
    setInterval(updateWeather, 60 * 1000, false);
    setInterval(updateClock, 1000, false);
});