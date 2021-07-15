function updateTemp() {
    updateTempUniverseUpgs();
    updateTempHadrons();
    updateTempQuarks();
    updateTempPrestige();

    tmp.sizeBase = getSizeBase();
    tmp.slowdown = {
        start: getUniverseSlowdownStart(),
        power: new Decimal(2),
    }
    tmp.compaction = {
        start: getUniverseCompactionStart(),
        power: new Decimal(2),
    }
}

function updateTempPrestige() {
    tmp.prestige = {
        req: getPrestigeReq(),
        eff: getDepthEff(),
    }
}

function updateTempUniverseUpgs() {
    tmp.upgs = {};
    for (let r=universe_upgs.rows;r>=1;r--) for (let c=universe_upgs.cols;c>=1;c--) {
        let id = r*10+c
        var data = { lvl: player.upgs[id]||new Decimal(0) };
        tmp.upgs[id] = data;
        data.extra = universe_upgs[id].extra?universe_upgs[id].extra():new Decimal(0)
        data.effL = universe_upgs[id].unl()?data.lvl.plus(data.extra):new Decimal(0);
        data.cost = universe_upgs[id].cost(data.lvl);
        data.eff = universe_upgs[id].eff(data.effL);
    }
    tmp.upgs.rowsUnl = Object.values(universe_upgs.rowUnls).filter(x => x.unl()).length;
}

function updateTempQuarks() {
    tmp.qk = {
        eff: {
            addedCharge: tmp.upgs[21].eff,
        },
        net: player.quarks.red.plus(player.quarks.blue).plus(player.quarks.green),
        chargeCost: getQuarkChargeCost(),
    }

    tmp.qk.eff.charge = player.quarks.charge.div(10).plus(1),

    tmp.qk.eff.red = player.quarks.red.plus(1).log10().plus(1).pow(tmp.qk.eff.charge.plus(tmp.qk.eff.addedCharge.sub(1)).times(tmp.had.boostEff)).div(20);
    tmp.qk.eff.green = player.quarks.green.plus(1).log10().plus(1).pow(tmp.qk.eff.charge.plus(tmp.qk.eff.addedCharge.sub(1)).times(tmp.had.boostEff)).div(30);
    tmp.qk.eff.blue = player.quarks.blue.plus(1).log10().plus(1).pow(tmp.qk.eff.charge.plus(tmp.qk.eff.addedCharge.sub(1)).times(tmp.had.boostEff)).div(10);

    tmp.qk.gain = {
        red: getQuarkGain("red"),
        green: getQuarkGain("green"),
        blue: getQuarkGain("blue"),
    }

    tmp.qk.gluon = {
        size: getGluonSizeRatio().times(player.size),
    }
    tmp.qk.gluon.eff = getGluonEff()
}

function updateTempHadrons() {
    tmp.had = {
        baseGain: new Decimal(1),
        eff: player.hadrons.amount.plus(1).log(5).plus(1).root(1.5),
        boostCost: getHadronicBoostCost(),
        boostEff: player.hadrons.boosters.plus(1).cbrt(),
        boostEff2: Decimal.pow(2, player.hadrons.boosters),
    }
    tmp.had.baseGain = tmp.had.baseGain.times(getHadronGainMult())
    tmp.had.dispGain = getHadronDispGain()
}