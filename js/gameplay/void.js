const voidReqs = [33, 100]

function playerVoidData() { return {
    unl: false,
    active: false,
    upgs: {},
    fabric: new Decimal(0),
    repUpgs: {},
}}

function canUnlockVoid() { return player.depth.gte(voidReqs[0]) && player.annihilation.energy.gte(voidReqs[1]) };
function unlockVoid() {
    if (player.void.unl) return;
    if (!canUnlockVoid()) return;
    player.void.unl = true;
}

function enterVoid() {
    if (!player.void.unl) return;
    player.void.active = !player.void.active;
    annihilate(true, false);
}

function getVoidUpgTier(id) {
    return player.void.upgs[id]||0
}

function voidUpgActive(id) {
    let tier = getVoidUpgTier(id);
    if (tier==0) return false;
    else if (tier==1) return player.void.active;
    else return true;
}

function getSTFabricGainSlowdownPower() {
    let power = new Decimal(1)
    if (voidUpgActive(35)) power = Decimal.sub(1, tmp.anh.upgs[35].voidEff)
    return power;
}

function getSTFabricGain() {
    let gain = Decimal.pow(2, player.size.log2().sqrt()).sub(1).div(player.time.times(getSTFabricGainSlowdownPower()).div(4).plus(1).sqrt().times(10));
    gain = gain.times(tmp.void.upgs[2].eff);
    if (voidUpgActive(12)) gain = gain.times(tmp.anh.upgs[12].voidEff);
    if (voidUpgActive(21)) gain = gain.times(tmp.anh.upgs[21].voidEff);
    if (voidUpgActive(24)) gain = gain.times(tmp.anh.upgs[24].voidEff.stf);
    if (voidUpgActive(36)) gain = gain.times(tmp.anh.upgs[36].voidEff);
    return gain;
}

function voidLoop(diff) {
    player.void.fabric = player.void.fabric.plus(tmp.void.stGain.times(diff));
}

const void_rep_upgs = {
    amt: 3,
    1: {
        title: "Universe of Darkness",
        desc: "Increase Universe Essence gain & Universe Growth Speed by 20%.",
        cost(l) { return Decimal.pow(2, Decimal.pow(1.5, l).sub(1)) },
        eff(l) { return Decimal.pow(1.2, l) },
        dispEff(e) { return "+"+formatWhole(e.sub(1).times(100))+"%" },
    },
    2: {
        title: "Continuum Error",
        desc: "Double Space-Time Fabric gain.",
        cost(l) { 
            if (l.gte(4)) l = Decimal.pow(4, l.log(4).pow(1.03))
            return Decimal.pow(5, l.times(.6).plus(1).pow(1.1)) 
        },
        eff(l) { return Decimal.pow(2, l) },
        dispEff(e) { return formatWhole(e)+"x" },
    },
    3: {
        title: "Temporal Tear",
        desc: "Triple Annihilation Energy gain.",
        cost(l) { return Decimal.pow(10, l.pow(1.4)).times(80) },
        eff(l) { return Decimal.pow(3, l) },
        dispEff(e) { return formatWhole(e)+"x" },
    },
}

function getVoidRepUpgPower() {
    let power = new Decimal(1);
    if (voidUpgActive(32)) power = power.times((hasAnhUpg(31)&&getVoidUpgTier(32)>1)?1.25:1.2)
    return power;
}

function buyVoidRepUpg(x, auto=false) {
    if (!player.void.unl) return;
    if (!auto) tmp.void.upgs[x].lvl = player.void.repUpgs[x]||new Decimal(0)
    let cost = void_rep_upgs[x].cost(tmp.void.upgs[x].lvl)
    if (player.void.fabric.lt(cost)) return;
    let old = getUniverseEssenceGainMult();

    player.void.fabric = player.void.fabric.sub(cost)
    player.void.repUpgs[x] = Decimal.add(player.void.repUpgs[x]||0, 1)

    if (x==1) loadUniverseEssenceAmt(old, old.times(1.2));
}