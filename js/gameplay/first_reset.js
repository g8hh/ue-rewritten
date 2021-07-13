const universe_upgs_unl_req = new Decimal(7)
const universe_upgs = {
    rows: 2,
    cols: 3,
    11: {
        unl() { return player.upgsUnl },
        desc: "Dimensional Depths lower their goal.",
        cost(l) { return l.div(3).plus(1).pow(2).floor() },
        eff(l) { return player.depth.plus(1).log10().times(l).plus(1).sqrt().sub(1) },
        dispEff(e) { return "-"+format(e)+" depths" },
    }, 
    12: {
        unl() { return player.upgsUnl },
        desc() { return "Universal Slowdown starts "+format(tmp.upgs[23].eff.plus(0.2))+"m<sup>3</sup> later." },
        cost(l) { return l.div(2.5).plus(1).pow(2.1).plus(1).floor() },
        eff(l) { return l.times(Decimal.add(.2, tmp.upgs[23].eff)) },
        dispEff(e) { return format(e)+"m<sup>3</sup> later" },
    },
    13: {
        unl() { return player.upgsUnl },
        desc: "Improve the Dimensional Depth effect.",
        cost(l) { return l.div(2).plus(1).pow(2.2).plus(2).floor() },
        eff(l) { return l.plus(1).root(20).plus(l.plus(1).log10()) },
        dispEff(e) { return "^"+format(e) },
    },
    21: {
        unl() { return player.quarks.unl },
        desc: "Add 10% to the Quark Charge effect.",
        cost(l) { return l.div(1.5).plus(1).pow(2.3).plus(3).floor() },
        eff(l) { return l.div(10).plus(1) },
        dispEff(e) { return "+"+format(e.sub(1).times(100))+"%" },
    },
    22: {
        unl() { return player.quarks.unl },
        desc: "The Gluon grows 50% faster.",
        cost(l) { return l.plus(1).pow(2.4).plus(4).floor() },
        eff(l) { return Decimal.pow(1.5, l) },
        dispEff(e) { return format(e.sub(1).times(100))+"% faster" },
    },
    23: {
        unl() { return player.quarks.unl },
        desc: "Total Quarks add to Universe Upgrade 2's base.",
        cost(l) { return l.times(1.5).plus(1).pow(2.5).plus(5).floor() },
        eff(l) { return tmp.qk?(tmp.qk.net.plus(1).log10().div(5).times(l)):new Decimal(0) },
        dispEff(e) { return "+"+format(e) },
    },
}

function getPrestigeReq() { return Decimal.pow(1.05, player.depth.sub(tmp.upgs[11].eff).div(3).plus(1).pow(3).plus(1)) }

function prestige(force=false, auto=false) {
    if (!force) {
        if (!auto) tmp.prestige.req = getPrestigeReq();
        if (player.size.lt(tmp.prestige.req)) return;
        player.depth = player.depth.plus(1);
        player.essence = player.essence.plus(player.depth);
    }
    player.size = new Decimal(1)
    player.time = new Decimal(0)

    if (!auto) updateTemp();
}

function getDepthEff() { return player.depth.times(3).cbrt().plus(1).pow(tmp.upgs[13].eff) }

function unlockUniversalUpgs() {
    if (player.upgsUnl) return;
    if (player.essence.lt(universe_upgs_unl_req)) return;
    player.essence = player.essence.sub(universe_upgs_unl_req);
    player.upgsUnl = true;
}

function buyUniverseUpg(x) {
    if (!player.upgsUnl) return;
    if (!universe_upgs[x].unl()) return;

    let cost = universe_upgs[x].cost(tmp.upgs[x].lvl)
    if (player.essence.lt(cost)) return;
    player.essence = player.essence.sub(cost);
    player.spentEssence = player.spentEssence.plus(cost);
    player.upgs[x] = Decimal.add(player.upgs[x]||0, 1)
}

function respecUniverseUpgs() {
    if (!player.upgsUnl) return
    if (Object.keys(player.upgs).length==0) return
    if (!confirm("Are you sure you want to respec your Universe Upgrades for Universe Essence? This will also reset your Universe's size!")) return;

    player.essence = player.essence.plus(player.spentEssence)
    player.spentEssence = new Decimal(0)
    player.upgs = {};
    prestige(true)
}