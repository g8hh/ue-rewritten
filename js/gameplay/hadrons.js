const hadrons_unl_req = new Decimal(70)

function playerHadronsData(fullReset=true) { return {
    unl: (!fullReset && hasAnhUpg(15)),
    time: new Decimal(0),
    amount: new Decimal(0),
    boosters: new Decimal(0),
}}

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
    if (hasAnhUpg(14)) mult = mult.times(10);
    return mult;
}

function getHadronicBoostPow() {
    let pow = new Decimal(1);
    if (hasAnhUpg(12)) pow = tmp.anh.upgs[12].eff
    return pow;
}

function getHadronicBoostCost() {
    return Decimal.pow(3, player.hadrons.boosters.plus(1).pow(4/3))
}

function getHadronicBoostTarget() {
    return player.hadrons.amount.max(1).log(3).pow(.75).floor()
}

function boostHadrons(auto=false, max=false) {
    if (!player.hadrons.unl) return;
    if (!auto) tmp.had.boostCost = getHadronicBoostCost();
    if (player.hadrons.amount.lt(tmp.had.boostCost)) return;

    let old = getUniverseEssenceGainMult();
    if (!max) {
        player.hadrons.boosters = player.hadrons.boosters.plus(1)
        player.hadrons.time = new Decimal(0)
        player.hadrons.amount = new Decimal(0)
        if (hasAnhUpg(11)) loadUniverseEssenceAmt(old, old.plus(.5))
    } else {
        let t = getHadronicBoostTarget()
        let b = t.sub(player.hadrons.boosters).max(0)
        player.hadrons.boosters = player.hadrons.boosters.max(t)
        if (hasAnhUpg(11)) loadUniverseEssenceAmt(old, old.plus(b.div(2)))
    }
}

function addToHadEff() {
    let add = new Decimal(0)
    if (hasAnhUpg(16)) add = tmp.anh.upgs[16].eff
    return add;
}