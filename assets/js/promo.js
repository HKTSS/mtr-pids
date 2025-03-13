'use strict'

import SETTINGS from './static/settings.js';

let nextPromoSwap = 0;
let currentPromoScreen = 0;
let shouldShowTtnt = false;

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
        cycle();
        cycleLanguage();
        needRerender = true;
    }

    if ((SETTINGS.dpMode == DisplayMode.NT4 || SETTINGS.dpMode == DisplayMode.NT4_CT) && !SETTINGS.showingSpecialMessage) {
        setArrivalVisibility([true, true, true, true]);
        $('#promo').hide();
        return;
    }
    
    $('#promo').show();
    
    let firstTrainTooLong = SETTINGS.debugMode ? false : etaData[0]?.ttnt > 20; // 4 row ttnt not displayed if first train over 20min

    if (shouldShowTtnt && (SETTINGS.dpMode == DisplayMode.AD || SETTINGS.dpMode == DisplayMode.ADNT1 || firstTrainTooLong)) {
        // Skip 4 row arrival
        cycle();
        needRerender = true;
    }

    if (SETTINGS.showingSpecialMessage) {
        nextPromoCycle = promotionData.special.filter(e => e.id == SETTINGS.specialMsgID)[0];
    }

    for (const promo of promotionData.cycle) {
        $(`.promo-${promo.id}`).hide()
    }

    for (const promo of promotionData.special) {
        $(`.promo-${promo.id}`).hide()
    }

    if (shouldShowTtnt && !SETTINGS.showingSpecialMessage) {
        setArrivalVisibility([true, true, true, true]);
        $('#promo').hide();
    } else {
        $('#promo').show();
        $(`.promo-${nextPromoCycle.id}`).show();
        setArrivalVisibility([false, false, false, true]);
    }
    
    if (SETTINGS.dpMode == DisplayMode.AD) {
        $('#promo').addClass("promo-full");
        setArrivalVisibility([false, false, false, false]);
    } else {
        $('#promo').removeClass("promo-full");
    }

    if (SETTINGS.showingSpecialMessage) {
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

$(document).ready(function() {
    $('#promo').empty();
    for (const cate in promotionData) {
        for (const promo of promotionData[cate]) {
            if (promo.framesrc != null) {
                $('#promo').append(`<iframe style="display:block" class="promo-${promo.id} centeredItem" src=${promo.framesrc}></iframe>`);
            }
        }
    }
})

export default {cycle: cycle, draw: draw};