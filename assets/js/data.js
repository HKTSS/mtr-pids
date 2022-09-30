const WeatherUnit = "°C"
const Chinese = /\p{Script=Han}/u;

class Route {
    initials;
    api;
    name;
    color;
    isLRT;
    hasPaxLoad;
    directionInfo
    stations;
    hidden;
    constructor(initials, api, name, color, isLRT, hasPaxLoad, directionInfo, stations, hidden) {
        this.initials = initials
        this.api = api
        this.name = name
        this.color = color
        this.isLRT = isLRT
        this.hasPaxLoad = hasPaxLoad
        this.directionInfo = directionInfo;
        this.stations = stations;
        this.hidden = hidden;
    }
}

class ArrivalEntry {
    dest;
    ttnt;
    plat;
    isLRT;
    paxLoad;
    isDeparture;
    firstClassCar;
    via;
    marquee;
    constructor(dest, ttnt, route, platforms, isLRT, isDeparture, paxLoad, firstClass, via, marquee) {
        this.dest = dest
        this.ttnt = ttnt
        this.plat = platforms
        this.isLRT = isLRT
        this.paxLoad = paxLoad;
        this.isDeparture = isDeparture
        this.firstClassCar = firstClass
        this.route = route;
        this.via = via;
        this.marquee = marquee;
    }
}

class Station {
    name;
    initials;
    MRCode;
    platforms;
    marquee;
    constructor(initials, name, MRCode, platforms, marquee) {
        this.name = name;
        this.initials = initials;
        this.MRCode = MRCode;
        this.platforms = platforms;
        this.marquee = marquee;
    }
}

const ETA_API = {
    NONE: {
        name: "None",
        url: ""
    },
    METRO_RIDE: {
        name: "MetroRide",
        url: "https://MTRData.kennymhhui.repl.co/metroride?line={rt}&sta={stn}&dir={dir}"
    },
    MTR: {
        name: 'MTR',
        url: "https://MTRData.kennymhhui.repl.co/mtr?line=${rt}&sta=${stn}"
    },
    MTR_OPEN: {
        name: "MTR Open Data",
        url: "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line={rt}&sta={stn}"
    },
    MTR_LR: {
        name: "MTR Light Rail Data",
        url: "https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id={stn}"
    },
}

const WEATHER_API = {
    HKO_RHRREAD: {
        name: "HKO RHRREAD",
        url: "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en"
    },
    HKO_WARNING_INFO: {
        name: "HKO Warning Info",
        url: "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warningInfo&lang=en"
    }
}

function getAPIURL(api, rt, stn, dir) {
    return api.url.replace("{rt}", rt).replace("{stn}", stn).replace("{dir}", dir);
}

const DisplayMode = {
    NORMAL: "正常|Normal",
    AD: "只有廣告|Only Ads",
    ADNT1: "廣告+下一班車|Ads + Next 1 Train",
    NT4: "下四班車|Next 4 Trains"
}

const Lang = {
    'ENGLISH': 'en',
    'CHINESE': 'zh'
}

const RouteList = {
    'TCL': new Route('TCL', ETA_API.MTR_OPEN, '東涌綫|Tung Chung Line', 'f7943e', false, false, ["TUC", "HOK"], ["HOK", "KOW", "OLY", "NAC", "LAK", "TSY", "SUN", "TUC"]),
    'TML': new Route('TML', ETA_API.MTR, '屯馬綫|Tuen Ma Line', '923011', false, true, ["TUM", "WKS"], ["TUM", "SIH", "TIS", "LOP", "YUL", "KSR", "TWW", "MEF", "NAC", "AUS", "ETS", "HUH", "HOM", "TKW", "SUW", "KAT", "DIH", "HIK", "TAW", "CKT", "STW", "CIO", "SHM", "TSH", "HEO", "MOS", "WKS"]),
    'TKL': new Route('TKL', ETA_API.MTR_OPEN, '將軍澳綫|Tsueng Kwan O Line', '7d499d', false, false, ["POA", "NOP"], ["NOP", "QUB", "YAT", "TIK", "TKO", "LHP", "HAH", "POA"]),
    'AEL': new Route('AEL', ETA_API.MTR_OPEN, '機場快綫|Airport Express', '00888a', false, false, ["AWE", "HOK"], ["HOK", "KOW", "TSY", "AIR", "AWE"]),
    'EAL': new Route('EAL', ETA_API.MTR, '東鐵綫|East Rail Line', '53b7e8', false, true, ["SHS", "ADM"], ["ADM", "EXC", "HUH", "MKK", "KOT", "TAW", "SHT", "RAC", "FOT", "UNI", "TAP", "TWO", "FAN", "SHS"]),
    'DRL': new Route('DRL', ETA_API.METRO_RIDE, '迪士尼綫|Disneyland Resorts Line', 'f173ac', false, false, ["SUN", "DIS"], ["SUN", "DIS"]),
    'LRT': new Route('LRT', ETA_API.MTR_LR, '輕鐵|Light Rail', 'd3a809', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR505': new Route('505', ETA_API.MTR_LR, '輕鐵 505|Light Rail 505', 'da2128', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR507': new Route('507', ETA_API.MTR_LR, '輕鐵 507|Light Rail 507', '00a650', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR610': new Route('610', ETA_API.MTR_LR, '輕鐵 610|Light Rail 610', '551b14', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR614': new Route('614', ETA_API.MTR_LR, '輕鐵 614|Light Rail 614', '00c0f3', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR614P': new Route('614P', ETA_API.MTR_LR, '輕鐵 614P|Light Rail 614P', 'f4858d', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR615': new Route('615', ETA_API.MTR_LR, '輕鐵 615|Light Rail 615', 'ffdd00', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR615P': new Route('615P', ETA_API.MTR_LR, '輕鐵 615P|Light Rail 615P', '006684', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR705': new Route('705', ETA_API.MTR_LR, '輕鐵 705|Light Rail 705', '9acd32', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR706': new Route('706', ETA_API.MTR_LR, '輕鐵 706|Light Rail 706', 'B27AB4', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR751': new Route('751', ETA_API.MTR_LR, '輕鐵 751|Light Rail 751', 'f5821f', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR751P': new Route('751P', ETA_API.MTR_LR, '輕鐵 751P|Light Rail 751P', '000000', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true),
    'LR761P': new Route('761P', ETA_API.MTR_LR, '輕鐵 761P|Light Rail 761P', '6f2b91', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"], true)
}

let advData = {
    cycle: [{
            id: 0,
            framesrc: null,
            duration: 20000
        },
        {
            id: 1,
            framesrc: './adv/paxLoad.html',
            duration: 10000,
            isPaxLoad: true
        },
        {
            id: 2,
            framesrc: './adv/0.html',
            duration: 10000
        },
        {
            id: 3,
            framesrc: './adv/1.html',
            duration: 10000
        },
        {
            id: 4,
            framesrc: './adv/2.html',
            duration: 10000
        },
        {
            id: 5,
            framesrc: './adv/3.html',
            duration: 10000
        },
        {
            id: 6,
            framesrc: './adv/4.html',
            duration: 10000
        }
    ],
    special: [{
            id: "NONE",
            name: "無|None",
            framesrc: null,
            queryString: null
        },
        {
            id: "STANDBACK_TRAIN",
            name: "請勿靠近車門|Stand back from the train doors",
            framesrc: './adv/custom_msg.html',
            queryString: '?zh=請勿靠近車門&en=Please stand back from the train doors.'
        },
        {
            id: "STANDBACK_PSD",
            name: "請勿靠近幕門|Stand back from the platform doors",
            framesrc: './adv/custom_msg.html',
            queryString: '?zh=請勿靠近幕門&en=Please stand back from the platform doors.'
        },
        {
            id: "STANDBACK_APG",
            name: "請勿靠近閘門|Stand back from the platform gates",
            framesrc: './adv/custom_msg.html',
            queryString: '?zh=請勿靠近閘門&en=Please stand back from the platform gates.'
        },
        {
            id: "HUH_TML",
            name: "舊紅磡站西鐵月台|Old Hung Hom WRL Platform",
            framesrc: './adv/HUH_TML.html',
            queryString: ''
        },
        {
            id: "WELCOME_MTR",
            name: "歡迎乘搭港鐵|Welcome to the MTR",
            framesrc: './adv/welcome.html',
            queryString: ''
        }
    ]
}

const UIPreset = {
    "default": {
        title: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        fontWeight: 600,
        titleWidth: 95,
        ETAWidth: 95,
        fontRatio: 1
    },
    "AEL": {
        title: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        fontWeight: 600,
        titleWidth: 95,
        ETAWidth: 95,
        fontRatio: 0.9
    },
    "TCL": {
        title: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        eta: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        titleWidth: 95,
        ETAWidth: 95,
        fontWeight: 600,
        fontRatio: 1
    },
    "DRL": {
        title: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        titleWidth: 95,
        ETAWidth: 95,
        fontWeight: 600,
        fontRatio: 1
    },
    "EAL": {
        title: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        titleWidth: 95,
        ETAWidth: 95,
        fontWeight: 600,
        fontRatio: 1
    },
    "TML": {
        title: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        titleWidth: 92,
        ETAWidth: 93,
        fontWeight: 600,
        fontRatio: 1
    },
    "TKL": {
        title: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        arrivals: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        chinFontSpacing: "3rem",
        titleWidth: 95,
        ETAWidth: 95,
        fontWeight: 600,
        fontRatio: 1
    },
    "TWL": {
        title: "'Myriad Pro Semibold', 'Noto Sans', 'Noto Serif TC'",
        arrivals: "'Myriad Pro Semibold', 'Noto Sans', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Myriad Pro', 'Noto Sans', 'Noto Serif TC'",
        chinFontSpacing: "3.5rem",
        titleWidth: 95,
        ETAWidth: 95,
        fontWeight: 400,
        fontRatio: 1.1
    }
}

const ViaData = {
    EAL: {
        default: {
            name: "馬場|Racecourse",
            viaSmall: true,
            via: "經| via "
        },
        EXC: {
            name: "馬場|racecourse",
            viaSmall: true,
            via: " 經| Via "
        },
        ADM: {
            name: "馬場|racecourse",
            viaSmall: true,
            via: " 經| via "
        }
    }
}

const WeatherIcon = {
    '50': './assets/img/hko_icon/50.png',
    '51': './assets/img/hko_icon/51.png',
    '52': './assets/img/hko_icon/52.png',
    '53': './assets/img/hko_icon/53.png',
    '54': './assets/img/hko_icon/54.png',
    '60': './assets/img/hko_icon/60.png',
    '61': './assets/img/hko_icon/61.png',
    '62': './assets/img/hko_icon/62.png',
    '63': './assets/img/hko_icon/62.png',
    '64': './assets/img/hko_icon/64.png',
    '65': './assets/img/hko_icon/65.png',
    '70': './assets/img/hko_icon/50.png',
    '71': './assets/img/hko_icon/50.png',
    '72': './assets/img/hko_icon/50.png',
    '73': './assets/img/hko_icon/50.png',
    '74': './assets/img/hko_icon/50.png',
    '75': './assets/img/hko_icon/50.png',
    '76': './assets/img/hko_icon/60.png',
    '77': './assets/img/hko_icon/60.png',
    '80': './assets/img/hko_icon/80.png',
    '81': './assets/img/hko_icon/81.png',
    '82': './assets/img/hko_icon/82.png',
    '83': './assets/img/hko_icon/83.png',
    '84': './assets/img/hko_icon/84.png',
    '85': './assets/img/hko_icon/85.png',
    '90': './assets/img/hko_icon/85.png',
    '91': null,
    '92': null,
    '93': './assets/img/hko_icon/85.png',
    'WTS': './assets/img/hko_icon/warning/WTS.png',
    'WRAINA': './assets/img/hko_icon/warning/WRAINA.png',
	'WRAINB': './assets/img/hko_icon/warning/WRAINB.png',
	'WRAINR': './assets/img/hko_icon/warning/WRAINR.png',
    'WL': './assets/img/hko_icon/warning/WL.png',
    'WFIRER': './assets/img/hko_icon/warning/WFIRER.png',
    'WFIREY': './assets/img/hko_icon/warning/WFIREY.png',
	'WMSGNL': './assets/img/hko_icon/warning/WMSGNL.png',
    'TC1': './assets/img/hko_icon/warning/TC1.png',
    'TC3': './assets/img/hko_icon/warning/TC3.png',
    'TC8NE': './assets/img/hko_icon/warning/TC8NE.png',
    'TC8SE': './assets/img/hko_icon/warning/TC8SE.png',
    'TC8NW': './assets/img/hko_icon/warning/TC8NW.png',
    'TC8SW': './assets/img/hko_icon/warning/TC8SW.png',
    'TC9': './assets/img/hko_icon/warning/TC9.png',
    'TC10': './assets/img/hko_icon/warning/TC10.png'
}

const StationCodeList = new Map([
    /* Disneyland Resorts Line */
    ['DIS', new Station("DIS", "迪士尼|Disneyland Resort", 55, [], false)],

    /* South Island Line */
    ['SOH', new Station("SOH", "海怡半島|South Horizons", 90, [], false)],
    ['LET', new Station("LET", "利東|Lei Tung", 89, [], false)],
    ['WCH', new Station("WCH", "黃竹坑|Wong Chuk Hang", 88, [], false)],
    ['OCP', new Station("OCP", "海洋公園|Ocean Park", 87, [], false)],

    /* Tsueng Kwan O Line */
    ['NOP', new Station("NOP", "北角|North Point", 32, [], false)],
    ['QUB', new Station("QUB", "鰂魚涌|Quarry Bay", 33, [], false)],
    ['YAT', new Station("YAT", "油塘|Yau Tong", 49, [], false)],
    ['TIK', new Station("TIK", "調景嶺|Tiu Keng Leng", 50, [], false)],
    ['TKO', new Station("TKO", "將軍澳|Tsueng Kwan O", 51, [], false)],
    ['LHP', new Station("LHP", "康城|LOHAS Park", 64, [], false)],
    ['HAH', new Station("HAH", "坑口|Hang Hau", 52, [], false)],
    ['POA', new Station("POA", "寶琳|Po Lam", 53, [], false)],

    /* Airport Express & Tung Chung Line  */
    ['HOK', new Station("HOK", "香港|Hong Kong", 40, [], false)],
    ['KOW', new Station("KOW", "九龍|Kowloon", 41, [], false)],
    ['OLY', new Station("OLY", "奧運|Olympic", 42, [], false)],
    ['NAC', new Station("NAC", "南昌|Nam Cheong", [], false)],
    ['LAK', new Station("LAK", "茘景|Lai King", [], false)],
    ['TSY', new Station("TSY", "青衣|Tsing Yi", 43, [], false)],
    ['AIR', new Station("AIR", "機場|Airport", 48, [], false)],
    ['AWE', new Station("AWE", "機場及博覽館|Airport & AsiaWorld–Expo", 57, [], false)],
    ['SUN', new Station("SUN", "欣澳|Sunny Bay", 54, [], false)],
    ['OYB', new Station("OYB", "小蠔灣|Oyster Bay", [], false)],
    ['TCE', new Station("TCE", "東涌東|Tung Chung East", [], false)],
    ['TUC', new Station("TUC", "東涌|Tung Chung", 44, [], false)],
    ['TCW', new Station("TCW", "東涌西|Tung Chung West", [], false)],

    /* Tuen Ma Line */
    ['TUM', new Station("TUM", "屯門|Tuen Mun", 164, [], false)],
    ['SIH', new Station("SIH", "兆康|Siu Hong", 120, [], false)],
    ['TIS', new Station("TIS", "天水圍|Tin Shui Wai", 119, [], false)],
    ['LOP', new Station("LOP", "朗屏|Long Ping", 118, [], false)],
    ['YUL', new Station("YUL", "元朗|Yuen Long", 117, [], false)],
    ['KSR', new Station("KSR", "錦上路|Kam Sheung Road", 116, [], false)],
    ['TWW', new Station("TWW", "荃灣西|Tsuen Wan West", 115, [], false)],
    ['MEF', new Station("MEF", "美孚|Mei Foo", 114, [], false)],
    ['AUS', new Station("AUS", "柯士甸|Austin", 113, [], false)],
    ['ETS', new Station("ETS", "尖東|East Tsim Sha Tsui", 81, [], false)],
    ['HUH', new Station("HUH", "紅磡|Hung Hom", 65, [], false)],
    ['HOM', new Station("HOM", "何文田|Ho Man Tin", [], false)],
    ['TKW', new Station("TKW", "土瓜灣|To Kwa Wan", [], false)],
    ['SUW', new Station("SUW", "宋皇臺|Sung Wong Toi", [], false)],
    ['KAT', new Station("KAT", "啟德|Kai Tak", [], false)],
    ['DIH', new Station("DIH", "鑽石山|Diamond Hill", [], false)],
    ['HIK', new Station("HIK", "顯徑|Hin Keng", [], false)],
    ['TAW', new Station("TAW", "大圍|Tai Wai", 68, [], false)],
    ['CKT', new Station("CKT", "車公廟|Che Kung Temple", 97, [], false)],
    ['STW', new Station("STW", "沙田圍|Sha Tin Wai", 98, [], false)],
    ['CIO', new Station("CIO", "第一城|City One", 99, [], false)],
    ['SHM', new Station("SHM", "石門|Shek Mun", 100, [], false)],
    ['TSH', new Station("TSH", "大水坑|Tai Shui Hang", 101, [], false)],
    ['HEO', new Station("HEO", "恆安|Heng On", 102, [], false)],
    ['MOS', new Station("MOS", "馬鞍山|Ma On Shan", 103, [], false)],
    ['WKS', new Station("WKS", "烏溪沙|Wu Kai Sha", 111, [], false)],

    /* East Rail Line */
    ['EXC', new Station("EXC", "會展|Exhibition Centre", 96, [], false)],
    ['MKK', new Station("MKK", "旺角東|Mong Kok East", 66, [], false)],
    ['KOT', new Station("KOT", "九龍塘|Kowloon Tong", 46, [], false)],
    ['SHT', new Station("SHT", "沙田|Sha Tin", 69, [], false)],
    ['FOT', new Station("FOT", "火炭|Fo Tan", 70, [], false)],
    ['RAC', new Station("RAC", "馬場|Racecourse", 71, [], false)],
    ['UNI', new Station("UNI", "大學|University", 72, [], false)],
    ['TAP', new Station("TAP", "大埔墟|Tai Po Market", 73, [], false)],
    ['TWO', new Station("TWO", "太和|Tai Wo", 74, [], false)],
    ['FAN', new Station("FAN", "粉嶺|Fanling", 75, [], false)],
    ['SHS', new Station("SHS", "上水|Sheung Shui", 76, false)],
    ['LOW', new Station("LOW", "羅湖|Lo Wu", 78, [], false)],
    ['LMC', new Station("LMC", "落馬洲|Lok Ma Chau", 80, [], false)],

    /* Kwun Tong Line */
    ['WHA', new Station("WHA", "黃埔|Whampoa", 85, [], false)],
    ['YMT', new Station("YMT", "油麻地|Yau Ma Tei", 6, [], false)],
    ['MOK', new Station("MOK", "旺角|Mong Kok", 7, [], false)],
    ['PRE', new Station("PRE", "太子|Prince Edward", 16, [], false)],
    ['SKM', new Station("SKM", "石硤尾|Shek Kip Mei", 8, [], false)],
    ['LOF', new Station("LOF", "樂富|Lok Fu", 10, [], false)],
    ['WTS', new Station("WTS", "黃大仙|Wong Tai Sin", 11, [], false)],
    ['CHH', new Station("CHH", "彩虹|Choi Hung", 12, [], false)],
    ['KOB', new Station("KOB", "九龍灣|Kowloon Bay", 13, [], false)],
    ['NTK', new Station("NTK", "牛頭角|Ngau Tau Kok", 14, [], false)],
    ['KWT', new Station("KWT", "觀塘|Kwun Tong", 15, [], false)],
    ['LAT', new Station("LAT", "藍田|Lam Tin", 39, [], false)],

    /* Tsuen Wan Line */
    ['TSW', new Station("TSW", "荃灣|Tsuen Wan", 25, [], false)],
    ['TWH', new Station("TWH", "大窩口|Tai Wo Hau", 24, [], false)],
    ['KWH', new Station("KWH", "葵興|Kwai Hing", 23, [], false)],
    ['KWF', new Station("KWF", "葵芳|Kwai Fong", 22, [], false)],
    ['LCK', new Station("LCK", "茘枝角|Lai Chi Kok", 19, [], false)],
    ['CSW', new Station("CSW", "長沙灣|Cheung Sha Wan", 18, [], false)],
    ['SSP', new Station("SSP", "深水埗|Sham Shui Po", 17, [], false)],
    ['JOR', new Station("JOR", "佐敦|Jordan", 4, [], false)],
    ['TST', new Station("TST", "尖沙咀|Tsim Sha Tsui", 3, [], false)],
    ['ADM', new Station("ADM", "金鐘|Admiralty", 2, [], false)],
    ['CEN', new Station("CEN", "中環|Central", 1, [], false)],

    /* Island Line */
    ['KET', new Station("KET", "堅尼地城|Kennedy Town", 83, [], false)],
    ['HKU', new Station("HKU", "香港大學|HKU", 82, [], false)],
    ['SYP', new Station("SYP", "西營盤|Sai Ying Pun", 81, [], false)],
    ['SHW', new Station("SHW", "上環|Sheung Wan", 26, [], false)],
    ['WAC', new Station("WAC", "灣仔|Wan Chai", 27, [], false)],
    ['CAB', new Station("CAB", "銅鑼灣|Causeway Bay", 28, [], false)],
    ['TIH', new Station("TIH", "天后|Tin Hau", 29, [], false)],
    ['FOH', new Station("FOH", "炮台山|Fortress Hill", 30, [], false)],
    ['TAK', new Station("TAK", "太古|Tai Koo", 33, [], false)],
    ['SWH', new Station("SWH", "西灣河|Sai Wan Ho", 34, [], false)],
    ['SKW', new Station("SKW", "筲箕灣|Shau Kei Wan", 35, [], false)],
    ['HFC', new Station("HFC", "杏花邨|Heng Fa Chuen", 36, [], false)],
    ['CHW', new Station("CHW", "柴灣|Chai Wan", 37, [], false)],

    /* Light Rail */
    ["1", new Station("1", "屯門碼頭|Tuen Mun Ferry Pier", 1001, [2, 3, 4, 5, 7], [], false)],
    ["10", new Station("10", "美樂|Melody Garden", 1010, [1, 2], [], false)],
    ["15", new Station("15", "蝴蝶|Butterfly", 1015, [1, 2], [], false)],
    ["20", new Station("20", "輕鐵車廠|Light Rail Depot", 1020, [1, 2], [], false)],
    ["30", new Station("30", "龍門|Lung Mun", 1030, [1, 2], [], false)],
    ["40", new Station("40", "青山村|Tsing Shan Tsuen", 1040, [1, 2], [], false)],
    ["50", new Station("50", "青雲|Tsing Wun", 1050, [1, 2], [], false)],
    ["60", new Station("60", "建安|Kin On", 1060, [1, 2], [], false)],
    ["70", new Station("70", "河田|Ho Tin", 1070, [1, 2], [], false)],
    ["75", new Station("75", "蔡意橋|Choy Yee Bridge", 1075, [1, 2], [], false)],
    ["80", new Station("80", "澤豐|Affluence", 1080, [1, 2], [], false)],
    ["90", new Station("90", "屯門醫院|Tuen Mun Hospital", 1090, [1, 2], [], false)],
    ["100", new Station("100", "兆康|Siu Hong", 1100, [1, 2, 5, 6], [], false)],
    ["110", new Station("110", "麒麟|Kei Lun", 1110, [1, 2], [], false)],
    ["120", new Station("120", "青松|Ching Chung", 1120, [1, 2], [], false)],
    ["130", new Station("130", "建生|Kin Sang", 1130, [1, 2], [], false)],
    ["140", new Station("140", "田景|Tin King", 1140, [1, 2, 3], [], false)],
    ["150", new Station("150", "良景|Leung King", 1150, [1, 2], [], false)],
    ["160", new Station("160", "新圍|San Wai", 1160, [1, 2], [], false)],
    ["170", new Station("170", "石排|Shek Pai", 1170, [1, 2], [], false)],
    ["180", new Station("180", "山景 (北)|Shan King (North)", 1180, [1], [], false)],
    ["190", new Station("190", "山景 (南)|Shan King (South)", 1190, [1], [], false)],
    ["200", new Station("200", "鳴琴|Ming Kum", 1200, [1, 2], [], false)],
    ["212", new Station("212", "大興 (北)|Tai Hing (North)", 1212, [1, 2], [], false)],
    ["220", new Station("220", "大興 (南)|Tai Hing (South)", 1220, [1, 2], [], false)],
    ["230", new Station("230", "銀圍|Ngan Wai", 1230, [1, 2], [], false)],
    ["240", new Station("240", "兆禧|Siu Hei", 1250, [1, 2], [], false)],
    ["250", new Station("250", "屯門泳池|Tuen Mun Swimming Pool", 1250, [1, 2], [], false)],
    ["260", new Station("260", "豐景園|Goodview Garden", 1260, [1, 2], [], false)],
    ["265", new Station("265", "兆麟|Siu Lun", 1265, [1, 2], [], false)],
    ["270", new Station("270", "安定|On Ting", 1270, [1, 2], [], false)],
    ["275", new Station("275", "友愛|Yau Oi", 1275, [1], [], false)],
    ["280", new Station("280", "市中心|Town Centre", 1280, 4, [], false)],
    ["295", new Station("295", "屯門|Tuen Mun", 1295, [1, 2], [], false)],
    ["300", new Station("300", "杯渡|Pui To", 1300, [1, 2], [], false)],
    ["310", new Station("310", "何福堂|Hoh Fuk Tong", 1310, [1, 2], [], false)],
    ["320", new Station("320", "新墟|San Hui", 1320, [1, 2], [], false)],
    ["330", new Station("330", "景峰|Prime View", 1330, [1, 2], [], false)],
    ["340", new Station("340", "鳳地|Fung Tei", 1340, [1, 2], [], false)],
    ["350", new Station("350", "藍地|Lam Tei", 1350, [1, 2], [], false)],
    ["360", new Station("360", "泥圍|Nai Wai", 1360, [1, 2], [], false)],
    ["370", new Station("370", "鍾屋村|Chung Uk Tsuen", 1370, [1, 2], [], false)],
    ["380", new Station("380", "洪水橋|Hung Shui Kiu", 1380, [1, 2], [], false)],
    ["390", new Station("390", "塘坊村|Tong Fong Tsuen", 1390, [1, 2], [], false)],
    ["400", new Station("400", "屏山|Ping Shan", 1400, [1, 2], [], false)],
    ["425", new Station("425", "坑尾村|Hang Mei Tsuen", 1425, [1, 2], [], false)],
    ["430", new Station("430", "天水圍|Tin Shui Wai", 1430, [1, 2, 3], [], false)],
    ["435", new Station("435", "天慈|Tin Tsz", 1435, [1, 2], [], false)],
    ["445", new Station("445", "天耀|Tin Yiu", 1445, [1, 2], [], false)],
    ["448", new Station("448", "樂湖|Locwood", 1448, [1, 2], [], false)],
    ["450", new Station("450", "天湖|Tin Wu", 1450, [1, 2], [], false)],
    ["455", new Station("455", "銀座|Ginza", 1455, [1, 2], [], false)],
    ["460", new Station("460", "天瑞|Tin Shui", 1460, [1, 2], [], false)],
    ["468", new Station("468", "頌富|Chung Fu", 1468, [1, 2], [], false)],
    ["480", new Station("480", "天富|Tin Fu", 1480, [1, 2], [], false)],
    ["490", new Station("490", "翠湖|Chestwood", 1490, [1, 2], [], false)],
    ["500", new Station("500", "天榮|Tin Wing", 1500, [6, 7], [], false)],
    ["510", new Station("510", "天悅|Tin Yuet", 1510, [1, 2], [], false)],
    ["520", new Station("520", "天秀|Tin Sau", 1520, [1, 2], [], false)],
    ["530", new Station("530", "濕地公園|Wetland Park", 1530, [1, 2], [], false)],
    ["540", new Station("540", "天恒|Tin Heng", 1540, [1, 2], [], false)],
    ["550", new Station("550", "天逸|Tin Yat", 1550, [1, 2, 4, 5], [], false)],
    ["560", new Station("560", "水邊圍|Shui Pin Wai", 1560, [1, 2], [], false)],
    ["570", new Station("570", "豐年路|Fung Nin Road", 1570, [1, 2], [], false)],
    ["580", new Station("580", "康樂路|Hong Lok Road", 1580, [1, 2], [], false)],
    ["590", new Station("590", "大棠路|Tai Tong Road", 1590, [1, 2], [], false)],
    ["600", new Station("600", "元朗|Yuen Long", 1660, [2, 3, 4, 5], [], false)],
    ["920", new Station("920", "三聖|Sam Shing", 1920, [1, 3])]
])