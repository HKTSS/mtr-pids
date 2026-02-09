import { RouteList, StationList, ArrivalEntry } from "./data.js"

function processLightRailData(data, route, stn, direction) {
    if (data.status == 0) {
        console.error(`No ETA Available: ${data.message}`);
        return [];
    }

    let finalData = [];
    for (const platform of data.platform_list) {
        let currentPlatform = platform.platform_id.toString();
        let isDeparture = false;
        if (platform.end_service_status == 1) continue;

        for (const entry of platform.route_list) {
            /* Replace to only numbers, e.g. 2 min -> 2 */
            const ttnt = entry.time_en.replace(/[^0-9.]/g, '');
            let ttntNum = parseInt(ttnt);
            if (isNaN(ttntNum)) {
                if (entry.time_en == "-") ttntNum = 0;
                if (entry.time_en == "Arriving" || entry.time_en == "Departing") ttntNum = 1;
                isDeparture = entry.time_en == "Departing";
            }
            
            let arrivalEntry = new ArrivalEntry(`${entry.dest_ch}|${entry.dest_en}`, ttntNum, null, RouteList[`LR${entry.route_no}`], currentPlatform, true, isDeparture, null, 0, "");
            finalData.push(arrivalEntry);
        }
        finalData.sort((a, b) => a.ttnt - b.ttnt);
    }
    return finalData;
}

function processHeavyRailData(data, route, stn, direction) {
    if (data.status == 0) {
        console.error(`No ETA Available: ${data.message}`);
        return [];
    }

    const routeAndStation = `${route}-${stn}`;
    const isTerminus = (RouteList[route].directionInfo ?? []).includes(stn.replace("LMC", "LOW"));

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
        let isDeparture = isTerminus;
        let routeData = RouteList[route];
        let arrTime = new Date(`${entry.time.replace(" ", "T")}+08:00`);
        let sysTime = new Date(`${data.sys_time.replace(" ", "T")}+08:00`);

        /* Calculate the time difference */
        let ttnt = Math.max(Math.ceil((arrTime - sysTime) / 60000), 0);
        let destName = StationList.get(entry.dest).name;

        if (entry.timeType == "A") {
            isDeparture = false;
        } else if (entry.timeType == "D") {
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

        let arrivalEntry = new ArrivalEntry(destName, ttnt, arrTime, routeData, entry.plat, false, isDeparture, entry.paxLoad ?? null, entry.firstClass, entry.route);
        finalData.push(arrivalEntry);
    }

    return finalData;
}

const ETA_API = [
    {
        name: "MTR Open Data",
        urls: [
            "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line={rt}&sta={stn}",
            "https://rp.lx86.workers.dev/mtr?line={rt}&sta={stn}" // Fallback cf worker reverse proxy in-case of CORS misconfiguration. Consider spinning up your own instance if you chose to fork.
        ],
        priority: 0,
        isSuitable: (lineName) => ["KTL", "TWL", "ISL", "TKL", "TML", "EAL", "TCL", "AEL", "SIL", "DRL"].includes(lineName),
        transformData: processHeavyRailData,
        requestConfig: (rt, stn) => {}
    },
    {
        name: "MTR Light Rail Data",
        urls: [
            "https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id={stn}"
        ],
        priority: 1,
        isSuitable: (lineName) => lineName.startsWith("LR"),
        transformData: processLightRailData,
        requestConfig: (rt, stn) => {}
    }
]

function getSuitableAPI(lineName) {
    let sortedApis = ETA_API.sort((e, f) => e.priority - f.priority);
    for(let api of sortedApis) {
        console.log(api);
        if(api.isSuitable(lineName)) return api;
        else console.warn("Failed for " + api.name);
    }
    console.warn("Unknown API: " + api);
    return null;
}

export { getSuitableAPI };