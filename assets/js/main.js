let showingSpecialMessage = false;
class Route {
    initials;
    api;
    name;
    color;
    isLRT;
    hasPaxLoad;
    via;
    directionInfo
    constructor(initials, api, name, color, isLRT, hasPaxLoad, via, directionInfo) {
        this.initials = initials
        this.api = api
        this.name = name
        this.color = color
        this.isLRT = isLRT
        this.hasPaxLoad = hasPaxLoad
        this.via = via;
        this.directionInfo = directionInfo;
    }
}

class ArrivalEntry {
    dest;
    ttnt;
    route;
    plat;
    isLRT;
    APISource;
    paxLoad;
    isDeparture;
    firstClassCar;
    constructor(dest, ttnt, route, platforms, isLRT, APISource, isDeparture, paxLoad, firstClass) {
        this.dest = dest
        this.ttnt = ttnt
        this.route = route
        this.plat = platforms
        this.isLRT = isLRT
        this.APISource = APISource
        this.paxLoad = paxLoad;
        this.isDeparture = isDeparture
        this.firstClassCar = firstClass
    }
}

class Station {
    name;
    initials;
    route;
    MRCode;
    constructor(initials, name, route, MRCode) {
        this.name = name;
        this.initials = initials;
        this.route = route;
        this.MRCode = MRCode;
    }
}

const API = {
    NONE: 'None',
    METRO_RIDE: 'MetroRide',
    MTR_HEAVY_INTERNAL: 'MTR',
    MTR_HEAVY: 'MTR Open Data',
    MTR_LRT: 'MTR Light Rail Data'
}

const RouteList = {
    'TCL': new Route('TCL', API.MTR_HEAVY, 'Tung Chung Line', 'f7943e', false, false, "", ["TUC", "HOK"]),
    'TML': new Route('TML', API.MTR_HEAVY_INTERNAL, 'Tuen Ma Line', '923011', false, true, "" ["TUM", "WKS"]),
    'TKL': new Route('TKL', API.MTR_HEAVY, 'Tsueng Kwan O Line', '7d499d', false, false, "", ["POA", "NOP"]),
    'AEL': new Route('AEL', API.MTR_HEAVY, 'Airport Express', '00888a', false, false, "", ["AWE", "HOK"]),
    'EAL': new Route('EAL', API.MTR_HEAVY_INTERNAL, 'East Rail Line', '53b7e8', false, true, "", ["SHS", "ADM"]),
    'DRL': new Route('DRL', API.METRO_RIDE, 'Disneyland Resorts Line', 'f173ac', false, false, "", ["SUN", "DIS"]),
    'EALRAC': new Route('EALRAC', API.MTR_HEAVY_INTERNAL, 'East Rail Line (Racecourse)', '53b7e8', false, true, "RAC", ["SHS", "ADM"]),
    'LRT': new Route('LRT', API.MTR_LRT, 'Light Rail', 'd3a809', true, false, "", []),
    'LR505': new Route('505', API.MTR_LRT, 'Light Rail 505', 'da2128', true, false, []),
    'LR507': new Route('507', API.MTR_LRT, 'Light Rail 507', '00a650', true, false, []),
    'LR610': new Route('610', API.MTR_LRT, 'Light Rail 610', '551b14', true, false, []),
    'LR614': new Route('614', API.MTR_LRT, 'Light Rail 614', '00c0f3', true, false, []),
    'LR614P': new Route('614P', API.MTR_LRT, 'Light Rail 614P', 'f4858d', true, false, []),
    'LR615': new Route('615', API.MTR_LRT, 'Light Rail 615', 'ffdd00', true, false, []),
    'LR615P': new Route('615P', API.MTR_LRT, 'Light Rail 615P', '006684', true, false, []),
    'LR705': new Route('705', API.MTR_LRT, 'Light Rail 705', '9acd32', true, false, []),
    'LR706': new Route('706', API.MTR_LRT, 'Light Rail 706', 'B27AB4', true, false, []),
    'LR751': new Route('751', API.MTR_LRT, 'Light Rail 751', 'f5821f', true, false, []),
    'LR751P': new Route('751P', API.MTR_LRT, 'Light Rail 751P', '000000', true, false, []),
    'LR761P': new Route('761P', API.MTR_LRT, 'Light Rail 761P', '6f2b91', true, false, [])
}

let selectedData = {
    'direction': 'UP',
    'route': null,
    'stn': null,
    'onlineMode': true,
    'showPlatform': true,
    'API': 'MTR',
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

const SUStationCode = {
    "0": null,
    "1": "CEN",
    "2": "ADM",
    "3": "TST",
    "4": "JOR",
    "5": "YMT",
    "6": "MOK",
    "7": "SKM",
    "8": "KOT",
    "9": "LOF",
    "10": "WTS",
    "11": "DIH",
    "12": "CHH",
    "13": "KOB",
    "14": "NTK",
    "15": "KWT",
    "16": "PRE",
    "17": "SSP",
    "18": "CSW",
    "19": "LCK",
    "20": "MEF",
    "21": "LAK",
    "22": "KWF",
    "23": "KWH",
    "24": "TWH",
    "25": "TSW",
    "26": "SHW",
    "27": "WAC",
    "28": "CAB",
    "29": "TIH",
    "30": "FOH",
    "31": "NOP",
    "32": "QUB",
    "33": "TAK",
    "34": "SWH",
    "35": "SKW",
    "36": "HFC",
    "37": "CHW",
    "38": "LAT",
    "39": "HOK",
    "40": "KOW",
    "41": "OLY",
    "42": "TSY",
    "43": "TUC",
    "44": "HOKA",
    "45": "KOWA",
    "46": "TSYA",
    "47": "AIR",
    "48": "YAT",
    "49": "TIK",
    "50": "TKO",
    "51": "HAH",
    "52": "POA",
    "53": "NAC",
    "54": "SUN",
    "55": "DIS",
    "56": "AWE",
    "57": "LHP",
    "64": "HUH",
    "65": "MKK",
    "66": "KOTE",
    "67": "TAW",
    "68": "SHT",
    "69": "FOT",
    "70": "RAC",
    "71": "UNI",
    "72": "TAP",
    "73": "TWO",
    "74": "FAN",
    "75": "SHS",
    "76": "LOW",
    "78": "LMC",
    "80": "ETS",
    "81": "SYP",
    "82": "HKU",
    "83": "KET",
    "84": "HOM",
    "85": "WHA",
    "86": "OCP",
    "87": "WCH",
    "88": "LET",
    "89": "SOH",
    "90": "HIK",
    "91": "KAT",
    "92": "SUW",
    "93": "TKW",
    "96": "CKT",
    "97": "STW",
    "98": "CIO",
    "99": "SHM",
    "100": "TSH",
    "101": "HEO",
    "102": "MOS",
    "103": "WKS",
    "111": "AUS",
    "113": "MEFW",
    "114": "TWW",
    "115": "KSR",
    "116": "YUL",
    "117": "LOP",
    "118": "TIS",
    "119": "SIH",
    "120": "TUM",
    "164": "HUHR",
    "172": "TAPR",
    "175": "SHSR",
    "176": "LOWR",
    "178": "LMCR",
    "991": "KMB_TUM_SIH",
    "992": "KMB_SHS_FAN",
    "993": "KMB_TWO_TAP",
    "1001": "FEP",
    "1010": "MEG",
    "1015": "BUT",
    "1020": "LRD",
    "1030": "LUM",
    "1040": "TSS",
    "1050": "TWN",
    "1060": "KIO",
    "1070": "HOT",
    "1075": "CYB",
    "1080": "AFF",
    "1090": "TMH",
    "1100": "SHL",
    "1110": "KEL",
    "1120": "CHC",
    "1130": "KIS",
    "1140": "TNK",
    "1150": "LEK",
    "1160": "SAW",
    "1170": "SHP",
    "1180": "SKN",
    "1190": "SKS",
    "1200": "MIK",
    "1212": "THN",
    "1220": "THS",
    "1230": "NGW",
    "1240": "SHE",
    "1250": "TSP",
    "1260": "GOG",
    "1265": "SLU",
    "1270": "ONT",
    "1275": "YAO",
    "1280": "TOC",
    "1295": "TML",
    "1300": "PUT",
    "1310": "HFT",
    "1320": "SAH",
    "1330": "PRV",
    "1340": "FUT",
    "1350": "LTE",
    "1360": "NAW",
    "1370": "CUT",
    "1380": "HSK",
    "1390": "TOF",
    "1400": "PIS",
    "1425": "HMT",
    "1430": "TSL",
    "1435": "TIT",
    "1445": "TIY",
    "1448": "LOC",
    "1450": "TWU",
    "1455": "GIN",
    "1460": "TSU",
    "1468": "CHF",
    "1480": "TFU",
    "1490": "CHE",
    "1500": "TWI",
    "1510": "TYU",
    "1520": "TSA",
    "1530": "WEP",
    "1540": "THE",
    "1550": "TYA",
    "1560": "SPW",
    "1570": "FNR",
    "1580": "HLR",
    "1590": "TTR",
    "1600": "YLL",
    "1920": "SAS",
    "2001": "HUHI",
    "2002": "DAQ",
    "2003": "GGQ",
    "2004": "FSQ",
    "2005": "ZVQ",
    "2006": "SHH",
    "2007": "BXP",
    "2101": "WEK",
    "2102": "NZQ",
    "2103": "IOQ",
    "2104": "IMQ",
    "2105": "IUQ",
    "2106": "QSQ",
    "2107": "IZQ",
    "2111": "SNQ",
    "2112": "ICQ",
    "2113": "HVQ",
    "2114": "ZAQ",
    "2115": "CWQ",
    "2116": "WHN",
    "2117": "ZAF",
    "2118": "SJP",
    "2121": "NXG",
    "2122": "SRG",
    "2123": "JBH",
    "2124": "HGH",
    "2125": "AOH",
    "2131": "GEZ",
    "2132": "KQW",
    "2133": "KOM",
    "2141": "IFQ",
    "2142": "KNQ",
    "2143": "KDQ",
    "2144": "KMQ",
    "2145": "OGQ",
    "2146": "LLQ",
    "2147": "KTQ",
    "2148": "PEQ",
    "2149": "CNQ",
    "2150": "CBQ",
    "2151": "RVQ",
    "2152": "ZDS",
    "2153": "YBS",
    "2154": "ZCS",
    "2155": "JES",
    "2156": "ZUS",
    "2157": "XKS",
    "2158": "XMS",
    "2159": "QYS",
    "2160": "PTS",
    "2161": "FZS"
}

const stationCodeList = new Map([
    /* DRL START*/
    ['DIS', new Station("DIS", "迪士尼|Disneyland Resort", ["DRL"], 55)],

    /* SIL START */
    ['SOH', new Station("SOH", "海怡半島|South Horizons", ["SIL"], 90)],
    ['LET', new Station("LET", "利東|Lei Tung", ["SIL"], 89)],
    ['WCH', new Station("WCH", "黃竹坑|Wong Chuk Hang", ["SIL"], 88)],
    ['OCP', new Station("OCP", "海洋公園|Ocean Park", ["SIL"], 87)],

    /* TKL START */
    ['NOP', new Station("NOP", "北角|North Point", ["TKL"], 32)],
    ['QUB', new Station("QUB", "鰂魚涌|Quarry Bay", ["TKL"], 33)],
    ['YAT', new Station("YAT", "油塘|Yau Tong", ["KTL", "TKL"], 49)],
    ['TIK', new Station("TIK", "調景嶺|Tiu Keng Leng", ["KTL", "TKL"], 50)],
    ['TKO', new Station("TKO", "將軍澳|Tsueng Kwan O", ["TKL"], 51)],
    ['LHP', new Station("LHP", "康城|LOHAS Park", ["TKL"], 64)],
    ['HAH', new Station("HAH", "坑口|Hang Hau", ["TKL"], 52)],
    ['POA', new Station("POA", "寶琳|Po Lam", ["TKL"], 53)],

    /* AEL & TCL START */
    ['HOK', new Station("HOK", "香港|Hong Kong", ["AEL", "TCL"], 40)],
    ['KOW', new Station("KOW", "九龍|Kowloon", ["AEL", "TCL"], 41)],
    ['OLY', new Station("OLY", "奧運|Olympic", ["TCL"], 42)],
    ['NAC', new Station("NAC", "南昌|Nam Cheong", ["TCL"])],
    ['LAK', new Station("LAK", "茘景|Lai King", ["TCL"])],
    ['TSY', new Station("TSY", "青衣|Tsing Yi", ["AEL", "TCL"], 43)],
    ['AIR', new Station("AIR", "機場|Airport", ["AEL"], '48')],
    ['AWE', new Station("AWE", "機場及博覽館|Airport & AsiaWorld–Expo", ["AEL"], 57)],
    ['SUN', new Station("SUN", "欣澳|Sunny Bay", ["TCL", "DRL"], 54)],
    ['OYB', new Station("OYB", "小蠔灣|Oyster Bay", [])],
    ['TCE', new Station("TCE", "東涌東|Tung Chung East", [])],
    ['TUC', new Station("TUC", "東涌|Tung Chung", ["TCL"], 44)],
    ['TCW', new Station("TCW", "東涌西|Tung Chung West", [])],

    /* TML START */
    ['TUM', new Station("TUM", "屯門|Tuen Mun", ["TML"], 164)],
    ['SIH', new Station("SIH", "兆康|Siu Hong", ["TML"], 120)],
    ['TIS', new Station("TIS", "天水圍|Tin Shui Wai", ["TML"], 119)],
    ['LOP', new Station("LOP", "朗屏|Long Ping", ["TML"], 118)],
    ['YUL', new Station("YUL", "元朗|Yuen Long", ["TML"], 117)],
    ['KSR', new Station("KSR", "錦上路|Kam Sheung Road", ["TML"], 116)],
    ['TWW', new Station("TWW", "荃灣西|Tsuen Wan West", ["TML"], 115)],
    ['MEF', new Station("MEF", "美孚|Mei Foo", ["TWL", "TML"], 114)],
    ['AUS', new Station("AUS", "柯士甸|Austin", ["TML"], 113)],
    ['ETS', new Station("ETS", "尖東|East Tsim Sha Tsui", ["TML"], 81)],
    ['HUH', new Station("HUH", "紅磡|Hung Hom", ["EAL", "TML"], 65)],
    ['HOM', new Station("HOM", "何文田|Ho Man Tin", ["KTL", "TML"])],
    ['TKW', new Station("TKW", "土瓜灣|To Kwa Wan", ["TML"])],
    ['SKW', new Station("SKW", "宋皇臺|Sung Wong Toi", ["TML"])],
    ['KAT', new Station("KAT", "啟德|Kai Tak", ["TML"])],
    ['DIH', new Station("DIH", "鑽石山|Diamond Hill", ["KTL", "TML"])],
    ['HIK', new Station("HIK", "顯徑|Hin Keng", ["TML"])],
    ['TAW', new Station("TAW", "大圍|Tai Wai", ["EAL", "TML"], 68)],
    ['CKT', new Station("CKT", "車公廟|Che Kung Temple", ["TML"], 97)],
    ['STW', new Station("STW", "沙田圍|Sha Tin Wai", ["TML"], 98)],
    ['CIO', new Station("CIO", "第一城|City One", ["TML"], 99)],
    ['SHM', new Station("SHM", "石門|Shek Mun", ["TML"], 100)],
    ['TSH', new Station("TSH", "大水坑|Tai Shui Hang", ["TML"], 101)],
    ['HEO', new Station("HEO", "恆安|Heng On", ["TML"], 102)],
    ['MOS', new Station("MOS", "馬鞍山|Ma On Shan", ["TML"], 103)],
    ['WKS', new Station("WKS", "烏溪沙|Wu Kai Sha", ["TML"], 111)],

    /* EAL START */
    ['EXC', new Station("EXC", "會展|Exhibition Centre", ["EAL"], 96)],
    ['MKK', new Station("MKK", "旺角東|Mong Kok East", ["EAL"], 66)],
    ['KOT', new Station("KOT", "九龍塘|Kowloon Tong", ["KTL", "EAL"], 46)],
    ['SHT', new Station("SHT", "沙田|Sha Tin", ["EAL"], 69)],
    ['FOT', new Station("FOT", "火炭|Fo Tan", ["EAL"], 70)],
    ['RAC', new Station("RAC", "馬場|Racecourse", ["EAL"], 71)],
    ['UNI', new Station("UNI", "大學|University", ["EAL"], 72)],
    ['TAP', new Station("TAP", "大埔墟|Tai Po Market", ["EAL"], 73)],
    ['TWO', new Station("TWO", "太和|Tai Wo", ["EAL"], 74)],
    ['FAN', new Station("FAN", "粉嶺|Fanling", ["EAL"], 75)],
    ['SHS', new Station("SHS", "上水|Sheung Shui", ["EAL"], 76)],
    ['LOW', new Station("LOW", "羅湖|Lo Wu", ["EAL"], 78)],
    ['LMC', new Station("LMC", "落馬洲|Lok Ma Chau", ["EAL"], 80)],

    /* KTL START */
    ['WHA', new Station("WHA", "黃埔|Wongpoa", ["KTL"])],
    ['YMT', new Station("YMT", "油麻地|Yau Ma Tei", ["TWL", "KTL"])],
    ['MOK', new Station("MOK", "旺角|Mong Kok", ["TWL", "KTL"])],
    ['PRE', new Station("PRE", "太子|Prince Edward", ["TWL", "KTL"])],
    ['SKM', new Station("SKM", "石硤尾|Shek Kip Mei", ["KTL"])],
    ['LOF', new Station("LOF", "樂富|Lok Fu", ["KTL"])],
    ['WTS', new Station("WTS", "黃大仙|Wong Tai Sin", ["KTL"])],
    ['CHH', new Station("CHH", "彩虹|Choi Hung", ["KTL"])],
    ['KOB', new Station("KOB", "九龍灣|Kowloon Bay", ["KTL"])],
    ['NTK', new Station("NTK", "牛頭角|Ngau Tau Kok", ["KTL"])],
    ['KWT', new Station("KWT", "觀塘|Kwun Tong", ["KTL"])],
    ['LAT', new Station("LAT", "藍田|Lam Tin", ["KTL"])],

    /* TWL START */
    ['TSW', new Station("TSW", "荃灣|Tsuen Wan", ["TWL"])],
    ['TWH', new Station("TWH", "大窩口|Tai Wo Hau", ["TWL"])],
    ['KWH', new Station("KWH", "葵興|Kwai Hing", ["TWL"])],
    ['KWF', new Station("KWF", "葵芳|Kwai Fong", ["TWL"])],
    ['LCK', new Station("LCK", "茘枝角|Lai Chi Kok", ["TWL"])],
    ['CSW', new Station("CSW", "長沙灣|Cheung Sha Wan", ["TWL"])],
    ['SSP', new Station("SSP", "深水埗|Sham Shui Po", ["TWL"])],
    ['JOR', new Station("JOR", "佐敦|Jordan", ["TWL"])],
    ['TST', new Station("TST", "尖沙咀|Tsim Sha Tsui", ["TWL"])],
    ['ADM', new Station("ADM", "金鐘|Admiralty", ["ISL", "TWL", "EAL"])],
    ['CEN', new Station("CEN", "中環|Central", ["ISL", "TWL"], '1')],

    /* ISL START */
    ['KET', new Station("KET", "堅尼地城|Kennedy Town", ["ISL"])],
    ['HKU', new Station("HKU", "香港大學|HKU", ["ISL"])],
    ['SYP', new Station("SYP", "西營盤|Sai Ying Pun", ["ISL"])],
    ['SHW', new Station("SHW", "上環|Sheung Wan", ["ISL"])],
    ['WAC', new Station("WAC", "灣仔|Wan Chai", ["ISL"])],
    ['CAB', new Station("CAB", "銅鑼灣|Causeway Bay", ["ISL"])],
    ['TIH', new Station("TIH", "天后|Tin Hau", ["ISL"])],
    ['FOH', new Station("FOH", "炮台山|Fortress Hill", ["ISL"])],
    ['TAK', new Station("TAK", "太古|Tai Koo", ["ISL"])],
    ['SWH', new Station("SWH", "西灣河|Sai Wan Ho", ["ISL"])],
    ['SKW', new Station("SKW", "筲箕灣|Shau Kei Wan", ["ISL"])],
    ['HFC', new Station("HFC", "杏花邨|Heng Fa Chuen", ["ISL"])],
    ['CHW', new Station("CHW", "柴灣|Chai Wan", ["ISL"])],

    /* LRT START */
    ["1", new Station("1", "屯門碼頭|Tuen Mun Ferry Pier", ["LRT"])],
    ["10", new Station("10", "美樂|Melody Garden", ["LRT"])],
    ["15", new Station("15", "蝴蝶|Butterfly", ["LRT"])],
    ["20", new Station("20", "輕鐵車廠|Light Rail Depot", ["LRT"])],
    ["30", new Station("30", "龍門|Lung Mun", ["LRT"])],
    ["40", new Station("40", "青山村|Tsing Shan Tsuen", ["LRT"])],
    ["50", new Station("50", "青雲|Tsing Wun", ["LRT"])],
    ["60", new Station("60", "建安|Kin On", ["LRT"])],
    ["70", new Station("70", "河田|Ho Tin", ["LRT"])],
    ["75", new Station("75", "蔡意橋|Choy Yee Bridge", ["LRT"])],
    ["80", new Station("80", "澤豐|Affluence", ["LRT"])],
    ["90", new Station("90", "屯門醫院|Tuen Mun Hospital", ["LRT"])],
    ["100", new Station("100", "兆康|Siu Hong", ["LRT"])],
    ["110", new Station("110", "麒麟|Kei Lun", ["LRT"])],
    ["120", new Station("120", "青松|Ching Chung", ["LRT"])],
    ["130", new Station("130", "建生|Kin Sang", ["LRT"])],
    ["140", new Station("140", "田景|Tin King", ["LRT"])],
    ["150", new Station("150", "良景|Leung King", ["LRT"])],
    ["160", new Station("160", "新圍|San Wai", ["LRT"])],
    ["170", new Station("170", "石排|Shek Pai", ["LRT"])],
    ["180", new Station("180", "山景 (北)|Shan King (North)", ["LRT"])],
    ["190", new Station("190", "山景 (南)|Shan King (South)", ["LRT"])],
    ["200", new Station("200", "鳴琴|Ming Kum", ["LRT"])],
    ["212", new Station("212", "大興 (北)|Tai Hing (North)", ["LRT"])],
    ["220", new Station("220", "大興 (南)|Tai Hing (South)", ["LRT"])],
    ["230", new Station("230", "銀圍|Ngan Wai", ["LRT"])],
    ["240", new Station("240", "兆禧|Siu Hei", ["LRT"])],
    ["250", new Station("250", "屯門泳池|Tuen Mun Swimming Pool", ["LRT"])],
    ["260", new Station("260", "豐景園|Goodview Garden", ["LRT"])],
    ["265", new Station("265", "兆麟|Siu Lun", ["LRT"])],
    ["270", new Station("270", "安定|On Ting", ["LRT"])],
    ["275", new Station("275", "友愛|Yau Oi", ["LRT"])],
    ["280", new Station("280", "市中心|Town Centre", ["LRT"])],
    ["295", new Station("295", "屯門|Tuen Mun", ["LRT"])],
    ["300", new Station("300", "杯渡|Pui To", ["LRT"])],
    ["310", new Station("310", "何福堂|Hoh Fuk Tong", ["LRT"])],
    ["320", new Station("320", "新墟|San Hui", ["LRT"])],
    ["330", new Station("330", "景峰|Prime View", ["LRT"])],
    ["340", new Station("340", "鳳地|Fung Tei", ["LRT"])],
    ["350", new Station("350", "藍地|Lam Tei", ["LRT"])],
    ["360", new Station("360", "泥圍|Nai Wai", ["LRT"])],
    ["370", new Station("370", "鍾屋村|Chung Uk Tsuen", ["LRT"])],
    ["380", new Station("380", "洪水橋|Hung Shui Kiu", ["LRT"])],
    ["390", new Station("390", "塘坊村|Tong Fong Tsuen", ["LRT"])],
    ["400", new Station("400", "屏山|Ping Shan", ["LRT"])],
    ["425", new Station("425", "坑尾村|Hang Mei Tsuen", ["LRT"])],
    ["430", new Station("430", "天水圍|Tin Shui Wai", ["LRT"])],
    ["435", new Station("435", "天慈|Tin Tsz", ["LRT"])],
    ["445", new Station("445", "天耀|Tin Yiu", ["LRT"])],
    ["448", new Station("448", "樂湖|Locwood", ["LRT"])],
    ["450", new Station("450", "天湖|Tin Wu", ["LRT"])],
    ["455", new Station("455", "銀座|Ginza", ["LRT"])],
    ["460", new Station("460", "天瑞|Tin Shui", ["LRT"])],
    ["468", new Station("468", "頌富|Chung Fu", ["LRT"])],
    ["480", new Station("480", "天富|Tin Fu", ["LRT"])],
    ["490", new Station("490", "翠湖|Chestwood", ["LRT"])],
    ["500", new Station("500", "天榮|Tin Wing", ["LRT"])],
    ["510", new Station("510", "天悅|Tin Yuet", ["LRT"])],
    ["520", new Station("520", "天秀|Tin Sau", ["LRT"])],
    ["530", new Station("530", "濕地公園|Wetland Park", ["LRT"])],
    ["540", new Station("540", "天恒|Tin Heng", ["LRT"])],
    ["550", new Station("550", "天逸|Tin Yat", ["LRT"])],
    ["560", new Station("560", "水邊圍|Shui Pin Wai", ["LRT"])],
    ["570", new Station("570", "豐年路|Fung Nin Road", ["LRT"])],
    ["580", new Station("580", "康樂路|Hong Lok Road", ["LRT"])],
    ["590", new Station("590", "大棠路|Tai Tong Road", ["LRT"])],
    ["600", new Station("600", "元朗|Yuen Long", ["LRT"])],
    ["920", new Station("920", "三聖|Sam Shing", ["LRT"])]
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
        let timetext = entry.isDeparture == true ? "正在離開|Departing" : entry.ttnt == 0 ? "" : entry.ttnt == 1 ? "即將抵達|Arriving" : "分鐘|min"
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

    if (api == API.MTR_LRT) {
        const response = await fetch(`https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id=${selectedData.stn.initials}`);

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

    if (api == API.MTR_HEAVY || api == API.MTR_HEAVY_INTERNAL) {
        let response;
        if (api == API.MTR_HEAVY) {
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
            let stnName = stationCodeList.get(SUStationCode[entry.destination]).name

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

function updateConfigUI() {
    /* Show the corresponding station list of the route */
    $('.station').empty()
    let stnList = new Map(stationCodeList)

    for (const [key, stn] of stnList.entries()) {
        if (!stn.route.includes(selectedData.route.initials)) {
            stnList.delete(key)
        }
    }

    for (const [stnVal, stn] of stnList.entries()) {
        $('.station').append(`<option value="${stnVal}">${switchLang(stn.name, true)}`)
        selectedData.stn = stationCodeList.get($('.station').val())
    }

    let UPTerminus = stationCodeList.get(selectedData.route.directionInfo[0]);
    let DNTerminus = stationCodeList.get(selectedData.route.directionInfo[1]);
    let Text = switchLang("往 |To ", true)
    $('.direction').prop("disabled", false)
    $('.direction').empty()

    if (selectedData.route.directionInfo.length < 2) return;
    $('.direction').append(`<option value="UP">${Text}${switchLang(UPTerminus.name, true)}</option>`)
    $('.direction').append(`<option value="DOWN">${Text}${switchLang(DNTerminus.name, true)}</option>`)
    $('.direction').append(`<option value="BOTH">Both</option>`)


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
    setUILanguage(selectedData.UILang)
    updateClock()
    updateWeather()
    saveConfig()
    updateConfigUI()
    renderAdv(true)
    updateData(true)
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
        updateConfigUI()

        if (selectedData.route.isLRT) {
            $('.direction').prop("disabled", true)
                // platformAmt = stationCodeList.get($('.station').val()).platformCount
                // $('#platform').empty()
                // for(i = 0; i < platformAmt; i++) {
                //     $('#platform').append(`<option value=${i}>${i}</option>`)
                // }
                // $('#platform').show()
        } else {
            updateConfigUI()
            $('.direction').prop("disabled", false)
        }
    })

    $('#langchoose').on('click', function() {
        let toggledLang = selectedData.UILang == 'EN' ? 'ZH' : 'EN'
        selectedData.UILang = toggledLang;
        $(`#langchoose`).text(toggledLang == 'EN' ? 'EN' : '中')
        setUILanguage(selectedData.UILang)
        updateConfigUI()
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