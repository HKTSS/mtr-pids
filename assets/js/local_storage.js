import SETTINGS from "./static/settings.js";

export function save() {
    localStorage.setItem("pids_config", JSON.stringify(SETTINGS));
}

function read() {
    if(localStorage.getItem("pids_config") != null) {
        let savedSettings = JSON.parse(localStorage.getItem("pids_config"));
        SETTINGS.showPlatform = savedSettings.showPlatform;
        SETTINGS.customArrivalData = savedSettings.customArrivalData;
        SETTINGS.rtHeader = savedSettings.rtHeader;
        SETTINGS.displayMode = savedSettings.displayMode;
        SETTINGS.dataSource = savedSettings.dataSource;
        SETTINGS.adhoc = savedSettings.adhoc;
        SETTINGS.direction = savedSettings.direction;
        SETTINGS.station = savedSettings.station;
        SETTINGS.route = savedSettings.route;
    }
}

read();