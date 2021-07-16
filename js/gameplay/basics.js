function gameLoop(diff) {
    updateTemp();

    if (!player.begun) return;
    player.time = player.time.plus(diff)
    player.size = getSize(player.time);
    if (player.quarks.unl) quarkLoop(diff);
    if (player.hadrons.unl) hadronLoop(diff);
    if (player.autoDepths && hasAnhUpg(22)) prestige(false, true);
    if (player.autoQH && hasAnhUpg(23)) {
        buyQuarkCharge(true, true)
        boostHadrons(true, true)
    }
    if (player.autoUU && hasAnhUpg(26)) maxAllUniUpgs(true);
}

function getSize(time) {
    let size = Decimal.pow(tmp.sizeBase, time);
    if (size.gte(tmp.slowdown.start)) size = size.times(tmp.slowdown.start.pow(tmp.slowdown.power.sub(1))).root(tmp.slowdown.power)
    if (size.gte(tmp.compaction.start)) size = size.div(tmp.compaction.start).log10().div(tmp.compaction.power).plus(1).root(tmp.compaction.power).times(tmp.compaction.start)
    return size;
}

function getSizeBase() {
    let base = Decimal.pow(1.01, tmp.prestige.eff)
    if (player.quarks.unl) base = base.pow(tmp.qk.gluon.eff)
    if (player.annihilation.reached) base = base.pow(tmp.anh.eff)
    return base;
}

function getUniverseSlowdownStart() {
    let start = tmp.upgs[12].eff.plus(2);
    if (player.hadrons.unl) start = start.times(tmp.had.eff);
    return start;
}

function getUniverseCompactionStart() {
    let start = tmp.upgs[33].eff.times(120);
    if (player.hadrons.unl) start = start.times(tmp.had.eff);
    if (hasAnhUpg(25)) start = start.times(2);
    return start;
}

intervals.loop = setInterval(function() {
    if (!player) return;

    let time = new Date().getTime()
    gameLoop(player.offtime?((time - player.lastTime)/1000):.02);
    player.lastTime = time;
}, 50)

intervals.autosave = setInterval(function() {
    if (player && !(!player.autosave)) save();
}, 5000)