const photons_unl = new Decimal(1e16);
const photon_data = [
    {
        unl() { return player.photons.unl },
        color: "Red",
        id: "r",
        eff(p) { return {
            eff: p.plus(1).log10().div(2).cbrt().div(8),
            prod: p.plus(1),
        }},
        dispEff(e) { return "Increases the AE gain exponent by "+format(e) },
        dispProd(e) { return "Multiplies Photonic Matter production by "+format(e) },
        genCostStart: new Decimal(1),
        genCostBase: new Decimal(2),
        genCostExp: new Decimal(1.1),
    },
    {
        unl() { return player.photons.colors[0].gen.gte(1) },
        color: "Orange",
        id: "or",
        eff(p) { return {
            eff: p.plus(1).log10().plus(1).log(5).plus(1),
            prod: p.plus(1),
        }},
        dispEff(e) { return "Strengthens Annihilation Boosts by "+format(e.sub(1).times(100))+"%" },
        dispProd(e) { return "Multiplies Red Photon production by "+format(e) },
        genCostStart: new Decimal(100),
        genCostBase: new Decimal(3),
        genCostExp: new Decimal(1.2),
    },
    {
        unl() { return player.photons.colors[1].gen.gte(1) },
        color: "Yellow",
        id: "ylw",
        eff(p) { return {
            eff: p.plus(1).log10().plus(1).log(4).plus(1),
            prod: p.plus(1),
        }},
        dispEff(e) { return "Hadrons' nerf to their own production is "+format(e)+"x weaker" },
        dispProd(e) { return "Multiplies Orange Photon production by "+format(e) },
        genCostStart: new Decimal(1e4),
        genCostBase: new Decimal(4),
        genCostExp: new Decimal(1.3),
    },
    {
        unl() { return player.photons.colors[2].gen.gte(1) },
        color: "Green",
        id: "gr",
        eff(p) { 
            let e = p.plus(1).log10().plus(1).log(3).plus(1);
            if (e.gte(2.25)) e = e.log(2.25).sqrt().plus(1.25)
            return {
                eff: e,
                prod: p.plus(1),
            }
        },
        dispEff(e) { return "Improves the Green Quark effect by "+format(e.sub(1).times(100))+"%" },
        dispProd(e) { return "Multiplies Orange Photon production by "+format(e) },
        genCostStart: new Decimal(1e5),
        genCostBase: new Decimal(5),
        genCostExp: new Decimal(1.4),
    },
    {
        unl() { return player.photons.colors[3].gen.gte(1) },
        color: "Blue",
        id: "bl",
        eff(p) { return {
            eff: Decimal.sub(2, Decimal.div(1, p.plus(1).log10().plus(1).log10().div(3).plus(1).sqrt())),
            prod: p.plus(1),
        }},
        dispEff(e) { return "Makes Universe Upgrade 2 also make Universal Compaction's base start later at "+format(e.sub(1).times(100))+"% power ("+format(tmp.upgs[12].eff.times(e.sub(1)))+" m<sup>3</sup> later)" },
        dispProd(e) { return "Multiplies Green Photon production by "+format(e) },
        genCostStart: new Decimal(1e6),
        genCostBase: new Decimal(6),
        genCostExp: new Decimal(1.5),
    },
    {
        unl() { return player.photons.colors[4].gen.gte(1) },
        color: "Purple",
        id: "pur",
        eff(p) { return {
            eff: p.plus(1).log2().plus(1).log2().plus(1).sqrt(),
            prod: p.plus(1),
        }},
        dispEff(e) { return "Raises AE & Space-Time Fabric's boost to each other's gain ^"+format(e) },
        dispProd(e) { return "Multiplies Blue Photon production by "+format(e) },
        genCostStart: new Decimal(1e7),
        genCostBase: new Decimal(7),
        genCostExp: new Decimal(1.6),
    },
    {
        unl() { return player.photons.colors[5].gen.gte(1) },
        color: "Ultraviolet",
        id: "uv",
        eff(p) { return {
            eff: new Decimal(0),
            prod: p.times(10).plus(1),
        }},
        dispEff(e) { return "" },
        dispProd(e) { return "Multiplies the production of all previous Photon types by "+format(e) },
        genCostStart: new Decimal(1e18),
        genCostBase: new Decimal(10),
        genCostExp: new Decimal(1.8),
    },
]

function playerPhotonsData() { return {
    unl: false,
    matter: new Decimal(0),
    colors: [
        { amt: new Decimal(0), gen: new Decimal(0) }, // red
        { amt: new Decimal(0), gen: new Decimal(0) }, // orange
        { amt: new Decimal(0), gen: new Decimal(0) }, // yellow
        { amt: new Decimal(0), gen: new Decimal(0) }, // green
        { amt: new Decimal(0), gen: new Decimal(0) }, // blue
        { amt: new Decimal(0), gen: new Decimal(0) }, // purple
        { amt: new Decimal(0), gen: new Decimal(0) }, // UV
        { amt: new Decimal(0), gen: new Decimal(0) }, // X-Ray
        { amt: new Decimal(0), gen: new Decimal(0) }, // Gamma
    ],
}}

function unlockPhotons() {
    if (player.photons.unl) return;
    if (!player.void.unl) return;
    if (player.void.fabric.lt(photons_unl)) return;
    player.void.fabric = player.void.fabric.sub(photons_unl);
    player.photons.unl = true;
}

function getPhotonicMatterGain() {
    let base = player.void.fabric.div(photons_unl).sqrt()
    let scs = tmp.ph.col[0].eff.prod.sqrt().times(100)
    if (base.gte(scs)) base = Decimal.pow(scs, base.log(scs).sqrt());
    return base.times(tmp.ph.col[0].eff.prod);
}

function photonLoop(diff) {
    player.photons.matter = player.photons.matter.plus(tmp.ph.gain.times(diff));
    for (let i=0;i<photon_data.length;i++) if (photon_data[i].unl()) player.photons.colors[i].amt = player.photons.colors[i].amt.plus(tmp.ph.col[i].gain.times(diff));
}

function getPhotonGain(x) {
    let gain = tmp.ph.col[x].genEff;
    if (x<6 && tmp.ph.col[6]) gain = gain.times(tmp.ph.col[6].eff.prod);
    if (x!=5 && tmp.ph.col[x+1]) gain = gain.times(tmp.ph.col[x+1].eff.prod);
    return gain;
}

function getPhotonGenCost(x) {
    let data = photon_data[x];
    let l = player.photons.colors[x].gen;
    return data.genCostStart.times(data.genCostBase.pow(l.pow(data.genCostExp||1)))
}

function buyPhotonGen(x, auto=false) {
    if (!player.photons.unl) return;
    if (!auto) tmp.ph.col[x].genCost = getPhotonGenCost(x);
    let data = tmp.ph.col[x];
    if (player.photons.matter.lt(data.genCost)) return;
    player.photons.matter = player.photons.matter.sub(data.genCost);
    player.photons.colors[x].gen = player.photons.colors[x].gen.plus(1);
}

function getPhotonGenEff(x) {
    let eff = player.photons.colors[x].gen.div((x+1)*10);
    if (tmp.anh && hasAnhUpg(36)) eff = eff.times(tmp.anh.upgs[36].eff.mul).pow(tmp.anh.upgs[36].eff.exp)
    return eff;
}