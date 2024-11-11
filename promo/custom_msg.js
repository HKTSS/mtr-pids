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
            $('.header-zh').show()
            $('.header-en').hide()
        } else {
            currentLanguage = "EN"
            $('.header-en').show()
            $('.header-zh').hide()
        }

        setTimeout(processData, langSwitchTick * 1000)
    }

    $('.header-zh').text(data.zh)
    $('.header-en').text(data.en)
}

$(document).ready(function() {
    processData()
})