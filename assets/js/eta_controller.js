/* This class is responsible for fetching the ETA Information via the respective API */

import { ArrivalEntry, Route } from './static/data.js';
import SETTINGS from './static/settings.js';

const customRoute = new Route("CST", "自定路綫|Custom Line", "#000", "#000", false, [], [], true);

const customArrivalData = [
    new ArrivalEntry("", 1, null, customRoute, "1", false, false, null, -1, null),
    new ArrivalEntry("", 5, null, customRoute, "1", false, false, null, -1, null),
    new ArrivalEntry("", 10, null, customRoute, "1", false, false, null, -1, null),
    new ArrivalEntry("", 15, null, customRoute, "1", false, false, null, -1, null)
];

let etaCache = {
    expiry: 0,
    data: null,
    lastRequestCombo: null
};

async function getETA(api, route, stn, direction) {
    if(SETTINGS.dataSource == 'OFFLINE') {
        return customArrivalData;
    }

    let requestCombo = `${route}-${stn}`;

    let data = null;
    if(etaCache.data != null && canUseCache(requestCombo)) {
        data = etaCache.data;
    } else {
        for(let url of api.urls) {
            let transformedURL = transformURL(url, route, stn, null);
            try {
                let requestConfig = api.requestConfig(route, stn);
                const response = await fetch(transformedURL, { cache: "no-cache", ...requestConfig });
                if (!response.ok) {
                    console.warn(`Cannot fetch from URL:\n${transformedURL}\n(${response.status}).`);
                    continue;
                }
                data = await response.json();
                break;
            } catch {
                console.warn(`Cannot fetch from URL:\n${transformedURL}.`);
                continue;
            }
        }

        if(data == null) {
            console.error(`Failed to fetch any ETAs from ${api.name}!.`);
            return [];
        } else {
            etaCache.expiry = Date.now() + (10 * 1000);
            etaCache.data = data;
            etaCache.lastRequestCombo = requestCombo;
        }
    }

    return api.transformData(data, route, stn, direction);
}

function canUseCache(requestCombo) {
    return Date.now() <= etaCache.expiry && etaCache.lastRequestCombo == requestCombo;
}

function transformURL(url, rt, stn, dir) {
    return url.replace("{rt}", rt).replace("{stn}", stn).replace("{dir}", dir);
}

export default { getETA, customRoute, customArrivalData };