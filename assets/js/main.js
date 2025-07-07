'use strict'

import ETA_CONTROLLER from './eta_controller.js'
import SETTINGS from './static/settings.js';
import UI from './ui.js'
import { ETA_API, getRoute } from './static/data.js';

let etaData = [];

function parseQuery() {
    let params = (new URL(document.location)).searchParams;

    if(params.has("debug")) {
        SETTINGS.debugMode = true;
    }
}

async function updateETA() {
    let route = getRoute(SETTINGS.route);
    let api = route.api;
    if (api == ETA_API.NONE) return;

    let data = await ETA_CONTROLLER.getETA(api, route.initials, SETTINGS.station, SETTINGS.direction);
    etaData = data;
}

$(document).ready(async function() {
    parseQuery();
    UI.setup();
    UI.draw([]);
    await updateETA();

    setInterval(() => {
        updateETA();
        // const isPaxUpdating = etaData[0]?.paxLoad?.length == 1;
        UI.draw(etaData);
    }, 1 * 1000);
});