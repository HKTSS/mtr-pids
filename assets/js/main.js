class Route {
    initials;
    api;
    name;
    color;
    isLRT;
    hasPaxLoad;
    via;
    directionInfo
    stations;
    constructor(initials, api, name, color, isLRT, hasPaxLoad, via, directionInfo, stations) {
        this.initials = initials
        this.api = api
        this.name = name
        this.color = color
        this.isLRT = isLRT
        this.hasPaxLoad = hasPaxLoad
        this.via = via;
        this.directionInfo = directionInfo;
        this.stations = stations;
    }
}

class ArrivalEntry {
    dest;
    ttnt;
    plat;
    isLRT;
    APISource;
    paxLoad;
    isDeparture;
    firstClassCar;
    constructor(dest, ttnt, route, platforms, isLRT, APISource, isDeparture, paxLoad, firstClass) {
        this.dest = dest
        this.ttnt = ttnt
        this.plat = platforms
        this.isLRT = isLRT
        this.APISource = APISource
        this.paxLoad = paxLoad;
        this.isDeparture = isDeparture
        this.firstClassCar = firstClass
        this.route = route;
    }
}

class Station {
    name;
    initials;
    MRCode;
    constructor(initials, name, MRCode) {
        this.name = name;
        this.initials = initials;
        this.MRCode = MRCode;
    }
}

const API = {
    NONE: 'None',
    METRO_RIDE: 'MetroRide',
    MTR: 'MTR',
    MTR_OPEN: 'MTR Open Data',
    MTR_LR: 'MTR Light Rail Data'
}

const RouteList = {
    'TCL': new Route('TCL', API.MTR_OPEN, '東涌綫|Tung Chung Line', 'f7943e', false, false, "", ["TUC", "HOK"], ["HOK", "KOW", "OLY", "NAC", "LAK", "TSY", "SUN", "TUC"]),
    'TML': new Route('TML', API.MTR, '屯馬綫|Tuen Ma Line', '923011', false, true, "", ["TUM", "WKS"], ["TUM", "SIH", "TIS", "LOP", "YUL", "KSR", "TWW", "MEF", "NAC", "AUS", "ETS", "HUH", "HOM", "TKW", "SUW", "KAT", "DIH", "HIK", "TAW", "CKT", "STW", "CIO", "SHM", "TSH", "HEO", "MOS", "WKS"]),
    'TKL': new Route('TKL', API.MTR_OPEN, '將軍澳綫|Tsueng Kwan O Line', '7d499d', false, false, "", ["POA", "NOP"], ["NOP", "QUB", "YAT", "TIK", "TKO", "LHP", "HAH", "POA"]),
    'AEL': new Route('AEL', API.MTR_OPEN, '機場快綫|Airport Express', '00888a', false, false, "", ["AWE", "HOK"], ["HOK", "KOW", "TSY", "AIR", "AWE"]),
    'EAL': new Route('EAL', API.MTR, '東鐵綫|East Rail Line', '53b7e8', false, true, "", ["SHS", "ADM"], ["ADM", "EXC", "HUH", "MKK", "KOT", "TAW", "SHT", "RAC", "FOT", "UNI", "TAP", "TWO", "FAN", "SHS"]),
    'EALRAC': new Route('EALRAC', API.MTR, '東涌綫|East Rail Line', '53b7e8', false, true, "RAC", ["ADM", "EXC", "HUH", "MKK", "KOT", "TAW", "SHT", "FOT", "RAC", "UNI", "TAP", "TWO", "FAN", "SHS"]),
    'DRL': new Route('DRL', API.METRO_RIDE, '迪士尼綫|Disneyland Resorts Line', 'f173ac', false, false, "", ["SUN", "DIS"], ["SUN", "DIS"]),
    'LRT': new Route('LRT', API.MTR_LR, '輕鐵|Light Rail', 'd3a809', true, false, "", [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR505': new Route('505', API.MTR_LR, '輕鐵 505|Light Rail 505', 'da2128', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR507': new Route('507', API.MTR_LR, '輕鐵 507|Light Rail 507', '00a650', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR610': new Route('610', API.MTR_LR, '輕鐵 610|Light Rail 610', '551b14', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR614': new Route('614', API.MTR_LR, '輕鐵 614|Light Rail 614', '00c0f3', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR614P': new Route('614P', API.MTR_LR, '輕鐵 614P|Light Rail 614P', 'f4858d', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR615': new Route('615', API.MTR_LR, '輕鐵 615|Light Rail 615', 'ffdd00', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR615P': new Route('615P', API.MTR_LR, '輕鐵 615P|Light Rail 615P', '006684', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR705': new Route('705', API.MTR_LR, '輕鐵 705|Light Rail 705', '9acd32', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR706': new Route('706', API.MTR_LR, '輕鐵 706|Light Rail 706', 'B27AB4', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR751': new Route('751', API.MTR_LR, '輕鐵 751|Light Rail 751', 'f5821f', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR751P': new Route('751P', API.MTR_LR, '輕鐵 751P|Light Rail 751P', '000000', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
    'LR761P': new Route('761P', API.MTR_LR, '輕鐵 761P|Light Rail 761P', '6f2b91', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"])
}

let selectedData = {
    'direction': 'UP',
    'route': null,
    'stn': null,
    'onlineMode': true,
    'showPlatform': true,
    'API': API.MTR_OPEN,
    'fontPreset': null,
    'hideAdv': false,
    'UILang': 'EN',
    'specialMsgID': "NONE"
}

let advData = {
    cycle: [{
            id: 0,
            framesrc: null,
            duration: 20000
        },
        {
            id: 1,
            framesrc: './adv/2.html',
            duration: 10000,
            isPaxLoad: true
        },
        {
            id: 2,
            framesrc: './adv/3.html',
            duration: 10000
        },
        {
            id: 3,
            framesrc: './adv/4.html',
            duration: 10000
        },
        {
            id: 4,
            framesrc: './adv/5.html',
            duration: 10000
        },
        {
            id: 5,
            framesrc: './adv/7.html',
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
            name: "請勿靠近車門|Stand back from the doors",
            framesrc: './adv/custom_msg.html',
            queryString: '?zh=請勿靠近車門&en=Please stand back\n from the doors.'
        },
        {
            id: "STANDBACK_PSD",
            name: "請勿靠近幕門|Stand back from the platform doors",
            framesrc: './adv/custom_msg.html',
            queryString: '?zh=請勿靠近幕門&en=Please stand back\n from the platform doors.'
        }
    ]
}

let arrivalVisbility = [true, true, true, true]
let nextAdvTime;

const FontPreset = {
    "default": {
        title: "'Myriad Pro', 'Noto Serif TC'",
        arrivals: "'Myriad Pro Semibold', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        fontWeight: 600,
        fontRatio: 1
    },
    "AEL": {
        title: "'Myriad Pro', 'Noto Serif TC'",
        arrivals: "'Myriad Pro Semibold', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        fontWeight: 600,
        fontRatio: 0.9
    },
    "TCL": {
        title: "'Myriad Pro', 'Noto Serif TC'",
        arrivals: "'Myriad Pro Semibold', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        fontWeight: 600,
        fontRatio: 1
    },
    "DRL": {
        title: "'Myriad Pro', 'Noto Serif TC'",
        arrivals: "'Myriad Pro Semibold', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        fontWeight: 600,
        fontRatio: 1
    },
    "EAL": {
        title: "'Myriad Pro Semibold', 'Noto Serif TC'",
        arrivals: "'Myriad Pro Semibold', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro Semibold', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        fontWeight: 600,
        fontRatio: 0.95
    },
    "TML": {
        title: "'Myriad Pro', 'Noto Serif TC'",
        arrivals: "'Myriad Pro Semibold', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Noto Serif TC'",
        chinFontSpacing: "normal",
        fontWeight: 600,
        fontRatio: 1
    },
    "TKL": {
        title: "'Myriad Pro Semibold', 'Noto Serif TC'",
        arrivals: "'Myriad Pro Semibold', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Serif TC'",
        eta: "'Myriad Pro', 'Noto Serif TC'",
        chinFontSpacing: "3.5rem",
        fontWeight: 900,
        fontRatio: 1.1
    },
    "TWL": {
        title: "'Myriad Pro Semibold', 'Noto Serif TC'",
        arrivals: "'Myriad Pro Semibold', 'Noto Serif TC'",
        platformCircle: "'Myriad Pro', 'Noto Serif TC'",
        eta: "'Myriad Pro Semibold', 'Noto Serif TC'",
        chinFontSpacing: "3.5rem",
        fontWeight: 400,
        fontRatio: 1.1
    }
}

const weatherIcon = {
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
    'WTS': './assets/img/hko_icon/warning/wts.png',
    'WRAINA': './assets/img/hko_icon/warning/wraina.png',
    'WL': './assets/img/hko_icon/warning/wl.png'
}
let currentLanguage = 'ZH'
let arrivalData = []
let weatherData = {}
let configOpened = false;
let currentAdvId = 0;
let showingSpecialMessage = false;

const stationCodeList = new Map([
    /* DRL START*/
    ['DIS', new Station("DIS", "迪士尼|Disneyland Resort", 55)],

    /* SIL START */
    ['SOH', new Station("SOH", "海怡半島|South Horizons", 90)],
    ['LET', new Station("LET", "利東|Lei Tung", 89)],
    ['WCH', new Station("WCH", "黃竹坑|Wong Chuk Hang", 88)],
    ['OCP', new Station("OCP", "海洋公園|Ocean Park", 87)],

    /* TKL START */
    ['NOP', new Station("NOP", "北角|North Point", 32)],
    ['QUB', new Station("QUB", "鰂魚涌|Quarry Bay", 33)],
    ['YAT', new Station("YAT", "油塘|Yau Tong", 49)],
    ['TIK', new Station("TIK", "調景嶺|Tiu Keng Leng", 50)],
    ['TKO', new Station("TKO", "將軍澳|Tsueng Kwan O", 51)],
    ['LHP', new Station("LHP", "康城|LOHAS Park", 64)],
    ['HAH', new Station("HAH", "坑口|Hang Hau", 52)],
    ['POA', new Station("POA", "寶琳|Po Lam", 53)],

    /* AEL & TCL START */
    ['HOK', new Station("HOK", "香港|Hong Kong", 40)],
    ['KOW', new Station("KOW", "九龍|Kowloon", 41)],
    ['OLY', new Station("OLY", "奧運|Olympic", 42)],
    ['NAC', new Station("NAC", "南昌|Nam Cheong")],
    ['LAK', new Station("LAK", "茘景|Lai King")],
    ['TSY', new Station("TSY", "青衣|Tsing Yi", 43)],
    ['AIR', new Station("AIR", "機場|Airport", 48)],
    ['AWE', new Station("AWE", "機場及博覽館|Airport & AsiaWorld–Expo", 57)],
    ['SUN', new Station("SUN", "欣澳|Sunny Bay", 54)],
    ['OYB', new Station("OYB", "小蠔灣|Oyster Bay")],
    ['TCE', new Station("TCE", "東涌東|Tung Chung East")],
    ['TUC', new Station("TUC", "東涌|Tung Chung", 44)],
    ['TCW', new Station("TCW", "東涌西|Tung Chung West")],

    /* TML START */
    ['TUM', new Station("TUM", "屯門|Tuen Mun", 164)],
    ['SIH', new Station("SIH", "兆康|Siu Hong", 120)],
    ['TIS', new Station("TIS", "天水圍|Tin Shui Wai", 119)],
    ['LOP', new Station("LOP", "朗屏|Long Ping", 118)],
    ['YUL', new Station("YUL", "元朗|Yuen Long", 117)],
    ['KSR', new Station("KSR", "錦上路|Kam Sheung Road", 116)],
    ['TWW', new Station("TWW", "荃灣西|Tsuen Wan West", 115)],
    ['MEF', new Station("MEF", "美孚|Mei Foo", 114)],
    ['AUS', new Station("AUS", "柯士甸|Austin", 113)],
    ['ETS', new Station("ETS", "尖東|East Tsim Sha Tsui", 81)],
    ['HUH', new Station("HUH", "紅磡|Hung Hom", 65)],
    ['HOM', new Station("HOM", "何文田|Ho Man Tin")],
    ['TKW', new Station("TKW", "土瓜灣|To Kwa Wan")],
    ['SUW', new Station("SUW", "宋皇臺|Sung Wong Toi")],
    ['KAT', new Station("KAT", "啟德|Kai Tak")],
    ['DIH', new Station("DIH", "鑽石山|Diamond Hill")],
    ['HIK', new Station("HIK", "顯徑|Hin Keng")],
    ['TAW', new Station("TAW", "大圍|Tai Wai", 68)],
    ['CKT', new Station("CKT", "車公廟|Che Kung Temple", 97)],
    ['STW', new Station("STW", "沙田圍|Sha Tin Wai", 98)],
    ['CIO', new Station("CIO", "第一城|City One", 99)],
    ['SHM', new Station("SHM", "石門|Shek Mun", 100)],
    ['TSH', new Station("TSH", "大水坑|Tai Shui Hang", 101)],
    ['HEO', new Station("HEO", "恆安|Heng On", 102)],
    ['MOS', new Station("MOS", "馬鞍山|Ma On Shan", 103)],
    ['WKS', new Station("WKS", "烏溪沙|Wu Kai Sha", 111)],

    /* EAL START */
    ['EXC', new Station("EXC", "會展|Exhibition Centre", 96)],
    ['MKK', new Station("MKK", "旺角東|Mong Kok East", 66)],
    ['KOT', new Station("KOT", "九龍塘|Kowloon Tong", ["KTL", "EAL"], 46)],
    ['SHT', new Station("SHT", "沙田|Sha Tin", 69)],
    ['FOT', new Station("FOT", "火炭|Fo Tan", 70)],
    ['RAC', new Station("RAC", "馬場|Racecourse", 71)],
    ['UNI', new Station("UNI", "大學|University", 72)],
    ['TAP', new Station("TAP", "大埔墟|Tai Po Market", 73)],
    ['TWO', new Station("TWO", "太和|Tai Wo", 74)],
    ['FAN', new Station("FAN", "粉嶺|Fanling", 75)],
    ['SHS', new Station("SHS", "上水|Sheung Shui", 76)],
    ['LOW', new Station("LOW", "羅湖|Lo Wu", 78)],
    ['LMC', new Station("LMC", "落馬洲|Lok Ma Chau", 80)],

    /* KTL START */
    ['WHA', new Station("WHA", "黃埔|Wongpoa")],
    ['YMT', new Station("YMT", "油麻地|Yau Ma Tei")],
    ['MOK', new Station("MOK", "旺角|Mong Kok")],
    ['PRE', new Station("PRE", "太子|Prince Edward")],
    ['SKM', new Station("SKM", "石硤尾|Shek Kip Mei")],
    ['LOF', new Station("LOF", "樂富|Lok Fu")],
    ['WTS', new Station("WTS", "黃大仙|Wong Tai Sin")],
    ['CHH', new Station("CHH", "彩虹|Choi Hung")],
    ['KOB', new Station("KOB", "九龍灣|Kowloon Bay")],
    ['NTK', new Station("NTK", "牛頭角|Ngau Tau Kok")],
    ['KWT', new Station("KWT", "觀塘|Kwun Tong")],
    ['LAT', new Station("LAT", "藍田|Lam Tin")],

    /* TWL START */
    ['TSW', new Station("TSW", "荃灣|Tsuen Wan")],
    ['TWH', new Station("TWH", "大窩口|Tai Wo Hau")],
    ['KWH', new Station("KWH", "葵興|Kwai Hing")],
    ['KWF', new Station("KWF", "葵芳|Kwai Fong")],
    ['LCK', new Station("LCK", "茘枝角|Lai Chi Kok")],
    ['CSW', new Station("CSW", "長沙灣|Cheung Sha Wan")],
    ['SSP', new Station("SSP", "深水埗|Sham Shui Po")],
    ['JOR', new Station("JOR", "佐敦|Jordan")],
    ['TST', new Station("TST", "尖沙咀|Tsim Sha Tsui")],
    ['ADM', new Station("ADM", "金鐘|Admiralty")],
    ['CEN', new Station("CEN", "中環|Central", '1')],

    /* ISL START */
    ['KET', new Station("KET", "堅尼地城|Kennedy Town")],
    ['HKU', new Station("HKU", "香港大學|HKU")],
    ['SYP', new Station("SYP", "西營盤|Sai Ying Pun")],
    ['SHW', new Station("SHW", "上環|Sheung Wan")],
    ['WAC', new Station("WAC", "灣仔|Wan Chai")],
    ['CAB', new Station("CAB", "銅鑼灣|Causeway Bay")],
    ['TIH', new Station("TIH", "天后|Tin Hau")],
    ['FOH', new Station("FOH", "炮台山|Fortress Hill")],
    ['TAK', new Station("TAK", "太古|Tai Koo")],
    ['SWH', new Station("SWH", "西灣河|Sai Wan Ho")],
    ['SKW', new Station("SKW", "筲箕灣|Shau Kei Wan")],
    ['HFC', new Station("HFC", "杏花邨|Heng Fa Chuen")],
    ['CHW', new Station("CHW", "柴灣|Chai Wan")],

    /* LRT START */
    ["1", new Station("1", "屯門碼頭|Tuen Mun Ferry Pier")],
    ["10", new Station("10", "美樂|Melody Garden")],
    ["15", new Station("15", "蝴蝶|Butterfly")],
    ["20", new Station("20", "輕鐵車廠|Light Rail Depot")],
    ["30", new Station("30", "龍門|Lung Mun")],
    ["40", new Station("40", "青山村|Tsing Shan Tsuen")],
    ["50", new Station("50", "青雲|Tsing Wun")],
    ["60", new Station("60", "建安|Kin On")],
    ["70", new Station("70", "河田|Ho Tin")],
    ["75", new Station("75", "蔡意橋|Choy Yee Bridge")],
    ["80", new Station("80", "澤豐|Affluence")],
    ["90", new Station("90", "屯門醫院|Tuen Mun Hospital")],
    ["100", new Station("100", "兆康|Siu Hong")],
    ["110", new Station("110", "麒麟|Kei Lun")],
    ["120", new Station("120", "青松|Ching Chung")],
    ["130", new Station("130", "建生|Kin Sang")],
    ["140", new Station("140", "田景|Tin King")],
    ["150", new Station("150", "良景|Leung King")],
    ["160", new Station("160", "新圍|San Wai")],
    ["170", new Station("170", "石排|Shek Pai")],
    ["180", new Station("180", "山景 (北)|Shan King (North)")],
    ["190", new Station("190", "山景 (南)|Shan King (South)")],
    ["200", new Station("200", "鳴琴|Ming Kum")],
    ["212", new Station("212", "大興 (北)|Tai Hing (North)")],
    ["220", new Station("220", "大興 (南)|Tai Hing (South)")],
    ["230", new Station("230", "銀圍|Ngan Wai")],
    ["240", new Station("240", "兆禧|Siu Hei")],
    ["250", new Station("250", "屯門泳池|Tuen Mun Swimming Pool")],
    ["260", new Station("260", "豐景園|Goodview Garden")],
    ["265", new Station("265", "兆麟|Siu Lun")],
    ["270", new Station("270", "安定|On Ting")],
    ["275", new Station("275", "友愛|Yau Oi")],
    ["280", new Station("280", "市中心|Town Centre")],
    ["295", new Station("295", "屯門|Tuen Mun")],
    ["300", new Station("300", "杯渡|Pui To")],
    ["310", new Station("310", "何福堂|Hoh Fuk Tong")],
    ["320", new Station("320", "新墟|San Hui")],
    ["330", new Station("330", "景峰|Prime View")],
    ["340", new Station("340", "鳳地|Fung Tei")],
    ["350", new Station("350", "藍地|Lam Tei")],
    ["360", new Station("360", "泥圍|Nai Wai")],
    ["370", new Station("370", "鍾屋村|Chung Uk Tsuen")],
    ["380", new Station("380", "洪水橋|Hung Shui Kiu")],
    ["390", new Station("390", "塘坊村|Tong Fong Tsuen")],
    ["400", new Station("400", "屏山|Ping Shan")],
    ["425", new Station("425", "坑尾村|Hang Mei Tsuen")],
    ["430", new Station("430", "天水圍|Tin Shui Wai")],
    ["435", new Station("435", "天慈|Tin Tsz")],
    ["445", new Station("445", "天耀|Tin Yiu")],
    ["448", new Station("448", "樂湖|Locwood")],
    ["450", new Station("450", "天湖|Tin Wu")],
    ["455", new Station("455", "銀座|Ginza")],
    ["460", new Station("460", "天瑞|Tin Shui")],
    ["468", new Station("468", "頌富|Chung Fu")],
    ["480", new Station("480", "天富|Tin Fu")],
    ["490", new Station("490", "翠湖|Chestwood")],
    ["500", new Station("500", "天榮|Tin Wing")],
    ["510", new Station("510", "天悅|Tin Yuet")],
    ["520", new Station("520", "天秀|Tin Sau")],
    ["530", new Station("530", "濕地公園|Wetland Park")],
    ["540", new Station("540", "天恒|Tin Heng")],
    ["550", new Station("550", "天逸|Tin Yat")],
    ["560", new Station("560", "水邊圍|Shui Pin Wai")],
    ["570", new Station("570", "豐年路|Fung Nin Road")],
    ["580", new Station("580", "康樂路|Hong Lok Road")],
    ["590", new Station("590", "大棠路|Tai Tong Road")],
    ["600", new Station("600", "元朗|Yuen Long")],
    ["920", new Station("920", "三聖|Sam Shing")]
])

function updateClock() {
    let currDate = new Date()
    let strMin = `${currDate.getMinutes()}`.padStart(2, '0')
    let strHour = `${currDate.getHours()}`.padStart(2, '0')
    $('.clock').text(`${strHour}:${strMin}`)
}

function switchLang(str, isUI = false) {
    let targetLang = isUI ? selectedData.UILang : currentLanguage

    let name = str.split("|")
    if (targetLang == 'EN') {
        return name[1] == undefined ? name[0] : name[1]
    } else {
        return name[0]
    }
}

/* This function puts the arrival destination text into a hidden element to calculate the width and make changes accordingly */
/* Hacky solution, but if it works then it works. */
function adjustFontSize() {
    $('.scalable').each(function() {
        const PADDING = 5;
        let ogSize = selectedData.fontPreset.fontRatio * parseInt($(this).css("font-size"));
        let tdWidth = $(this).width() - PADDING;
        let percentW = 1

        $('.widthCheck').text($(this).text())
        $('.widthCheck').css("font-size", ogSize)
        $('.widthCheck').css("font-family", $(this).css("font-family"))
        $(".widthCheck").css("letter-spacing", $(this).css("letter-spacing"));
        $(".widthCheck").css("font-weight", $(this).css("font-weight"));

        let resultWidth = $('.widthCheck').width()

        if (resultWidth > tdWidth) {
            percentW = (tdWidth / resultWidth)
        }

        $(this).css("font-size", `${ogSize * (percentW)}px`)
    });

    $('.platcircle').each(function() {
        $(this).flowtype({
            minimum: $(this).width(),
            maximum: $(this).width(),
            fontRatio: 1
        });
    })
}

function parseQuery() {
    let params = (new URL(document.location)).searchParams;
    let lang = params.get("lang");
    if (lang == null) return;
    lang = lang.toUpperCase()

    if (lang == 'EN' || lang == 'ZH') {
        selectedData.UILang = lang;
        $(`#langchoose`).text(lang == 'EN' ? 'EN' : '中')
    }
}

function drawUI() {
    $("#arrivalOverlay").empty();
    renderAdv()
    let entryIndex = 0;

    for (let i = 0; i < 4; i++) {
        let showing = arrivalVisbility[i];
        let arrivalEntryValid = entryIndex + 1 <= arrivalData.length && arrivalData[entryIndex] != null;

        if (!showing || !arrivalEntryValid) {
            $('#arrivalOverlay').append(`<tr><td>&nbsp;</td></tr>`)
            continue;
        }

        let entry = arrivalData[entryIndex]
        let stationName = selectedData.route.via ? `${switchLang(entry.dest)} ${switchLang("經|via")} ${switchLang(stationCodeList.get(selectedData.route.via).name)}` : switchLang(entry.dest);
        let timetext = ""

        if (entry.isDeparture == true) {
            if (entry.ttnt == 0) timetext = "正在離開|Departing"
            else timetext = "分鐘|min"
        } else {
            if (entry.ttnt == 0) {
                timetext = ""
            } else if (entry.ttnt == 1) {
                timetext = "即將抵達|Arriving"
            } else {
                timetext = "分鐘|min"
            }
        }

        let lrtElement = entry.route.isLRT ? `<span class="lrtrt" style="border-color:#${entry.route.color}">${entry.route.initials}</span>` : ""
        let tableRow = `<tr><td class="destination scalable">${lrtElement}${stationName}</td>`
        if (selectedData.showPlatform) tableRow += `<td style="width:10%"><span class="platcircle" style="background-color:#${selectedData.route.color}">${entry.plat}</span></td>`
        tableRow += `<td class="eta scalable">${entry.ttnt < 2 ? "" : Math.min(entry.ttnt, 99)} <span class="etamin scalable">${switchLang(timetext)}</span></td></tr>`
        $('#arrivalOverlay').append(tableRow)
        entryIndex++;
    }

    changeFontPreset()
    adjustFontSize()
}

function toggleConfigPage() {
    $('.config').fadeToggle(150, function() {
        if (this.style.display == 'block') {
            configOpened = true;
        } else {
            configOpened = false;
            saveConfig();
            updateData(true)
        }
    })

    setUILanguage(selectedData.UILang)
}

function setUILanguage(lang) {
    if (lang == 'EN') {
        $('.lang-en').show()
        $('.lang-zh').hide()
    } else {
        $('.lang-zh').show()
        $('.lang-en').hide()
    }

    $('.route > option').each(function() {
        $(this).text(switchLang(RouteList[$(this).val()].name, true))
    })

    $('.station > option').each(function() {
        $(this).text(switchLang(stationCodeList.get($(this).val()).name, true))
    })

    for (adv of advData.special) {
        $(`.specialMsg > option[value="${adv.id}"]`).text(`${switchLang(adv.name, true)}`)
    }

    $('.direction > option').each(function() {
        if (selectedData.route.directionInfo.length < 2) return;
        let UPTerminus = stationCodeList.get(selectedData.route.directionInfo[0]);
        let DNTerminus = stationCodeList.get(selectedData.route.directionInfo[1]);
        let Text = switchLang("往 |To ", true)

        if ($(this).val() == "UP") {
            $(this).text(Text + switchLang(UPTerminus.name, true))
        } else if ($(this).val() == "DOWN") {
            $(this).text(Text + switchLang(DNTerminus.name, true))
        } else {
            $(this).text(switchLang("雙向|Both", true))
        }
    })
}

function changeLanguage() {
    currentLanguage = currentLanguage == 'EN' ? 'ZH' : 'EN'
}

async function updateWeather() {
    weatherData = await queryWeather()
    if (weatherData == null) return;
    /* Update weather icon */
    let weatherIconList = weatherData.rhrread.icon;
    let weatherWarningList = weatherData.warning.details;

    $('#weatherIcon').empty()
    for (iconID of weatherIconList) {
        icon = weatherIcon[iconID];
        if (icon == null) continue;
        $('#weatherIcon').append(`<img src=${icon}>`);
    }

    if (weatherWarningList) {
        for (warns of weatherWarningList) {
            let code = warns.subtype ? warns.subtype : warns.warningStatementCode
            let icon = weatherIcon[code];

            if (!icon) continue;
            $('#weatherIcon').append(`<img src='${icon}'>`);
        }
    }

    /* Update temperature */
    let temperatureData = weatherData.rhrread.temperature.data;
    let temperature = 0;
    for (place of temperatureData) {
        temperature = temperature + parseInt(place.value);
    }

    /* Average the temperature collected from all stations */
    temperature = Math.round(temperature / temperatureData.length)
    $('#weather').text(temperature);
}

async function queryWeather() {
    try {
        let rhrread = await fetch(`https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en`)
        let warning = await fetch(`https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warningInfo&lang=en`)

        return {
            rhrread: await rhrread.json(),
            warning: await warning.json()
        }
    } catch (err) {
        return null;
    }
}

async function queryData(direction) {
    let api = selectedData.route.api
    if (api == API.NONE) return;

    if (api == API.MTR_LR) {
        const response = await fetch(`https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id=${selectedData.stn.initials}`, {
            headers: {}
        });

        if (!response.ok) {
            error(`Cannot fetch arrival data (${response.status}).`)
            return []
        }

        const data = await response.json()

        if (data.status == 0) {
            error(`No arrival data:\n${data.message}`)
            return []
        }

        let finalArray = []
        for (platform of data.platform_list) {
            let currentPlatform = platform.platform_id
            let isDeparture = false;
            if (platform.end_service_status == 1) continue;

            for (entry of platform.route_list) {
                let ttnt = entry.time_en.replace(/[^0-9.]/g, '')
                if (!parseInt(ttnt)) {
                    if (entry.time_en == "-") ttnt = 0
                    if (entry.time_en == "Arriving") ttnt = 1
                    if (entry.time_en == "Departing") isDeparture = true;
                }

                let convertedEntry = new ArrivalEntry(`${entry.dest_ch}|${entry.dest_en}`, ttnt, RouteList[`LR${entry.route_no}`], currentPlatform, true, "MTR_LR", isDeparture, null)
                finalArray.push(convertedEntry)
            }
        }
        finalArray.sort((a, b) => a.ttnt - b.ttnt)
        $('#error').hide()
        return finalArray;
    }

    if (api == API.MTR_OPEN || api == API.MTR) {
        let response;
        if (api == API.MTR_OPEN) {
            response = await fetch(`https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${selectedData.route.initials}&sta=${selectedData.stn.initials}`);
        } else {
            response = await fetch(`https://MTRData.kennymhhui.repl.co/mtr?line=${selectedData.route.initials}&sta=${selectedData.stn.initials}`);
        }

        if (!response.ok) {
            return []
        }

        const data = await response.json()
        const routeAndStation = `${selectedData.route.initials}-${selectedData.stn.initials}`

        if (data.status == 0) {
            error(`Cannot fetch arrival data:\n${data.message}`)
            return []
        }
        let tempArray = []
        let finalArray = []

        if (direction == 'BOTH') {
            let arrUP, arrDN;
            if (data.data[routeAndStation].hasOwnProperty('UP')) {
                arrUP = data.data[routeAndStation]['UP']
            } else {
                arrUP = [];
            }

            if (data.data[routeAndStation].hasOwnProperty('DOWN')) {
                arrDN = data.data[routeAndStation]['DOWN']
            } else {
                arrDN = [];
            }

            /* Merge array from both directions */
            tempArray = arrUP.concat(arrDN)
        } else if (routeAndStation in data.data) {
            if (selectedData.direction in data.data[routeAndStation]) {
                tempArray = data.data[routeAndStation][selectedData.direction]
            } else {
                tempArray = [];
            }
        }

        /* Sort by remaining time */
        tempArray.sort((a, b) => a.ttnt - b.ttnt)

        /* Convert data to adapt to a standardized format */
        for (entry of tempArray) {
            let arrTime = new Date(entry.time)
            let isDeparture;
            entry.ttnt = Math.max(Math.floor((arrTime - Date.now()) / 60000), 0)
            let destName = stationCodeList.get(entry.dest).name

            /* EAL only */
            if (selectedData.route.initials == "EAL") {
                if (entry.timeType == "D") {
                    isDeparture = true;
                }

                entry.firstClass = selectedData.direction == "UP" ? 4 : 6
            }

            let convertedEntry = new ArrivalEntry(destName, entry.ttnt, RouteList[selectedData.route.initials], entry.plat, false, "MTR", isDeparture, entry.paxLoad ? entry.paxLoad : null, entry.firstClass)
            finalArray.push(convertedEntry)
        }

        $('#error').hide()
        return finalArray;
    }

    if (api == API.METRO_RIDE) {
        let directionURL = direction == 'BOTH' ? "" : `&dir=${direction}`
        const response = await fetch(`https://MTRData.kennymhhui.repl.co/metroride?line=${selectedData.route.initials}&sta=${selectedData.stn.MRCode}${directionURL}`)
        const data = await response.json()
        arrivalData = []

        let finalArray = [];
        for (entry of data.eta) {
            let station = null;
            for (stn of stationCodeList.values()) {
                if (stn.MRCode == entry.destination) {
                    station = stn;
                    break;
                }
            }
            if (station == null) return [];
            let stnName = station.name

            let convertedEntry = new ArrivalEntry(stnName, entry.ttnt, RouteList[selectedData.route.initials], entry.platform, false, "MetroRide")
            finalArray.push(convertedEntry)
        }
        $('#error').hide()
        return finalArray;
    }
}

async function updateData(forced) {
    if (configOpened && !forced) return;
    if (!selectedData.onlineMode) return drawUI();

    let newArrivalData = await queryData(selectedData.direction)
    if (newArrivalData == null) return;

    arrivalData = newArrivalData
    drawUI()
}

function saveConfig() {
    if (selectedData.onlineMode) {
        selectedData.route = RouteList[$(`.route`).val()]
        selectedData.fontPreset = FontPreset[selectedData.route.initials]
        selectedData.direction = $('.direction').val()
        selectedData.stn = stationCodeList.get($('.station').val())
    } else {
        let customFontRatio = $('.fontRatioCustom').val()
        let routeColor = $('.rtColor').val()

        if (!parseInt(customFontRatio)) {
            customFontRatio = 1;
        } else {
            customFontRatio = parseInt(customFontRatio)
        }

        if (!$('.rtColor').val()) {
            routeColor = '000000'
        }

        selectedData.route = new Route("CUSTOM", "NONE", "Custom Route", routeColor, false, false)

        let defPreset = FontPreset["default"]
        defPreset.fontRatio = customFontRatio
        selectedData.fontPreset = defPreset;

        let customArrivalData = []
        for (let i = 0; i < 4; i++) {
            let destination = $(`#dest${i + 1}`).val()
            let platform = $(`#plat${i + 1}`).val()
            let timetilnexttrain = $(`#ttnt${i + 1}`).val()

            if (!destination && !platform && !timetilnexttrain) {
                customArrivalData.push(null)
                continue;
            }

            if (!platform) platform = 1;
            if (!timetilnexttrain) timetilnexttrain = 0;

            customArrivalData.push({
                dest: destination,
                plat: platform,
                route: selectedData.route,
                ttnt: timetilnexttrain,
                isLRT: false
            })
        }

        arrivalData = customArrivalData;
    }

    let specialMsgID = $('.specialMsg').val() == null ? 'NONE' : $('.specialMsg').val();

    if (specialMsgID != 'NONE') {
        showingSpecialMessage = true;
        selectedData.specialMsgID = specialMsgID;
    } else {
        showingSpecialMessage = false;
        selectedData.specialMsgID = "NONE";
    }

    selectedData.hideAdv = $('.hideAdv').is(':checked')
    selectedData.showPlatform = $('.showPlat').is(':checked')
}

function cycleAdv() {
    if (currentAdvId + 1 < advData.cycle.length) {
        currentAdvId++
    } else {
        currentAdvId = 0;
    }
    let nextAdCycle = advData.cycle[currentAdvId]
    nextAdvTime = Date.now() + nextAdCycle.duration;
}

function renderAdv(firstLoad) {
    if (firstLoad) {
        nextAdvTime = Date.now()
    }

    let nextAdCycle = advData.cycle[currentAdvId]
    if (Date.now() >= nextAdvTime || (nextAdCycle.isPaxLoad && !selectedData.route.hasPaxLoad)) {
        cycleAdv()
        renderAdv()
    }

    if (showingSpecialMessage) {
        nextAdCycle = advData.special.filter(e => e.id == selectedData.specialMsgID)[0];
    }

    for (adv of advData.cycle) {
        $(`.promo-${adv.id}`).hide()
    }

    for (adv of advData.special) {
        $(`.promo-${adv.id}`).hide()
    }

    const ONE_ROW_HEIGHT = $('#arrivalBackground tr td:first').height()
    const TITLE_HEIGHT = $('#titlebar').height()
    let finalHeight = $(window).height() - TITLE_HEIGHT - ONE_ROW_HEIGHT;
    $('#advertisement').css("height", `${finalHeight}px`)

    if (nextAdCycle.framesrc == null || (selectedData.hideAdv && !showingSpecialMessage)) {
        arrivalVisbility = [true, true, true, true]
        $('#advertisement').hide()
    } else {
        $('#advertisement').show()
        $(`.promo-${nextAdCycle.id}`).show()
        arrivalVisbility = [false, false, false, true]
    }

    if (showingSpecialMessage) {
        let fullURL = nextAdCycle.framesrc + nextAdCycle.queryString;
        let dirty = false
        $('#advertisement').show()
        if ($(`.promo-${nextAdCycle.id}`).length > 0) {
            if (fullURL != $(`.promo-${nextAdCycle.id}`).attr("src")) {
                dirty = true
            }
        }

        if (dirty) {
            $(`.promo-${nextAdCycle.id}`).attr("src", fullURL)
            $(`.promo-${nextAdCycle.id}`).show()
        }
        return;
    }

    if (firstLoad) {
        $('#advertisement').empty()
        for (let cate in advData) {
            for (adv of advData[cate]) {
                if (adv.framesrc != null) {
                    $('#advertisement').append(`<iframe style="display:block" class="promo-${adv.id} centeredItem" src=${adv.framesrc}></iframe>`)
                }
            }
        }
    }

    if (nextAdCycle.isPaxLoad) {
        let paxArray = []
        if (arrivalData[0] && arrivalData[0].paxLoad && arrivalData[0].paxLoad.length > 1) {
            for (pax of arrivalData[0].paxLoad) {
                paxArray.push(pax.availability)
            }
            let firstClassCar = arrivalData[0].firstClassCar ? arrivalData[0].firstClassCar : 0

            let curURL = $(`.promo-${nextAdCycle.id}`).attr("src")
            let fullURL = `${nextAdCycle.framesrc}?data=${paxArray.join(",")}&firstClass=${firstClassCar}`
            if (curURL == fullURL) return;

            $(`.promo-${nextAdCycle.id}`).attr("src", fullURL)
        } else {
            cycleAdv()
            renderAdv()
        }
    }
}

function changeFontPreset() {
    let preset = selectedData.fontPreset;
    if (preset == null) {
        preset = FontPreset["default"]
        selectedData.fontPreset = FontPreset["default"]
    }

    if (currentLanguage == 'ZH') {
        $(".destination").css("letter-spacing", preset.chinFontSpacing);
        $(".destination").css("font-weight", preset.fontWeight);
        $(".etamin").css("font-weight", preset.fontWeight);
    } else {
        $(".destination").css("letter-spacing", `normal`);
        $(".destination").css("font-weight", "normal");
        $(".etamin").css("font-weight", "normal");
    }

    $("#titlebar").css(`font-family`, preset.title);
    $(".platcircle").css("font-family", preset.platformCircle);
    $(".destination").css("font-family", preset.arrivals);
    $(".eta").css("font-family", preset.eta);
}

function setupConfigUI() {
    /* Show the corresponding station list of the route */
    $('.station').empty()

    for (stnCode of selectedData.route.stations) {
        $('.station').append(`<option value="${stnCode}">${switchLang(stationCodeList.get(stnCode).name, true)}`)
    }
    selectedData.stn = stationCodeList.get(selectedData.route.stations[0])

    // $('.route').empty()
    // for (key in RouteList) {
    //     $('.route').append(`<option style="background-color:#${RouteList[key].color}" value="${key}">${switchLang(RouteList[key].name)}</option>`)
    // }
    // selectedData.route = RouteList[$('.route').val()]

    $('.specialMsg').empty()
    for (adv of advData.special) {
        $('.specialMsg').append(`<option value="${adv.id}">${switchLang(adv.name, true)}`)
    }
}

function error(text) {
    $('#error').show();
    $('#error').text(text);
}

$(document).ready(async function() {
    parseQuery()
    updateClock()
    updateWeather()
    saveConfig()
    setupConfigUI()
    renderAdv(true)
    updateData(true)
    setUILanguage(selectedData.UILang)
    setInterval(updateClock, 1000)
    setInterval(changeLanguage, 10000)
    setInterval(updateData, 10000, false)
    setInterval(drawUI, 1000)
    setInterval(updateWeather, 60000, false)

    $('.onlineMode').on('change', function() {
        selectedData.onlineMode = $(this).is(':checked')
        if (selectedData.onlineMode) {
            $(".online").show()
            $(".offline").hide()
            selectedData.route = RouteList[$('.route').val()];
        } else {
            $(".online").hide()
            $(".offline").show()
        }
    })

    $('.route').on('change', function() {
        selectedData.route = RouteList[$(this).val()];
        setupConfigUI()
        setUILanguage()

        if (selectedData.route.isLRT) {
            $('.direction').prop("disabled", true)
                // platformAmt = stationCodeList.get($('.station').val()).platformCount
                // $('#platform').empty()
                // for(i = 0; i < platformAmt; i++) {
                //     $('#platform').append(`<option value=${i}>${i}</option>`)
                // }
                // $('#platform').show()
        } else {
            $('.direction').prop("disabled", false)
        }
    })

    $('#langchoose').on('click', function() {
        let toggledLang = selectedData.UILang == 'EN' ? 'ZH' : 'EN'
        selectedData.UILang = toggledLang;
        $(`#langchoose`).text(toggledLang == 'EN' ? 'EN' : '中')
        setUILanguage(selectedData.UILang)
    })

    $('.saveCfg').on('click', function() {
        toggleConfigPage()
    })
})

$(window).on('keydown', function(e) {
    if (e.which == 13) {
        toggleConfigPage()
    }

    if (e.which == 71) {
        changeLanguage()
        cycleAdv()
        renderAdv()
        drawUI()
    }
})