'use strict'

import { WEATHER_API, WeatherIcon, WeatherUnit } from './static/weatherdata.js'

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

    $('.weatherIcon').empty();
    for (const iconID of weatherIconList) {
        $('.weatherIcon').append(`<img src=./assets/img/w_icon/${iconID}.png>`);
    }

    if (weatherWarningList) {
        for (const warns of weatherWarningList) {
            let code = warns.subtype ? warns.subtype : warns.warningStatementCode;
            $('.weatherIcon').append(`<img src=./assets/img/w_icon/${code}.png>`);
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