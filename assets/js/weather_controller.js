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

export async function fetchWeatherData() {
    try {
        let rhrread = await fetch(WEATHER_API.HKO_RHRREAD.url);
        let warning = await fetch(WEATHER_API.HKO_WARNING_INFO.url);

        let rhrreadData = await rhrread.json();
        let warningData = await warning.json();

        let avgTemp = 0;
        for (const place of rhrreadData.temperature.data) {
            avgTemp = avgTemp + parseInt(place.value);
        }
        avgTemp /= rhrreadData.temperature.data.length;

        return {
            rhrread: rhrreadData,
            warning: warningData,
            avgTemp: avgTemp
        }
    } catch (err) {
        return null;
    }
}