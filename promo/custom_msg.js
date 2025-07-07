let langSwitchTick = 0
let currentLanguage = "EN"

function parseQuery() {
    let params = (new URL(document.location)).searchParams;

    let zh = params.get("zh");
    let en = params.get("en");
    langSwitchTick = params.has("switch") ? parseInt(params.get("switch")) : 0;

    return {
        zh: zh,
        en: en
    }
}

function processData() {
    let data = parseQuery();
    if (langSwitchTick > 0) {
        if (currentLanguage == "EN") {
            currentLanguage = "ZH"
            document.querySelector('.header-zh').style.visibility = 'visible';
            document.querySelector('.header-en').style.visibility = 'none';
        } else {
            currentLanguage = "EN"
            document.querySelector('.header-en').style.visibility = 'visible';
            document.querySelector('.header-zh').style.visibility = 'none';
        }

        setTimeout(processData, langSwitchTick * 1000)
    }

    document.querySelector('.header-zh').textContent = data.zh;
    document.querySelector('.header-en').textContent = data.en;
}

window.onload = (e) => processData();