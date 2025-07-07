'use strict'

import SETTINGS from './static/settings.js';
import { promotionData, DisplayMode } from './static/data.js';

let nextPromoSwap = 0;
let currentPromoScreen = 0;
let shouldShowTtnt = false;
let languageCounter = 0;

function cycle() {
    if(!shouldShowTtnt) {
        shouldShowTtnt = true;
        nextPromoSwap = Date.now() + 10000;
    } else {
        shouldShowTtnt = false;
        if (currentPromoScreen + 1 < promotionData.cycle.length) {
            currentPromoScreen++
        } else {
            currentPromoScreen = 0;
        }
        let nextPromo = promotionData.cycle[currentPromoScreen]
        nextPromoSwap = Date.now() + nextPromo.duration;
    }
}

function draw(etaData, cycleLanguage, setArrivalVisibility) {
    let nextPromoCycle = promotionData.cycle[currentPromoScreen];
    let needRerender = false;
    if (Date.now() >= nextPromoSwap) {
        languageCounter++;
        cycle();
        
        if(languageCounter >= 2) {
            cycleLanguage();
            languageCounter = 0;
        }
        
        needRerender = true;
    }

    if ((SETTINGS.displayMode == DisplayMode.NT4 || SETTINGS.displayMode == DisplayMode.NT4_CT) && SETTINGS.adhoc == "NONE") {
        setArrivalVisibility([true, true, true, true]);
        $('#promo').hide();
        return;
    }
    
    $('#promo').show();
    
    let firstTrainTooLong = SETTINGS.debugMode ? false : etaData.length == 0 || etaData[0].ttnt > 20; // 4 row ttnt not displayed if first train over 20min

    if (shouldShowTtnt && (SETTINGS.displayMode == DisplayMode.AD || SETTINGS.displayMode == DisplayMode.ADNT1 || firstTrainTooLong)) {
        // Skip 4 row arrival
        cycle();
        needRerender = true;
    }

    if (SETTINGS.adhoc != "NONE") {
        nextPromoCycle = promotionData.special.filter(e => e.id == SETTINGS.adhoc)[0];
    }

    for (const promo of promotionData.cycle) {
        $(`.promo-${promo.id}`).hide()
    }

    for (const promo of promotionData.special) {
        $(`.promo-${promo.id}`).hide()
    }

    if (shouldShowTtnt && SETTINGS.adhoc == "NONE") {
        setArrivalVisibility([true, true, true, true]);
        $('#promo').hide();
    } else {
        $('#promo').show();
        $(`.promo-${nextPromoCycle.id}`).show();
        setArrivalVisibility([false, false, false, true]);
    }
    
    if (SETTINGS.displayMode == DisplayMode.AD) {
        $('#promo').addClass("promo-full");
        setArrivalVisibility([false, false, false, false]);
    } else {
        $('#promo').removeClass("promo-full");
    }

    if (SETTINGS.adhoc != "NONE") {
        let fullURL = nextPromoCycle.framesrc + nextPromoCycle.queryString;
        let needRefreshPromoSrc = false;
        $('#promo').show();
        if ($(`.promo-${nextPromoCycle.id}`).length > 0) {
            if (fullURL != $(`.promo-${nextPromoCycle.id}`).attr("src")) {
                needRefreshPromoSrc = true;
            }
        }

        if (needRefreshPromoSrc) {
            $(`.promo-${nextPromoCycle.id}`).attr("src", fullURL);
            $(`.promo-${nextPromoCycle.id}`).show();
        }
    }

    if (nextPromoCycle.isPaxLoad) {
        let paxArray = []
        if (etaData[0]?.paxLoad?.length > 1) {
            for (let pax of etaData[0].paxLoad) {
                paxArray.push(pax.availability);
            }
            let firstClassCar = etaData[0].firstClassCar ? etaData[0].firstClassCar : 0;

            let curURL = $(`.promo-${nextPromoCycle.id}`).attr("src");
            let fullURL = `${nextPromoCycle.framesrc}?data=${paxArray.join(",")}&firstClass=${firstClassCar}`
            if (curURL == fullURL) return;

            $(`.promo-${nextPromoCycle.id}`).attr("src", fullURL);
        } else {
            cycle();
            needRerender = true;
        }
    }

    if(needRerender) {
        draw(etaData, cycleLanguage, setArrivalVisibility);
        return;
    }
}

function setup() {
    $('#promo').empty();

    for (const cate in promotionData) {
        for (const promo of promotionData[cate]) {
            if (promo.framesrc != null) {
                $('#promo').append(`<iframe style="display:none" class="promo-${promo.id} centeredItem" src=${promo.framesrc}></iframe>`);
            }
        }
    }
}

export default {setup, cycle, draw};