let paxData = "";
let firstClassCar = null

const PaxLoad = {
    Low: "L",
    Medium: "M",
    High: "H"
}

function parseQuery() {
    let params = (new URL(document.location)).searchParams;
    let errorMsg = [];
    if (!params.has("data")) errorMsg.push("- Missing Pax Data");
    if (errorMsg.length > 0) return errorMsg;

    paxData = params.get("data");
    if (params.has("firstClass")) {
        let firstClass = params.get("firstClass")
        firstClassCar = isNaN(firstClass) ? null : parseInt(firstClass);
    }

    return [];
}

function updateData() {
    if (paxData.length == 0) return;
    let paxLoadEntry = paxData.split(",");

    // $("#pax").empty();

    let car = 1;
    for (paxLoad of paxLoadEntry) {
        let elem;
        if (car == 1) {
            elem = $(`<div class="pax-child head"><img class="scalable" src="./Pax${paxLoad}H.png"></div>`);
        } else {
            elem = $(`<div class="pax-child"><img class="scalable" src="./Pax${paxLoad}.png"></div>`);
        }
        let carElement = car == firstClassCar ? `<p class="firstclass-zh">頭等</p><p class="firstclass-en">First Class</p>` : `<p>${car}</p>`;
        elem.append(carElement);
        $('#pax').append(elem);
        car++;
    }
}

$(document).ready(function() {
    let errorMsg = parseQuery();
    if (errorMsg.length > 0) {
        $('body').html(errorMsg.join("<br>"));
        return;
    }

    updateData()
})

/* You know, let's not over complicate things. */
// function adjustFontSize() {
//     $('.scalable').each(function() {
//         const PADDING = 10;
//         let curWidth = $(this).width();
//         let tdWidth = $(this).parent().width() - PADDING;
//         let percentW = 1

//         percentW = (tdWidth / curWidth)
//         $(this).css("width", `${curWidth * percentW}px`)
//     });
// }