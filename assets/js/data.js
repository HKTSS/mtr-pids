class Route {
    initials;
    api;
    name;
    color;
    isLRT;
    hasPaxLoad;
    directionInfo
    stations;
    constructor(initials, api, name, color, isLRT, hasPaxLoad, directionInfo, stations) {
        this.initials = initials
        this.api = api
        this.name = name
        this.color = color
        this.isLRT = isLRT
        this.hasPaxLoad = hasPaxLoad
        this.directionInfo = directionInfo;
        this.stations = stations;
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
    constructor(dest, ttnt, route, platforms, isLRT, isDeparture, paxLoad, firstClass, via) {
        this.dest = dest
        this.ttnt = ttnt
        this.plat = platforms
        this.isLRT = isLRT
        this.paxLoad = paxLoad;
        this.isDeparture = isDeparture
        this.firstClassCar = firstClass
        this.route = route;
        this.via = via;
    }
}

class Station {
    name;
    initials;
    MRCode;
    platforms;
    constructor(initials, name, MRCode, platforms) {
        this.name = name;
        this.initials = initials;
        this.MRCode = MRCode;
        this.platforms = platforms;
    }
}

const API = {
    NONE: 'None',
    METRO_RIDE: 'MetroRide',
    MTR: 'MTR',
    MTR_OPEN: 'MTR Open Data',
    MTR_LR: 'MTR Light Rail Data'
}

const DisplayMode = {
    NORMAL: "正常|Normal",
    AD: "只有廣告|Only Ads",
    ADNT1: "廣告+下一班車|Ads + Next 1 Train",
    NT4: "下四班車|Next 4 Trains"
}

const RouteList = {
    'TCL': new Route('TCL', API.MTR_OPEN, '東涌綫|Tung Chung Line', 'f7943e', false, false, ["TUC", "HOK"], ["HOK", "KOW", "OLY", "NAC", "LAK", "TSY", "SUN", "TUC"]),
    'TML': new Route('TML', API.MTR, '屯馬綫|Tuen Ma Line', '923011', false, true, ["TUM", "WKS"], ["TUM", "SIH", "TIS", "LOP", "YUL", "KSR", "TWW", "MEF", "NAC", "AUS", "ETS", "HUH", "HOM", "TKW", "SUW", "KAT", "DIH", "HIK", "TAW", "CKT", "STW", "CIO", "SHM", "TSH", "HEO", "MOS", "WKS"]),
    'TKL': new Route('TKL', API.MTR_OPEN, '將軍澳綫|Tsueng Kwan O Line', '7d499d', false, false, ["POA", "NOP"], ["NOP", "QUB", "YAT", "TIK", "TKO", "LHP", "HAH", "POA"]),
    'AEL': new Route('AEL', API.MTR_OPEN, '機場快綫|Airport Express', '00888a', false, false, ["AWE", "HOK"], ["HOK", "KOW", "TSY", "AIR", "AWE"]),
    'EAL': new Route('EAL', API.MTR, '東鐵綫|East Rail Line', '53b7e8', false, true, ["SHS", "ADM"], ["ADM", "EXC", "HUH", "MKK", "KOT", "TAW", "SHT", "RAC", "FOT", "UNI", "TAP", "TWO", "FAN", "SHS"]),
    'DRL': new Route('DRL', API.METRO_RIDE, '迪士尼綫|Disneyland Resorts Line', 'f173ac', false, false, ["SUN", "DIS"], ["SUN", "DIS"]),
    'LRT': new Route('LRT', API.MTR_LR, '輕鐵|Light Rail', 'd3a809', true, false, [], ["1", "10", "15", "20", "30", "40", "50", "60", "70", "75", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200", "212", "220", "230", "240", "250", "260", "265", "270", "275", "280", "295", "300", "310", "320", "330", "340", "350", "360", "370", "380", "390", "400", "425", "430", "435", "445", "448", "450", "455", "460", "468", "480", "490", "500", "510", "520", "530", "540", "550", "560", "570", "580", "590", "600", "920"]),
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
            id: "HUH_TML",
            name: "舊紅磡站西鐵月台|Old Hung Hom WRL Platform",
            framesrc: './adv/HUH_TML.html',
            queryString: ''
        }
    ]
}

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
    'WTS': './assets/img/hko_icon/warning/wts.png',
    'WRAINA': './assets/img/hko_icon/warning/wraina.png',
    'WL': './assets/img/hko_icon/warning/wl.png',
    'WFIRER': './assets/img/hko_icon/warning/wfirer.png',
    'WFIREY': './assets/img/hko_icon/warning/wfirey.png'
}

const StationCodeList = new Map([
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
    ['KOT', new Station("KOT", "九龍塘|Kowloon Tong", 46)],
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
    ['WHA', new Station("WHA", "黃埔|Whampoa", 85)],
    ['YMT', new Station("YMT", "油麻地|Yau Ma Tei", 6)],
    ['MOK', new Station("MOK", "旺角|Mong Kok", 7)],
    ['PRE', new Station("PRE", "太子|Prince Edward", 16)],
    ['SKM', new Station("SKM", "石硤尾|Shek Kip Mei", 8)],
    ['LOF', new Station("LOF", "樂富|Lok Fu", 10)],
    ['WTS', new Station("WTS", "黃大仙|Wong Tai Sin", 11)],
    ['CHH', new Station("CHH", "彩虹|Choi Hung", 12)],
    ['KOB', new Station("KOB", "九龍灣|Kowloon Bay", 13)],
    ['NTK', new Station("NTK", "牛頭角|Ngau Tau Kok", 14)],
    ['KWT', new Station("KWT", "觀塘|Kwun Tong", 15)],
    ['LAT', new Station("LAT", "藍田|Lam Tin", 39)],

    /* TWL START */
    ['TSW', new Station("TSW", "荃灣|Tsuen Wan", 25)],
    ['TWH', new Station("TWH", "大窩口|Tai Wo Hau", 24)],
    ['KWH', new Station("KWH", "葵興|Kwai Hing", 23)],
    ['KWF', new Station("KWF", "葵芳|Kwai Fong", 22)],
    ['LCK', new Station("LCK", "茘枝角|Lai Chi Kok", 19)],
    ['CSW', new Station("CSW", "長沙灣|Cheung Sha Wan", 18)],
    ['SSP', new Station("SSP", "深水埗|Sham Shui Po", 17)],
    ['JOR', new Station("JOR", "佐敦|Jordan", 4)],
    ['TST', new Station("TST", "尖沙咀|Tsim Sha Tsui", 3)],
    ['ADM', new Station("ADM", "金鐘|Admiralty", 2)],
    ['CEN', new Station("CEN", "中環|Central", 1)],

    /* ISL START */
    ['KET', new Station("KET", "堅尼地城|Kennedy Town", 83)],
    ['HKU', new Station("HKU", "香港大學|HKU", 82)],
    ['SYP', new Station("SYP", "西營盤|Sai Ying Pun", 81)],
    ['SHW', new Station("SHW", "上環|Sheung Wan", 26)],
    ['WAC', new Station("WAC", "灣仔|Wan Chai", 27)],
    ['CAB', new Station("CAB", "銅鑼灣|Causeway Bay", 28)],
    ['TIH', new Station("TIH", "天后|Tin Hau", 29)],
    ['FOH', new Station("FOH", "炮台山|Fortress Hill", 30)],
    ['TAK', new Station("TAK", "太古|Tai Koo", 33)],
    ['SWH', new Station("SWH", "西灣河|Sai Wan Ho", 34)],
    ['SKW', new Station("SKW", "筲箕灣|Shau Kei Wan", 35)],
    ['HFC', new Station("HFC", "杏花邨|Heng Fa Chuen", 36)],
    ['CHW', new Station("CHW", "柴灣|Chai Wan", 37)],

    /* LRT START */
    ["1", new Station("1", "屯門碼頭|Tuen Mun Ferry Pier", null, 7)],
    ["10", new Station("10", "美樂|Melody Garden", null, 2)],
    ["15", new Station("15", "蝴蝶|Butterfly", null, 2)],
    ["20", new Station("20", "輕鐵車廠|Light Rail Depot", null, 2)],
    ["30", new Station("30", "龍門|Lung Mun", null, 2)],
    ["40", new Station("40", "青山村|Tsing Shan Tsuen", null, 2)],
    ["50", new Station("50", "青雲|Tsing Wun", null, 2)],
    ["60", new Station("60", "建安|Kin On", null, 2)],
    ["70", new Station("70", "河田|Ho Tin", null, 2)],
    ["75", new Station("75", "蔡意橋|Choy Yee Bridge", null, 2)],
    ["80", new Station("80", "澤豐|Affluence", null, 2)],
    ["90", new Station("90", "屯門醫院|Tuen Mun Hospital", null, 2)],
    ["100", new Station("100", "兆康|Siu Hong", null, 6)],
    ["110", new Station("110", "麒麟|Kei Lun", null, 2)],
    ["120", new Station("120", "青松|Ching Chung", null, 2)],
    ["130", new Station("130", "建生|Kin Sang", null, 2)],
    ["140", new Station("140", "田景|Tin King", null, 3)],
    ["150", new Station("150", "良景|Leung King", null, 2)],
    ["160", new Station("160", "新圍|San Wai", null, 2)],
    ["170", new Station("170", "石排|Shek Pai", null, 2)],
    ["180", new Station("180", "山景 (北)|Shan King (North)", null, 1)],
    ["190", new Station("190", "山景 (南)|Shan King (South)", null, 1)],
    ["200", new Station("200", "鳴琴|Ming Kum", null, 2)],
    ["212", new Station("212", "大興 (北)|Tai Hing (North)", null, 3)],
    ["220", new Station("220", "大興 (南)|Tai Hing (South)", null, 2)],
    ["230", new Station("230", "銀圍|Ngan Wai", null, 2)],
    ["240", new Station("240", "兆禧|Siu Hei", null, 2)],
    ["250", new Station("250", "屯門泳池|Tuen Mun Swimming Pool", null, 2)],
    ["260", new Station("260", "豐景園|Goodview Garden", null, 2)],
    ["265", new Station("265", "兆麟|Siu Lun", null, 2)],
    ["270", new Station("270", "安定|On Ting", null, 2)],
    ["275", new Station("275", "友愛|Yau Oi", null, 1)],
    ["280", new Station("280", "市中心|Town Centre", null, 4)],
    ["295", new Station("295", "屯門|Tuen Mun", null, 2)],
    ["300", new Station("300", "杯渡|Pui To", null, 2)],
    ["310", new Station("310", "何福堂|Hoh Fuk Tong", null, 2)],
    ["320", new Station("320", "新墟|San Hui", null, 2)],
    ["330", new Station("330", "景峰|Prime View", null, 2)],
    ["340", new Station("340", "鳳地|Fung Tei", null, 2)],
    ["350", new Station("350", "藍地|Lam Tei", null, 2)],
    ["360", new Station("360", "泥圍|Nai Wai", null, 2)],
    ["370", new Station("370", "鍾屋村|Chung Uk Tsuen", null, 2)],
    ["380", new Station("380", "洪水橋|Hung Shui Kiu", null, 2)],
    ["390", new Station("390", "塘坊村|Tong Fong Tsuen", null, 2)],
    ["400", new Station("400", "屏山|Ping Shan", null, 2)],
    ["425", new Station("425", "坑尾村|Hang Mei Tsuen", null, 2)],
    ["430", new Station("430", "天水圍|Tin Shui Wai", null, 3)],
    ["435", new Station("435", "天慈|Tin Tsz", null, 2)],
    ["445", new Station("445", "天耀|Tin Yiu", null, 2)],
    ["448", new Station("448", "樂湖|Locwood", null, 2)],
    ["450", new Station("450", "天湖|Tin Wu", null, 2)],
    ["455", new Station("455", "銀座|Ginza", null, 2)],
    ["460", new Station("460", "天瑞|Tin Shui", null, 2)],
    ["468", new Station("468", "頌富|Chung Fu", null, 2)],
    ["480", new Station("480", "天富|Tin Fu", null, 2)],
    ["490", new Station("490", "翠湖|Chestwood", null, 2)],
    ["500", new Station("500", "天榮|Tin Wing", null, 2)],
    ["510", new Station("510", "天悅|Tin Yuet", null, 2)],
    ["520", new Station("520", "天秀|Tin Sau", null, 2)],
    ["530", new Station("530", "濕地公園|Wetland Park", null, 2)],
    ["540", new Station("540", "天恒|Tin Heng", null, 2)],
    ["550", new Station("550", "天逸|Tin Yat", null, 5)],
    ["560", new Station("560", "水邊圍|Shui Pin Wai", null, 2)],
    ["570", new Station("570", "豐年路|Fung Nin Road", null, 2)],
    ["580", new Station("580", "康樂路|Hong Lok Road", null, 2)],
    ["590", new Station("590", "大棠路|Tai Tong Road", null, 2)],
    ["600", new Station("600", "元朗|Yuen Long", null, 5)],
    ["920", new Station("920", "三聖|Sam Shing", null, 3)]
])