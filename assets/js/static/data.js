class Route {
    initials;
    api;
    name;
    color;
    secondaryColor;
    isLRT;
    directionInfo;
    stations;
    hidden;
    constructor(initials, api, name, color, secondaryColor, isLRT, directionInfo, stations, hidden) {
        this.initials = initials;
        this.api = api;
        this.name = name;
        this.color = color;
        this.secondaryColor = secondaryColor;
        this.isLRT = isLRT;
        this.directionInfo = directionInfo;
        this.stations = stations;
        this.hidden = hidden;
    }
}

class ArrivalEntry {
    dest;
    ttnt;
    absTime;
    plat;
    isLRT;
    paxLoad;
    isDeparture;
    firstClassCar;
    via;
    constructor(dest, ttnt, absTime, route, platformNumber, isLRT, isDeparture, paxLoad, firstClass, via) {
        this.dest = dest;
        this.ttnt = ttnt;
        this.absTime = absTime;
        this.plat = platformNumber;
        this.isLRT = isLRT;
        this.paxLoad = paxLoad;
        this.isDeparture = isDeparture;
        this.firstClassCar = firstClass;
        this.route = route;
        this.via = via;
    }
}

class Station {
    name;
    initials;
    platforms;
    marquee;
    constructor(initials, name, platforms, marquee = false) {
        this.name = name;
        this.initials = initials;
        this.platforms = platforms;
        this.marquee = marquee;
    }
}

const ETA_API = {
    NONE: {
        name: "None",
        urls: ""
    },
    MTR_OPEN: {
        name: "MTR Open Data",
        urls: [
            "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line={rt}&sta={stn}",
            "https://rp.lx86.workers.dev/mtr?line={rt}&sta={stn}" // Fallback cf worker reverse proxy in-case of CORS misconfiguration. Consider spinning up your own instance if you chose to fork.
        ],
        requestConfig: (rt, stn) => {}
    },
    MTR_LR: {
        name: "MTR Light Rail Data",
        urls: [
            "https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id={stn}"
        ],
        requestConfig: (rt, stn) => {}
    }
}

const DisplayMode = {
    NORMAL: "正常|Normal",
    AD: "只有廣告|Only Ads",
    ADNT1: "廣告+下一班車|Ads + Next 1 Train",
    NT4: "下四班車|Next 4 Trains",
    NT4_CT: "下四班車(時刻)|Next 4 Trains (Clock Time)"
}

const RouteList = {
    'TWL': new Route('TWL', ETA_API.MTR_OPEN, '荃灣綫|Tsuen Wan Line', '#ff0000', '#ff0000', false, ["TSW", "CEN"], ["CEN", "ADM", "TST", "JOR", "YMT", "MOK", "PRE", "SSP", "CSW", "LCK", "MEF", "LAK", "KWF", "KWH", "TWH", "TSW"]),
    'KTL': new Route('KTL', ETA_API.MTR_OPEN, '觀塘綫|Kwun Tong Line', '#1a9431', '#1a9431', false, ["TIK", "WHA"], ["TIK", "YAT", "LAT", "KWT", "NTK", "KOB", "CHH", "DIH", "WTS", "LOF", "KOT", "SKM", "PRE", "MOK", "YMT", "HOM", "WHA"]),
    'ISL': new Route('ISL', ETA_API.MTR_OPEN, '港島綫|Island Line', '#007dc5', '#007dc5', false, ["CHW", "KET"], ["KET", "HKU", "SYP", "SHW", "CEN", "ADM", "WAC", "CAB", "TIH", "FOH", "NOP", "QUB", "SWH", "SKW", "HFC", "CHW"]),
    'TKL': new Route('TKL', ETA_API.MTR_OPEN, '將軍澳綫|Tsueng Kwan O Line', '#7d499d', '#7d499d', false, ["POA", "NOP"], ["NOP", "QUB", "YAT", "TIK", "TKO", "LHP", "HAH", "POA"]),
    
    'TCL': new Route('TCL', ETA_API.MTR_OPEN, '東涌綫|Tung Chung Line', '#f7943e', '#f7943e', false, ["TUC", "HOK"], ["HOK", "KOW", "OLY", "NAC", "LAK", "TSY", "SUN", "TUC"]),
    'AEL': new Route('AEL', ETA_API.MTR_OPEN, '機場快綫|Airport Express', '#00888a', '#00888a', false, ["AWE", "HOK"], ["HOK", "KOW", "TSY", "AIR", "AWE"]),
    
    'TML': new Route('TML', ETA_API.MTR_OPEN, '屯馬綫|Tuen Ma Line', '#923011', '#923011', false, ["TUM", "WKS"], ["TUM", "SIH", "TIS", "LOP", "YUL", "KSR", "TWW", "MEF", "NAC", "AUS", "ETS", "HUH", "HOM", "TKW", "SUW", "KAT", "DIH", "HIK", "TAW", "CKT", "STW", "CIO", "SHM", "TSH", "HEO", "MOS", "WKS"]),
    'EAL': new Route('EAL', ETA_API.MTR_OPEN, '東鐵綫|East Rail Line', '#53b7e8', '#53b7e8', false, ["LOW", "ADM"], ["ADM", "EXC", "HUH", "MKK", "KOT", "TAW", "SHT", "RAC", "FOT", "UNI", "TAP", "TWO", "FAN", "SHS", "LOW", "LMC"]),
    
    'SIL': new Route('SIL', ETA_API.MTR_OPEN, '南港島綫|South Island Line', '#bac429', '#bac429', false, ["SOH", "ADM"], ["ADM", "OCP", "WCH", "LET", "SOH"]),
    
    'DRL': new Route('DRL', ETA_API.MTR_OPEN, '迪士尼綫|Disneyland Resorts Line', '#f173ac', '#f173ac', false, ["SUN", "DIS"], ["SUN", "DIS"]),
    
    'LRT': new Route('LRT', ETA_API.MTR_LR, '輕鐵|Light Rail', 'd3a809', '#d3a809', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR505': new Route('505', ETA_API.MTR_LR, '輕鐵 505|Light Rail 505', '#d3a809', '#da2128', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR507': new Route('507', ETA_API.MTR_LR, '輕鐵 507|Light Rail 507', '#d3a809', '#00a650', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR610': new Route('610', ETA_API.MTR_LR, '輕鐵 610|Light Rail 610', '#d3a809', '#551b14', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR614': new Route('614', ETA_API.MTR_LR, '輕鐵 614|Light Rail 614', '#d3a809', '#00c0f3', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR614P': new Route('614P', ETA_API.MTR_LR, '輕鐵 614P|Light Rail 614P', '#d3a809', '#f4858d', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR615': new Route('615', ETA_API.MTR_LR, '輕鐵 615|Light Rail 615', '#d3a809', '#ffdd00', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR615P': new Route('615P', ETA_API.MTR_LR, '輕鐵 615P|Light Rail 615P', '#d3a809', '#006684', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR705': new Route('705', ETA_API.MTR_LR, '輕鐵 705|Light Rail 705', '#d3a809', '#9acd32', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR706': new Route('706', ETA_API.MTR_LR, '輕鐵 706|Light Rail 706', '#d3a809', '#B27AB4', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR751': new Route('751', ETA_API.MTR_LR, '輕鐵 751|Light Rail 751', '#d3a809', '#f5821f', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR751P': new Route('751P', ETA_API.MTR_LR, '輕鐵 751P|Light Rail 751P', '#d3a809', '#000000', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR761P': new Route('761P', ETA_API.MTR_LR, '輕鐵 761P|Light Rail 761P', '#d3a809', '#6f2b91', true, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true)
}

let promotionData = {
    cycle: [
        {
            id: 1,
            framesrc: './promo/paxLoad.html',
            duration: 10000,
            isPaxLoad: true
        },
        {
            id: 2,
            framesrc: './promo/0.html',
            duration: 10000
        },
        {
            id: 3,
            framesrc: './promo/1.html',
            duration: 10000
        },
        {
            id: 4,
            framesrc: './promo/2.html',
            duration: 10000
        },
        {
            id: 5,
            framesrc: './promo/3.html',
            duration: 10000
        },
        {
            id: 6,
            framesrc: './promo/4.html',
            duration: 10000
        }
    ],
    special: [{
            id: "NONE",
            framesrc: null,
            queryString: null
        },
        {
            id: "STANDBACK_TRAIN",
            framesrc: './promo/custom_msg.html',
            queryString: '?zh=請勿靠近車門&en=Please stand back from the train doors'
        },
        {
            id: "STANDBACK_PSD",
            framesrc: './promo/custom_msg.html',
            queryString: '?zh=請勿靠近幕門&en=Please stand back from the platform doors'
        },
        {
            id: "STANDBACK_APG",
            framesrc: './promo/custom_msg.html',
            queryString: '?zh=請勿靠近閘門&en=Please stand back from the platform gates'
        },
        {
            id: "HUH_TML",
            framesrc: './promo/HUH_TML.html',
            queryString: ''
        },
        {
            id: "WELCOME_MTR",
            framesrc: './promo/welcome.html',
            queryString: ''
        },
        {
            id: "EMERGENCY",
            framesrc: './promo/emergency.html',
            queryString: '',
            isFullScreen: true
        }
    ]
}

const UIPreset = {
    "default": {
        title: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        eta: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        fontWeight: 600,
        titleWidth: 94,
        ETAWidth: 94,
        fontRatio: 1
    },
    "AEL": {
        title: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        eta: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        fontWeight: 600,
        titleWidth: 94,
        ETAWidth: 94,
        fontRatio: 0.9
    },
    "TCL": {
        title: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        eta: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        titleWidth: 94,
        ETAWidth: 94,
        fontWeight: 600,
        fontRatio: 1
    },
    "DRL": {
        title: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        eta: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        titleWidth: 94,
        ETAWidth: 94,
        fontWeight: 600,
        fontRatio: 1
    },
    "EAL": {
        title: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'DFLiSong-Md', 'Noto Sans', 'Noto Serif TC'",
        eta: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        titleWidth: 94,
        ETAWidth: 94,
        fontWeight: 600,
        fontRatio: 1
    },
    "TML": {
        title: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        eta: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        titleWidth: 94,
        ETAWidth: 94,
        fontWeight: 600,
        fontRatio: 1
    },
    "TKL": {
        title: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        eta: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        chinFontSpacing: "3rem",
        titleWidth: 93,
        ETAWidth: 93,
        fontWeight: 600,
        fontRatio: 1
    },
    "TWL": {
        title: "'Myriad Pro Semibold', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        arrivals: "'Myriad Pro Semibold', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        eta: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        chinFontSpacing: "3rem",
        titleWidth: 93,
        ETAWidth: 93,
        fontWeight: 600,
        fontRatio: 1
    },
    "ISL": {
        title: "'Myriad Pro Semibold', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        arrivals: "'Myriad Pro Semibold', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        eta: "'Myriad Pro', 'Noto Sans', 'DFLiSong-Md', 'Noto Serif TC'",
        chinFontSpacing: "3rem",
        titleWidth: 93,
        ETAWidth: 93,
        fontWeight: 600,
        fontRatio: 1.1
    }
}

const PIDS_OVERRIDE_DATA = {
    EAL: {
        default: {
            name: "馬場|Racecourse",
            viaSmall: true,
            via: " 經 | via ",
            marquee: true
        },
        EXC: {
            name: "馬場|racecourse",
            viaSmall: true,
            via: " 經| Via ",
            marquee: false
        },
        ADM: {
            name: "馬場|racecourse",
            viaSmall: true,
            via: " 經| via ",
            marquee: false
        }
    }
}

const StationList = new Map([
    /* Disneyland Resorts Line */
    ['DIS', new Station("DIS", "迪士尼|Disneyland Resort", [])],

    /* South Island Line */
    ['SOH', new Station("SOH", "海怡半島|South Horizons", [])],
    ['LET', new Station("LET", "利東|Lei Tung", [])],
    ['WCH', new Station("WCH", "黃竹坑|Wong Chuk Hang", [])],
    ['OCP', new Station("OCP", "海洋公園|Ocean Park", [])],

    /* Tsueng Kwan O Line */
    ['NOP', new Station("NOP", "北角|North Point", [])],
    ['QUB', new Station("QUB", "鰂魚涌|Quarry Bay", [])],
    ['YAT', new Station("YAT", "油塘|Yau Tong", [])],
    ['TIK', new Station("TIK", "調景嶺|Tiu Keng Leng", [])],
    ['TKO', new Station("TKO", "將軍澳|Tsueng Kwan O", [])],
    ['LHP', new Station("LHP", "康城|LOHAS Park", [])],
    ['HAH', new Station("HAH", "坑口|Hang Hau", [])],
    ['POA', new Station("POA", "寶琳|Po Lam", [])],

    /* Airport Express & Tung Chung Line  */
    ['HOK', new Station("HOK", "香港|Hong Kong", [])],
    ['KOW', new Station("KOW", "九龍|Kowloon", [])],
    ['OLY', new Station("OLY", "奧運|Olympic", [])],
    ['NAC', new Station("NAC", "南昌|Nam Cheong", [])],
    ['LAK', new Station("LAK", "茘景|Lai King", [])],
    ['TSY', new Station("TSY", "青衣|Tsing Yi", [])],
    ['AIR', new Station("AIR", "機場|Airport", [])],
    ['AWE', new Station("AWE", "機場及博覽館|Airport & AsiaWorld–Expo", [])],
    ['SUN', new Station("SUN", "欣澳|Sunny Bay", [])],
    ['OYB', new Station("OYB", "小蠔灣|Oyster Bay", [])],
    ['TCE', new Station("TCE", "東涌東|Tung Chung East", [])],
    ['TUC', new Station("TUC", "東涌|Tung Chung", [])],
    ['TCW', new Station("TCW", "東涌西|Tung Chung West", [])],

    /* Tuen Ma Line */
    ['TUM', new Station("TUM", "屯門|Tuen Mun", [])],
    ['SIH', new Station("SIH", "兆康|Siu Hong", [])],
    ['TIS', new Station("TIS", "天水圍|Tin Shui Wai", [])],
    ['LOP', new Station("LOP", "朗屏|Long Ping", [])],
    ['YUL', new Station("YUL", "元朗|Yuen Long", [])],
    ['KSR', new Station("KSR", "錦上路|Kam Sheung Road", [])],
    ['TWW', new Station("TWW", "荃灣西|Tsuen Wan West", [])],
    ['MEF', new Station("MEF", "美孚|Mei Foo", [])],
    ['AUS', new Station("AUS", "柯士甸|Austin", [])],
    ['ETS', new Station("ETS", "尖東|East Tsim Sha Tsui", [])],
    ['HUH', new Station("HUH", "紅磡|Hung Hom", [])],
    ['HOM', new Station("HOM", "何文田|Ho Man Tin", [])],
    ['TKW', new Station("TKW", "土瓜灣|To Kwa Wan", [])],
    ['SUW', new Station("SUW", "宋皇臺|Sung Wong Toi", [])],
    ['KAT', new Station("KAT", "啟德|Kai Tak", [])],
    ['DIH', new Station("DIH", "鑽石山|Diamond Hill", [])],
    ['HIK', new Station("HIK", "顯徑|Hin Keng", [])],
    ['TAW', new Station("TAW", "大圍|Tai Wai", [])],
    ['CKT', new Station("CKT", "車公廟|Che Kung Temple", [])],
    ['STW', new Station("STW", "沙田圍|Sha Tin Wai", [])],
    ['CIO', new Station("CIO", "第一城|City One", [])],
    ['SHM', new Station("SHM", "石門|Shek Mun", [])],
    ['TSH', new Station("TSH", "大水坑|Tai Shui Hang", [])],
    ['HEO', new Station("HEO", "恆安|Heng On", [])],
    ['MOS', new Station("MOS", "馬鞍山|Ma On Shan", [])],
    ['WKS', new Station("WKS", "烏溪沙|Wu Kai Sha", [])],

    /* East Rail Line */
    ['EXC', new Station("EXC", "會展|Exhibition Centre", [])],
    ['MKK', new Station("MKK", "旺角東|Mong Kok East", [])],
    ['KOT', new Station("KOT", "九龍塘|Kowloon Tong", [])],
    ['SHT', new Station("SHT", "沙田|Sha Tin", [])],
    ['FOT', new Station("FOT", "火炭|Fo Tan", [])],
    ['RAC', new Station("RAC", "馬場|Racecourse", [])],
    ['UNI', new Station("UNI", "大學|University", [])],
    ['TAP', new Station("TAP", "大埔墟|Tai Po Market", [])],
    ['TWO', new Station("TWO", "太和|Tai Wo", [])],
    ['FAN', new Station("FAN", "粉嶺|Fanling", [])],
    ['SHS', new Station("SHS", "上水|Sheung Shui")],
    ['LOW', new Station("LOW", "羅湖|Lo Wu", [])],
    ['LMC', new Station("LMC", "落馬洲|Lok Ma Chau", [])],

    /* Kwun Tong Line */
    ['WHA', new Station("WHA", "黃埔|Whampoa", [])],
    ['YMT', new Station("YMT", "油麻地|Yau Ma Tei", [])],
    ['MOK', new Station("MOK", "旺角|Mong Kok", [])],
    ['PRE', new Station("PRE", "太子|Prince Edward", [])],
    ['SKM', new Station("SKM", "石硤尾|Shek Kip Mei", [])],
    ['LOF', new Station("LOF", "樂富|Lok Fu", [])],
    ['WTS', new Station("WTS", "黃大仙|Wong Tai Sin", [])],
    ['CHH', new Station("CHH", "彩虹|Choi Hung", [])],
    ['KOB', new Station("KOB", "九龍灣|Kowloon Bay", [])],
    ['NTK', new Station("NTK", "牛頭角|Ngau Tau Kok", [])],
    ['KWT', new Station("KWT", "觀塘|Kwun Tong", [])],
    ['LAT', new Station("LAT", "藍田|Lam Tin", [])],

    /* Tsuen Wan Line */
    ['TSW', new Station("TSW", "荃灣|Tsuen Wan", [])],
    ['TWH', new Station("TWH", "大窩口|Tai Wo Hau", [])],
    ['KWH', new Station("KWH", "葵興|Kwai Hing", [])],
    ['KWF', new Station("KWF", "葵芳|Kwai Fong", [])],
    ['LCK', new Station("LCK", "茘枝角|Lai Chi Kok", [])],
    ['CSW', new Station("CSW", "長沙灣|Cheung Sha Wan", [])],
    ['SSP', new Station("SSP", "深水埗|Sham Shui Po", [])],
    ['JOR', new Station("JOR", "佐敦|Jordan", [])],
    ['TST', new Station("TST", "尖沙咀|Tsim Sha Tsui", [])],
    ['ADM', new Station("ADM", "金鐘|Admiralty", [])],
    ['CEN', new Station("CEN", "中環|Central", [])],

    /* Island Line */
    ['KET', new Station("KET", "堅尼地城|Kennedy Town", [])],
    ['HKU', new Station("HKU", "香港大學|HKU", [])],
    ['SYP', new Station("SYP", "西營盤|Sai Ying Pun", [])],
    ['SHW', new Station("SHW", "上環|Sheung Wan", [])],
    ['WAC', new Station("WAC", "灣仔|Wan Chai", [])],
    ['CAB', new Station("CAB", "銅鑼灣|Causeway Bay", [])],
    ['TIH', new Station("TIH", "天后|Tin Hau", [])],
    ['FOH', new Station("FOH", "炮台山|Fortress Hill", [])],
    ['TAK', new Station("TAK", "太古|Tai Koo", [])],
    ['SWH', new Station("SWH", "西灣河|Sai Wan Ho", [])],
    ['SKW', new Station("SKW", "筲箕灣|Shau Kei Wan", [])],
    ['HFC', new Station("HFC", "杏花邨|Heng Fa Chuen", [])],
    ['CHW', new Station("CHW", "柴灣|Chai Wan", [])],

    /* Light Rail */
    ["1", new Station("1", "屯門碼頭|Tuen Mun Ferry Pier", [2, 3, 4, 5, 7])],
    ["10", new Station("10", "美樂|Melody Garden", [1, 2])],
    ["15", new Station("15", "蝴蝶|Butterfly", [1, 2])],
    ["20", new Station("20", "輕鐵車廠|Light Rail Depot", [1, 2])],
    ["30", new Station("30", "龍門|Lung Mun", [1, 2])],
    ["40", new Station("40", "青山村|Tsing Shan Tsuen", [1, 2])],
    ["50", new Station("50", "青雲|Tsing Wun", [1, 2])],
    ["60", new Station("60", "建安|Kin On", [1, 2])],
    ["70", new Station("70", "河田|Ho Tin", [1, 2])],
    ["75", new Station("75", "蔡意橋|Choy Yee Bridge", [1, 2])],
    ["80", new Station("80", "澤豐|Affluence", [1, 2])],
    ["90", new Station("90", "屯門醫院|Tuen Mun Hospital", [1, 2])],
    ["100", new Station("100", "兆康|Siu Hong", [1, 2, 5, 6])],
    ["110", new Station("110", "麒麟|Kei Lun", [1, 2])],
    ["120", new Station("120", "青松|Ching Chung", [1, 2])],
    ["130", new Station("130", "建生|Kin Sang", [1, 2])],
    ["140", new Station("140", "田景|Tin King", [1, 2, 3])],
    ["150", new Station("150", "良景|Leung King", [1, 2])],
    ["160", new Station("160", "新圍|San Wai", [1, 2])],
    ["170", new Station("170", "石排|Shek Pai", [1, 2])],
    ["180", new Station("180", "山景 (北)|Shan King (North)", [1])],
    ["190", new Station("190", "山景 (南)|Shan King (South)", [1])],
    ["200", new Station("200", "鳴琴|Ming Kum", [1, 2])],
    ["212", new Station("212", "大興 (北)|Tai Hing (North)", [1, 2])],
    ["220", new Station("220", "大興 (南)|Tai Hing (South)", [1, 2])],
    ["230", new Station("230", "銀圍|Ngan Wai", [1, 2])],
    ["240", new Station("240", "兆禧|Siu Hei", [1, 2])],
    ["250", new Station("250", "屯門泳池|Tuen Mun Swimming Pool", [1, 2])],
    ["260", new Station("260", "豐景園|Goodview Garden", [1, 2])],
    ["265", new Station("265", "兆麟|Siu Lun", [1, 2])],
    ["270", new Station("270", "安定|On Ting", [1, 2])],
    ["275", new Station("275", "友愛|Yau Oi", [1])],
    ["280", new Station("280", "市中心|Town Centre", [1, 2, 3, 4])],
    ["295", new Station("295", "屯門|Tuen Mun", [1, 2])],
    ["300", new Station("300", "杯渡|Pui To", [1, 2])],
    ["310", new Station("310", "何福堂|Hoh Fuk Tong", [1, 2])],
    ["320", new Station("320", "新墟|San Hui", [1, 2])],
    ["330", new Station("330", "景峰|Prime View", [1, 2])],
    ["340", new Station("340", "鳳地|Fung Tei", [1, 2])],
    ["350", new Station("350", "藍地|Lam Tei", [1, 2])],
    ["360", new Station("360", "泥圍|Nai Wai", [1, 2])],
    ["370", new Station("370", "鍾屋村|Chung Uk Tsuen", [1, 2])],
    ["380", new Station("380", "洪水橋|Hung Shui Kiu", [1, 2])],
    ["390", new Station("390", "塘坊村|Tong Fong Tsuen", [1, 2])],
    ["400", new Station("400", "屏山|Ping Shan", [1, 2])],
    ["425", new Station("425", "坑尾村|Hang Mei Tsuen", [1, 2])],
    ["430", new Station("430", "天水圍|Tin Shui Wai", [1, 2, 3])],
    ["435", new Station("435", "天慈|Tin Tsz", [1, 2])],
    ["445", new Station("445", "天耀|Tin Yiu", [1, 2])],
    ["448", new Station("448", "樂湖|Locwood", [1, 2])],
    ["450", new Station("450", "天湖|Tin Wu", [1, 2])],
    ["455", new Station("455", "銀座|Ginza", [1, 2])],
    ["460", new Station("460", "天瑞|Tin Shui", [1, 2])],
    ["468", new Station("468", "頌富|Chung Fu", [1, 2])],
    ["480", new Station("480", "天富|Tin Fu", [1, 2])],
    ["490", new Station("490", "翠湖|Chestwood", [1, 2])],
    ["500", new Station("500", "天榮|Tin Wing", [6, 7])],
    ["510", new Station("510", "天悅|Tin Yuet", [1, 2])],
    ["520", new Station("520", "天秀|Tin Sau", [1, 2])],
    ["530", new Station("530", "濕地公園|Wetland Park", [1, 2])],
    ["540", new Station("540", "天恒|Tin Heng", [1, 2])],
    ["550", new Station("550", "天逸|Tin Yat", [1, 2, 4, 5])],
    ["560", new Station("560", "水邊圍|Shui Pin Wai", [1, 2])],
    ["570", new Station("570", "豐年路|Fung Nin Road", [1, 2])],
    ["580", new Station("580", "康樂路|Hong Lok Road", [1, 2])],
    ["590", new Station("590", "大棠路|Tai Tong Road", [1, 2])],
    ["600", new Station("600", "元朗|Yuen Long", [2, 3, 4, 5])],
    ["920", new Station("920", "三聖|Sam Shing", [1, 3])],
    ['NO_', new Station("NO_", "不載客列車|Not in Service", [])],
]);

function getRoute(initials) {
    return RouteList[initials];
}

function getStation(initials) {
    return StationList.get(initials);
}

export { Route, Station, ArrivalEntry, RouteList, StationList, DisplayMode, UIPreset, ETA_API, PIDS_OVERRIDE_DATA, promotionData, getRoute, getStation };