/* This class is responsible for fetching the ETA Information via the respective API */

async function getMetroRide(route, MRCode, direction) {
    let finalArray = [];

    if (direction == "BOTH") {
        const response1 = await fetch(`https://MTRData.kennymhhui.repl.co/metroride?line=${route}&sta=${MRCode}&dir=UP`)
        const response2 = await fetch(`https://MTRData.kennymhhui.repl.co/metroride?line=${route}&sta=${MRCode}&dir=DOWN`)
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

            let convertedEntry = new ArrivalEntry(station.name, entry.ttnt, RouteList[route], entry.platform, false);
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

            let convertedEntry = new ArrivalEntry(station.name, entry.ttnt, RouteList[route], entry.platform, false, false, null, 0, "");
            finalArray.push(convertedEntry)
        }

        finalArray.sort((a, b) => a.ttnt - b.ttnt)
        return finalArray;
    }

    const response = await fetch(getAPIURL(ETA_API.METRO_RIDE, route, MRCode, direction));
    const data = await response.json()

    for (const entry of data.eta) {
        let station = null;
        for (const stn of StationCodeList.values()) {
            if (stn.MRCode == entry.destination) {
                station = stn;
                break;
            }
        }
        if (station == null) return [];

        let convertedEntry = new ArrivalEntry(station.name, entry.ttnt, RouteList[route], entry.platform, false)
        finalArray.push(convertedEntry)
    }
    return finalArray;
}

async function getLightRail(route, stn) {
    const response = await fetch(getAPIURL(ETA_API.MTR_LR, route, stn, null));
        if (!response.ok) {
            // error(`Cannot fetch arrival data (${response.status}).`)
            return [];
        }

        const data = await response.json();

        if (data.status == 0) {
            // error(`No ETA Available:\n${data.message}`)
            return [];
        }

        let finalArray = [];
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
        return finalArray;
}

async function getMTRHeavyRail(api, route, stn, direction) {
    const response = await fetch(getAPIURL(api, route, stn, null));
    if (!response.ok) {
        // error(`Cannot fetch arrival data (${response.status}).`)
        return [];
    }

    const data = await response.json();

    if (data.status == 0) {
        // error(`No ETA Available:\n${data.message}`)
        return [];
    }

    const routeAndStation = `${route}-${stn}`

    let tempArray = [];
    let finalArray = [];
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
        tempArray = arrUP.concat(arrDN);

    } else if (routeAndStation in data.data) {
        if (direction in data.data[routeAndStation]) {
            tempArray = data.data[routeAndStation][direction]
        } else {
            tempArray = [];
        }
    }


    /* Sort by ETA */
    tempArray.sort((a, b) => a.ttnt - b.ttnt);

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

        let convertedEntry = new ArrivalEntry(destName, ttnt, routeData, entry.plat, false, isDeparture, entry.paxLoad ? entry.paxLoad : null, entry.firstClass, entry.route, false);
        finalArray.push(convertedEntry);
    }

    // $('#error').hide()
    return finalArray;
}

async function getHKTramways(stn) {
    const trimmedStn = stn.substring(1);
    const fetchURL = getAPIURL(ETA_API.HKT, null, trimmedStn, null);
	const response = await fetch(fetchURL);
    const data = await response.text();

    const parser = new DOMParser();
    const ETAData = parser.parseFromString(data, "text/xml");
    const entries = ETAData.getElementsByTagName("metadata");

    let finalArray = [];
    for(const entry of entries) {
        let tramId = entry.getAttribute("tram_id");
        let isArrived = entry.getAttribute("is_arrived") == "1";
        let minArrival = parseInt(entry.getAttribute("arrive_in_minute"));
        let ttnt = isArrived ? 0 : Math.max(1, minArrival);
        let destName = `${entry.getAttribute("tram_dest_tc")}|${entry.getAttribute("tram_dest_en")}`;

        finalArray.push(new ArrivalEntry(destName, ttnt, RouteList.HKT, 1, false));
    }
    return finalArray;
}

function getAPIURL(api, rt, stn, dir) {
    return api.url.replace("{rt}", rt).replace("{stn}", stn).replace("{dir}", dir);
}

export default { getHKTramways, getLightRail, getMetroRide, getMTRHeavyRail };