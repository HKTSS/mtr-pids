/* This class is responsible for fetching the ETA Information via the respective API */

function processLightRailData(data) {
    if (data.status == 0) {
        console.error(`No ETA Available: ${data.message}`)
        return [];
    }

    let finalData = [];
    for (const platform of data.platform_list) {
        let currentPlatform = platform.platform_id
        let isDeparture = false;
        if (platform.end_service_status == 1) continue;

        for (const entry of platform.route_list) {
            /* Replace to only numbers, e.g. 2 min -> 2 */
            const ttnt = entry.time_en.replace(/[^0-9.]/g, '');
            let ttntNum = parseInt(ttnt);
            if (isNaN(ttntNum)) {
                if (entry.time_en == "-") ttntNum = 0;
                if (entry.time_en == "Arriving" || entry.time_en == "Departing") ttntNum = 1;
                if (entry.time_en == "Departing") isDeparture = true;
            }
            
            let time = new Date(new Date().getTime() + (ttntNum * 60 * 1000));
            let arrivalEntry = new ArrivalEntry(`${entry.dest_ch}|${entry.dest_en}`, ttntNum, time, RouteList[`LR${entry.route_no}`], currentPlatform, true, isDeparture, null, 0, "");
            finalData.push(arrivalEntry);
        }
        finalData.sort((a, b) => a.ttnt - b.ttnt)
    }
    return finalData;
}

function processHeavyRailData(data, route, stn, direction) {
    if (data.status == 0) {
        console.error(`No ETA Available: ${data.message}`)
        return [];
    }

    const routeAndStation = `${route}-${stn}`

    let tempArray = [];
    let finalData = [];
    let arrUP = [];
    let arrDN = [];
    
    if (direction == 'BOTH' || direction == 'BOTH_SPLIT') {
        if (data.data[routeAndStation].hasOwnProperty('UP')) {
            arrUP = data.data[routeAndStation]['UP'];
        }
        if (data.data[routeAndStation].hasOwnProperty('DOWN')) {
            arrDN = data.data[routeAndStation]['DOWN'];
        }
        
        arrUP.sort((a, b) => a.ttnt - b.ttnt);
        arrDN.sort((a, b) => a.ttnt - b.ttnt);
        
        if(direction == 'BOTH_SPLIT') {
            arrUP = arrUP.slice(0, 2);
            arrDN = arrDN.slice(0, 2);
        }
        
        /* Merge array from both directions */
        tempArray = arrUP.concat(arrDN);
        
        if(direction != 'BOTH_SPLIT') {
            /* Sort all by ETA */
            tempArray.sort((a, b) => a.ttnt - b.ttnt);
        }
    } else if (routeAndStation in data.data) {
        if (direction in data.data[routeAndStation]) {
            tempArray = data.data[routeAndStation][direction]
        } else {
            tempArray = [];
        }
        
        /* Sort by ETA */
        tempArray.sort((a, b) => a.ttnt - b.ttnt);
    }

    /* Convert data to adapt to a standardized format */
    for (const entry of tempArray) {
        let isDeparture = false;
        let routeData = RouteList[route];
        let arrTime = new Date(entry.time.replace(/-/g, "/"));
        let sysTime = new Date(data.sys_time.replace(/-/g, "/"));

        /* Calculate the time difference */
        let ttnt = Math.max(Math.ceil((arrTime - sysTime) / 60000), 0);
        let destName = StationCodeList.get(entry.dest).name;

        if (entry.timeType == "D") {
            isDeparture = true;
        }

        /* EAL only */
        if (route == "EAL") {
            if (direction == "BOTH") {
                /* If this entry is for the UP Direction */
                if (arrUP.includes(entry)) {
                    entry.firstClass = 4;
                } else {
                    entry.firstClass = 6;
                }
            } else {
                entry.firstClass = direction == "UP" ? 4 : 6
            }
        }

        let arrivalEntry = new ArrivalEntry(destName, ttnt, arrTime, routeData, entry.plat, false, isDeparture, entry.paxLoad ? entry.paxLoad : null, entry.firstClass, entry.route, false);
        finalData.push(arrivalEntry);
    }

    return finalData;
}

async function fetchData(api, route, stn, direction) {
    if(api != ETA_API.MTR_LR && api != ETA_API.MTR_OPEN) {
        console.warn("Unknown API: " + api)
        return null;
    }

    let data = null;
    for(let url of api.urls) {
        let transformedURL = transformURL(url, route, stn, null);
        try {
            const response = await fetch(transformedURL);
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
    }

    if(api == ETA_API.MTR_LR) {
        return processLightRailData(data);
    } else if(api == ETA_API.MTR_OPEN) {
        return processHeavyRailData(data, route, stn, direction);
    }
}

function transformURL(url, rt, stn, dir) {
    return url.replace("{rt}", rt).replace("{stn}", stn).replace("{dir}", dir);
}

export default { fetchData };