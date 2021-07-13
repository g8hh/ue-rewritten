const quarks_unl_req = new Decimal(9)
const quark_types = ["red", "green", "blue"]

function unlockQuarks() {
    if (player.quarks.unl) return;
    if (player.depth.lt(quarks_unl_req)) return;
    player.quarks.unl = true;
}

function getQuarkGain(type) {
    if (!player.quarks.unl) return new Decimal(0);
    return tmp.qk.eff[quark_types[(quark_types.indexOf(type)+2)%quark_types.length]];
}

function quarkLoop(diff) {
    for (let c=0;c<quark_types.length;c++) player.quarks[quark_types[c]] = player.quarks[quark_types[c]].plus(tmp.qk.gain[quark_types[c]].times(diff));
}

function getQuarkChargeCost() {
    return Decimal.pow(2.5, player.quarks.charge.pow(1.2));
}

function buyQuarkCharge(auto=false) {
    if (!player.quarks.unl) return;
    if (!auto) {
        tmp.qk.net = player.quarks.red.plus(player.quarks.blue).plus(player.quarks.green)
        tmp.qk.chargeCost = getQuarkChargeCost();
    }
    if (tmp.qk.net.lt(tmp.qk.chargeCost)) return;
    subTotalQuarks(tmp.qk.chargeCost);
    player.quarks.charge = player.quarks.charge.plus(1);
}

function subTotalQuarks(x) {
    for (g=0; g<3; g++) player.quarks[quark_types[g]] = player.quarks[quark_types[g]].sub(player.quarks[quark_types[g]].div(tmp.qk.net).times(x).min(player.quarks[quark_types[g]]))
}

function getGluonGrowthMult() {
    let mult = tmp.upgs[22].eff;
    return mult;
}

function getGluonSizeRatio() {
    if (!player.quarks.unl) return new Decimal(0);

    let ratio = Decimal.sub(1, Decimal.div(1, tmp.qk.net.times(getGluonGrowthMult()).plus(1).log10().plus(1).sqrt()))
    return ratio;
}