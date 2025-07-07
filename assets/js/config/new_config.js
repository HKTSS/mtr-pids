import LANG_EN from './lang/en.js';
import LANG_ZH from './lang/zh.js';
import SETTINGS from '../static/settings.js';
import { RouteList, DisplayMode, promotionData, getRoute, getStation } from '../static/data.js';
import API from '../eta_controller.js';
import { save } from '../local_storage.js';

const { createApp, ref, watchEffect, watch, toRaw } = Vue;

const i18n = VueI18n.createI18n({
    legacy: false,
    locale: localStorage.getItem("ui_language") ?? 'en',
    fallbackLocale: 'en',
    messages: {
        en: LANG_EN,
        zh: LANG_ZH
    }
});

const app = createApp({
    setup() {
        const dataSource = ref('ONLINE');
        const routeReference = ref(SETTINGS.route);
        const stationReference = ref(SETTINGS.station);
        const dataSourceReference = ref(SETTINGS.dataSource);
        const isFullscreen = ref(document.fullscreenElement != null);
        const { locale } = VueI18n.useI18n();

        // On route change
        watch(routeReference, (newValue) => {
            SETTINGS.route = newValue;
            const route = getRoute(newValue);
            stationReference.value = route.stations[0]; // Select first station in our route

            const newlySelectedStation = getStation(stationReference.value);

            // Prevent direction from defaulting to the same station we're in
            if(route.directionInfo[0] == newlySelectedStation.initials && SETTINGS.direction == 'UP') SETTINGS.direction = "DOWN";
            if(route.directionInfo[1] == newlySelectedStation.initials && SETTINGS.direction == 'DOWN') SETTINGS.direction = "UP";
        });

        watchEffect(() => SETTINGS.station = toRaw(stationReference.value));
        watchEffect(() => SETTINGS.dataSource = toRaw(dataSourceReference.value));
        
        function toggleFullscreen(e) {
            e.preventDefault();
            if (isFullscreen.value) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
            isFullscreen.value = !isFullscreen.value;
        }
        
        function close(e) {
            e.preventDefault();
            document.querySelector("#overlay").classList.add('hidden');
            save();
            localStorage.setItem("ui_language", locale.value);
        }

        return {
            isFullscreen,
            SETTINGS,
            promotionData,
            DisplayMode,
            RouteList,
            routeReference,
            stationReference,
            API,
            dataSourceReference,
            getRoute,
            toggleFullscreen,
            close,
            dataSource
        }
    },
    mounted() {
        document.querySelector("#overlay").classList.remove("hidden");
    }
});

app.use(i18n);
app.mount('#overlay');