const anhBaseReq = 18;
const anhReqDiv = 3;

function playerAnnihilationData() { return {
    reached: false,
    energy: new Decimal(0),
    total: new Decimal(0),
    upgs: [],
    activeBoosts: [],
}}

function getAnhGain() { 
    let d = player.depth;
    let base = d.sub(anhBaseReq).div(anhReqDiv)
    if (base.lt(0)) return new Decimal(0);
    else return Decimal.pow(2, base.root(1.1)).floor() 
};
function getAnhNext() { 
    let next = tmp.anh.gain.plus(1).log2().pow(1.1).times(anhReqDiv).plus(anhBaseReq)
    return next.ceil() 
};

function annihilate(force=false, auto=false) {
    if (!force) {
        if (!auto) tmp.anh.gain = getAnhGain();
        if (tmp.anh.gain.lt(1)) return;
        if (!player.annihilation.reached) {
            if (!confirm("Are you sure you wish to do this? This will reset all previous progress!")) return;
            player.annihilation.reached = true
        }
        player.annihilation.energy = player.annihilation.energy.plus(tmp.anh.gain);
        player.annihilation.total = player.annihilation.total.plus(tmp.anh.gain);
    }

    player.size = new Decimal(1)
    player.time = new Decimal(0)
    player.depth = new Decimal(0)
    player.essence = new Decimal(0)
    player.spentEssence = new Decimal(0)
    player.upgsUnl = hasAnhUpg(13)
    player.upgs = {}
    player.quarks = playerQuarksData(false)
    player.hadrons = playerHadronsData(false)

    if (!auto) updateTemp();
}

function getAnhBoostPow() {
    return new Decimal(1);
}

function getAnhBoostEff(x) {
    let power = tmp.anh.boosts.power;
    
    if (x==1) return player.depth.plus(1).log10().times(power).sqrt();
    else if (x==2) return player.annihilation.energy.plus(1).log10().times(power).plus(1).cbrt();
    else return tmp.upgs?tmp.upgs.totalLvl.plus(1).log10().div(2).times(power).root(4):new Decimal(0)
}

function getAnhBoostLimit() { return hasAnhUpg(26)?2:1 }
function canGetAnhBoost() { return player.annihilation.activeBoosts.length<getAnhBoostLimit() }

function toggleAnhBoost(x) {
    if (player.annihilation.activeBoosts.includes(x)) player.annihilation.activeBoosts = player.annihilation.activeBoosts.filter(y => y!=x);
    else if (canGetAnhBoost()) player.annihilation.activeBoosts.push(x)

    annihilate(true);
}

const annihilation_upgs = {
    rows: 2,
    cols: 6,
    11: {
        unl() { return player.annihilation.reached },
        desc: "Bought Hadronic Boosters boost Universe Essence gain.",
        cost: new Decimal(1),
        eff() { return player.hadrons.boosters.div(2).plus(2) },
        dispEff(e) { return format(e)+"x" },
    },
    12: {
        unl() { return player.annihilation.upgs.includes(11) },
        desc: "Unspent AE strengthens Hadronic Boosters.",
        cost: new Decimal(1),
        eff() { return player.annihilation.energy.plus(1).log(5).plus(1.21).sqrt() },
        dispEff(e) { return format(e)+"x" },
    },
    13: {
        unl() { return player.annihilation.upgs.includes(11) },
        desc: "Start with 3 Universal Upgrades unlocked on reset.",
        cost: new Decimal(1),
    },
    14: {
        unl() { return player.annihilation.upgs.length>=2 },
        desc: "The Gluon & Hadrons grow 10x as fast.",
        cost: new Decimal(2),
    },
    15: {
        unl() { return player.annihilation.upgs.includes(13) && player.annihilation.upgs.length>=3 },
        desc: "Start with Quarks, Hadrons, and all Universal Upgrades unlocked.",
        cost: new Decimal(2),
    },
    16: {
        unl() { return player.annihilation.upgs.length>=4 },
        desc: "Hadronic Boosters add to the Hadron effect.",
        cost: new Decimal(2),
        eff() { return player.hadrons.boosters.plus(tmp.had?tmp.had.extraBoosts:0).div(2).sqrt() },
        dispEff(e) { return "+"+format(e) },
    },
    21: {
        unl() { return player.annihilation.upgs.length>=5 },
        desc: "The Gluon boosts Quark gain at a reduced rate.",
        cost: new Decimal(3),
        eff() { return tmp.qk?tmp.qk.gluon.size.plus(1).log10().plus(1):new Decimal(1) },
        dispEff(e) { return format(e)+"x" },
    },
    22: {
        unl() { return player.annihilation.upgs.length>=6 },
        desc: "Automate Dimensional Depths, and Universal Upgrades do not spend Universe Essence.",
        cost: new Decimal(4),
        size: "1em",
        toggle: "autoDepths",
    },
    23: {
        unl() { return player.annihilation.upgs.length>=7 },
        desc: "Automate Quark Charge & Hadronic Boosts.",
        cost: new Decimal(8),
        toggle: "autoQH",
    },
    24: {
        unl() { return player.annihilation.upgs.length>=8 },
        desc: "Quark Charge adds to Universal Upgrade 3's effect.",
        cost: new Decimal(16),
        eff() { return player.quarks.charge.plus(1).log(50).plus(1).sqrt().sub(1).div(2) },
        dispEff(e) { return "+"+format(e) },
    },
    25: {
        unl() { return player.annihilation.upgs.length>=9 },
        desc: "Universal Compaction starts 2x later, and Dimensional Depths reset nothing.",
        cost: new Decimal(25),
        size: "1.1em",
    },
    26: {
        unl() { return player.annihilation.upgs.length>=10 },
        desc: "Automate Universal Upgrades, and you can activate 2 Annihilation Boosts at once.",
        cost: new Decimal(40),
        size: "1em",
        toggle: "autoUU",
    },
}

function hasAnhUpg(id) { return player.annihilation.upgs.includes(id) };

function buyAnnihilationUpg(id) {
    if (player.annihilation.upgs.includes(id)) return;

    let old = getUniverseEssenceGainMult()
    let data = annihilation_upgs[id];
    if (player.annihilation.energy.lt(data.cost)) return;
    player.annihilation.energy = player.annihilation.energy.sub(data.cost);
    player.annihilation.upgs.push(id);

    if (id==11) loadUniverseEssenceAmt(old, getUniverseEssenceGainMult());
    if (id==13) player.upgsUnl = true;
    if (id==15) {
        player.quarks.unl = true;
        player.hadrons.unl = true;
    }
    if (id==16) {
        player.essence = player.essence.plus(player.spentEssence)
        player.spentEssence = new Decimal(0)
    }
}