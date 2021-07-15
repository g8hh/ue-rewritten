const hadrons_unl_req = new Decimal(70)

function unlockHadrons() {
    if (player.hadrons.unl) return;
    if (tmp.qk.gluon.size.lt(hadrons_unl_req)) return;
    player.hadrons.unl = true;
}

function hadronLoop(diff) {
    player.hadrons.time = player.hadrons.time.plus(diff);
    player.hadrons.amount = getHadrons();
}

function getHadrons() { return tmp.had.baseGain.times(player.hadrons.time.sqrt()) }
function getHadronDispGain() { return tmp.had.baseGain.div(player.hadrons.time.sqrt().times(2).sub(1).max(1)) }

function getHadronGainMult() {
    let mult = tmp.had.boostEff2.times(tmp.upgs[32].eff);
    return mult;
}

function getHadronicBoostCost() {
    return Decimal.pow(3, player.hadrons.boosters.plus(1).pow(4/3))
}

function boostHadrons(auto=false) {
    if (!player.hadrons.unl) return;
    if (!auto) tmp.had.boostCost = getHadronicBoostCost();
    if (player.hadrons.amount.lt(tmp.had.boostCost)) return;

    player.hadrons.boosters = player.hadrons.boosters.plus(1)
    player.hadrons.time = new Decimal(0)
    player.hadrons.amount = new Decimal(0)
}