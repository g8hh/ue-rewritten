var player;
var app;
var tmp = {};
var intervals = {};
var tabData = {
    normal: "Universe",
}
var storageName = "UErewritten";

const tabs = {
    normal: {
        Options() { return true },
        Universe() { return true },
        Quarks() { return player.quarks.unl },
        Hadrons() { return player.hadrons.unl },
    },
}

function showTab(name, type) { if (tabs[type][name]()) tabData[type] = name }

function startPlayer() { return {
    autosave: true,
    offtime: true,
    lastTime: new Date().getTime(),
    begun: false,
    size: new Decimal(1),
    time: new Decimal(0),
    depth: new Decimal(0),
    essence: new Decimal(0),
    spentEssence: new Decimal(0),
    upgsUnl: false,
    upgs: {},
    quarks: {
        unl: false,
        red: new Decimal(0),
        green: new Decimal(0),
        blue: new Decimal(0),
        charge: new Decimal(0),
    },
    hadrons: {
        unl: false,
        time: new Decimal(0),
        amount: new Decimal(0),
        boosters: new Decimal(0),
    },
}}

function save() {
    localStorage.setItem(storageName, btoa(JSON.stringify(player)));
}

function loadGame() {
    let g = localStorage.getItem(storageName);
    if (g !== null) player = JSON.parse(atob(g));
    else player = startPlayer();

    fixPlayerObj(player, startPlayer());
    transformPlayerToDecimal()

    updateTemp();
    updateTemp();

    loadVue();
}

function fixPlayerObj(obj, start) {
	for (let x in start) {
		if (obj[x] === undefined) obj[x] = start[x]
		else if (typeof start[x] == "object" && !(start[x] instanceof Decimal)) fixPlayerObj(obj[x], start[x])
		else if (start[x] instanceof Decimal) obj[x] = new Decimal(obj[x])
	}
}

function transformPlayerToDecimal() {
    for (let x in player.upgs) player.upgs[x] = new Decimal(player.upgs[x])
}

function hardReset() {
    if (!confirm("Are you 100% sure you want to completely reset your save??? All of your progress will be lost!")) return;

    player = startPlayer();
    save();
    window.location.reload();
}

function toggleAutoSave() { player.autosave = !player.autosave }
function toggleOffTime() { player.offtime = !player.offtime }

function importSave() {
	let data = prompt("Paste save data: ")
	if (data===undefined||data===null||data=="") return;
	try {
		player = JSON.parse(atob(data));
		save()
		window.location.reload();
	} catch(e) {
		console.log("Import failed!");
		console.error(e);
		return;
	}
}

function exportSave() {
	let data = btoa(JSON.stringify(player))
	const a = document.createElement('a');
	a.setAttribute('href', 'data:text/plain;charset=utf-8,' + data);
	a.setAttribute('download', "uer.txt");
	a.setAttribute('id', 'downloadSave');

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

function loadVue() {
    return new Vue({
        el: "#app",
        data: {
            player,
            tmp,
            format,
            formatWhole,
            tabs,
            tabData,
            showTab,
            universe_upgs_unl_req,
            universe_upgs,
            buyUniverseUpg,
            quarks_unl_req,
            checkFunc,
            hadrons_unl_req,
        },
    })
}