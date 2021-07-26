function updateTemp() {
    updateTempPhotons();
    updateTempAnnihilation();
    updateTempVoid();
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
    tmp.upgs.totalLvl = new Decimal(0)
    tmp.upgs.addNine = player.annihilation.activeBoosts.includes(1) ? tmp.anh.boosts[1] : new Decimal(0)
    for (let r=universe_upgs.rows;r>=1;r--) for (let c=universe_upgs.cols;c>=1;c--) {
        let id = r*10+c
        var data = { lvl: player.upgs[id]||new Decimal(0) };
        tmp.upgs[id] = data;
        data.extra = universe_upgs[id].extra?universe_upgs[id].extra():new Decimal(0)
        data.effL = universe_upgs[id].unl()?data.lvl.plus(data.extra):new Decimal(0);
        data.cost = adjustUniUpgCost(universe_upgs[id].cost(data.lvl));
        data.eff = universe_upgs[id].eff(data.effL);
        tmp.upgs.totalLvl = tmp.upgs.totalLvl.plus(data.effL);
    }
    tmp.upgs.rowsUnl = Object.values(universe_upgs.rowUnls).filter(x => x.unl()).length;
}

function updateTempQuarks() {

    tmp.qk = {
        eff: {
            addedCharge: tmp.upgs[21].eff,
            multiplyExp: player.annihilation.activeBoosts.includes(2) ? tmp.anh.boosts[2] : new Decimal(1),
        },
        net: player.quarks.red.plus(player.quarks.blue).plus(player.quarks.green),
        chargeCost: getQuarkChargeCost(),
    }

    tmp.qk.eff.charge = getQuarkChargeEff();

    tmp.qk.eff.red = softcapQKAmt(player.quarks.red).plus(1).log10().plus(1).pow(getQuarkEffExp("r")).div(20)
    tmp.qk.eff.green = softcapQKAmt(player.quarks.green).plus(1).log10().plus(1).pow(getQuarkEffExp("g")).div(30)
    tmp.qk.eff.blue = softcapQKAmt(player.quarks.blue).plus(1).log10().plus(1).pow(getQuarkEffExp("b")).div(10)

    tmp.qk.gain = { mult: getGlobalQKGainMult() };
    tmp.qk.gain.red = getQuarkGain("red").times(tmp.qk.gain.mult)
    tmp.qk.gain.green = getQuarkGain("green").times(tmp.qk.gain.mult)
    tmp.qk.gain.blue = getQuarkGain("blue").times(tmp.qk.gain.mult)

    tmp.qk.gluon = {
        size: getGluonSizeRatio().times(getGluonProportionSize()),
    }
    tmp.qk.gluon.eff = getGluonEff()
    tmp.glu = tmp.qk.gluon.eff;
}

function updateTempHadrons() {
    tmp.had = {
        baseGain: new Decimal(1),
        eff: player.hadrons.amount.plus(1).log(5).plus(1).root(1.5).plus(addToHadEff()),
        boostCost: getHadronicBoostCost(),
        boostPow: getHadronicBoostPow(),
        extraBoosts: player.annihilation.activeBoosts.includes(3) ? tmp.anh.boosts[3] : new Decimal(0),
    }
    tmp.had.boostEff = player.hadrons.boosters.plus(tmp.had.extraBoosts).times(tmp.had.boostPow).plus(1).cbrt();
    tmp.had.boostEff2 = Decimal.pow(2, player.hadrons.boosters.plus(tmp.had.extraBoosts).times(tmp.had.boostPow));
    tmp.had.baseGain = tmp.had.baseGain.times(getHadronGainMult())
    tmp.had.dispGain = getHadronDispGain()
}

function updateTempAnnihilation() {
    tmp.anh = {};
    tmp.anh.upgs = {};
    for (let r=annihilation_upgs.rows;r>=1;r--) for (let c=annihilation_upgs.cols;c>=1;c--) {
        let id = r*10+c;
        if (!annihilation_upgs[id]) continue;
        tmp.anh.upgs[id] = {};
        if (annihilation_upgs[id].eff) tmp.anh.upgs[id].eff = annihilation_upgs[id].eff();
        tmp.anh.upgs[id].voidSwitch = player.void.active && !annihilation_upgs[id].keepVoid
        if (annihilation_upgs[id].voidEff) tmp.anh.upgs[id].voidEff = annihilation_upgs[id].voidEff()
    }
    tmp.anh.gain = getAnhGain();
    tmp.anh.next = getAnhNext();
    tmp.anh.eff = player.size.max(1).log10().plus(1).times(player.annihilation.total).plus(1).log10().plus(1).pow(2)
    tmp.anh.boosts = {};
    tmp.anh.boosts.can = canGetAnhBoost();
    tmp.anh.boosts.power = getAnhBoostPow();
    for (let i=1;i<=3;i++) tmp.anh.boosts[i] = getAnhBoostEff(i);
}

function updateTempVoid() {
    tmp.void = {};
    tmp.void.upgs = {};
    tmp.void.upgs.power = getVoidRepUpgPower();
    for (let id=1;id<=void_rep_upgs.amt;id++) {
        var data = { lvl: player.void.repUpgs[id]||new Decimal(0) };
        tmp.void.upgs[id] = data;
        data.cost = void_rep_upgs[id].cost(data.lvl);
        data.eff = void_rep_upgs[id].eff(data.lvl.times(tmp.void.upgs.power));
    }
    tmp.void.stGain = getSTFabricGain();
}

function updateTempPhotons() {
    tmp.ph = {};
    tmp.ph.col = {};
    for (let id=photon_data.length-1;id>=0;id--) {
        tmp.ph.col[id] = {};
        tmp.ph.col[id].genEff = getPhotonGenEff(id)
        tmp.ph.col[id].gain = getPhotonGain(id)
        tmp.ph.col[id].eff = photon_data[id].eff(photon_data[id].unl()?player.photons.colors[id].amt:new Decimal(0));
        tmp.ph.col[id].genCost = getPhotonGenCost(id)
    }
    tmp.ph.gain = getPhotonicMatterGain();
}