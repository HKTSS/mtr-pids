'use strict'

import { fetchWeatherData } from './weather_controller.js';
import SETTINGS from './static/settings.js';
import UI from './ui.js';
import { getRoute } from './static/data.js';

function updateClock() {
    let currDate = new Date();

    $('.clock').text(currDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: 'Asia/Hong_Kong' }));
}

async function updateWeather() {
    let weatherData = await fetchWeatherData();
    if (weatherData == null) return;
    /* Update weather icon */
    let weatherIconList = weatherData.rhrread.icon;
    let weatherWarningList = weatherData.warning.details;
    let weatherIconElement = document.querySelector("#weather-icon");
    
    let wIconCount = 0;
    weatherIconElement.innerHTML = ``;
    for (const iconID of weatherIconList) {
        wIconCount++;
        if(wIconCount > 4) continue;
        let iconElement = document.createElement("img");
        iconElement.src = `./assets/img/w_icon/${iconID}.png`;
        weatherIconElement.appendChild(iconElement);
    }

    if (weatherWarningList) {
        for (const warns of weatherWarningList) {
            let code = warns.subtype ? warns.subtype : warns.warningStatementCode;
            if(code == "CANCEL") continue; // HKO Cancel All Signal, no icon for display
            wIconCount++;
            if(wIconCount > 4) continue;
            let iconElement = document.createElement("img");
            iconElement.src = `./assets/img/w_icon/${code}.png`;
            weatherIconElement.appendChild(iconElement);
        }
    }

    /* Update temperature */
    document.querySelector('#temperature').textContent = `${Math.round(weatherData.avgTemp)}°C`;
}

function updateHeader() {
    if(SETTINGS.rtHeader) {
        $('.t1').hide();
        $('.t2').show();
        $("#header-bar").addClass("route-color");
        $(".rtname").text(UI.switchLang(getRoute(SETTINGS.route).name));
        $('body').css("--title-height", `17vh`);
    } else {
        $('.t2').hide();
        $('.t1').show();
        $("#header-bar").removeClass("route-color");
        $('body').css("--title-height", `13.7vh`);
    }
}

function draw() {
    updateHeader();
    updateClock();
}

async function setup() {
    await updateWeather();
    setInterval(updateWeather, 60 * 1000, false);
    $("#configure-button").click(() => {
        document.querySelector("#overlay").classList.remove("hidden");
    });
}

export default { setup, draw };