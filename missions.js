// ================================
// Prime Follower - Daily Missions Module
// Day-based missions shown on the Contact page
// ================================

import {
db, doc, updateDoc, increment,
addDoc, collection, serverTimestamp,
logTransaction, getUserProfile
} from "./firebase.js";

// ── Helpers ──
const todayKey = () => new Date().toISOString().split("T")[0];
const claimsKey = () => "missionClaims_" + todayKey();

function getClaims() {
try { return JSON.parse(localStorage.getItem(claimsKey())) || []; } catch { return []; }
}
function addClaim(id) {
const c = getClaims();
if (!c.includes(id)) { c.push(id); localStorage.setItem(claimsKey(), JSON.stringify(c)); }
}

// External hooks (called from order.js / pay.js / script.js)
window.markMissionOrderDone = () => { localStorage.setItem("missionOrderDone_" + todayKey(), "1"); renderMissions(); };
window.markMissionPaidDone  = () => { localStorage.setItem("missionPaidDone_" + todayKey(), "1"); renderMissions(); };
window.refreshDailyMissions = () => renderMissions();

// ── Day Config (0=Sun ... 6=Sat) ──
function getTodayConfig() {
const day = new Date().getDay();
const ads = (t, r) => ({ id: "ads", icon: "🎯", title: `Watch ${t} Ads`, reward: r, rewardLabel: `+${r} Credits`, type: "ads", target: t });
const share = (r) => ({ id: "share", icon: "📸", title: "Share App", reward: r, rewardLabel: `+${r} Credits`, type: "share" });
const checkin = (r) => ({ id: "checkin", icon: "🎁", title: "Daily Check-In", reward: r, rewardLabel: `+${r} Credits`, type: "checkin" });

switch (day) {
case 1: case 5: // Monday & Friday
return { missions: [ads(10, 3), share(5), checkin(2)], bonus: { type: "credits", amount: 10, label: "🎁 +10 Extra Credits" } };
case 2: // Tuesday
return { missions: [{ id: "order", icon: "🛒", title: "Place 1 Order", reward: 3, rewardLabel: "+3 Credits", type: "order" }], bonus: null };
case 3: // Wednesday
return { missions: [], bonus: null };
case 4: // Thursday
return { missions: [{ id: "buy", icon: "💳", title: "Buy Any Followers Package", reward: 25, rewardLabel: "+25 Credits", type: "buy" }], bonus: null };
case 6: // Saturday
return { missions: [{ id: "wallet", icon: "💰", title: "Have 100+ Credits in Wallet", reward: 20, rewardLabel: "+20 Credits", type: "wallet" }], bonus: null };
case 0: // Sunday
return { missions: [ads(15, 3), share(5)], bonus: { type: "diamond", amount: 1, label: "🎁 +1 Diamond 💎" } };
}
}

// ── Mission state check ──
function getMissionState(m, profile) {
const today = todayKey();
switch (m.type) {
case "ads": {
const adsDate = profile.daily_ads_date?.toDate?.()?.toISOString().split("T")[0] || null;
const watched = adsDate === today ? (profile.daily_ads_watched || 0) : 0;
return { done: watched >= m.target, progress: Math.min(watched, m.target), target: m.target };
}
case "share":
return { done: localStorage.getItem("missionShared_" + today) === "1" };
case "checkin": {
let done = false;
try {
const last = profile.lastCheckinDate?.toDate?.()?.toISOString().split("T")[0];
done = last === today;
} catch {}
return { done };
}
case "order":
return { done: localStorage.getItem("missionOrderDone_" + today) === "1" };
case "buy":
return { done: localStorage.getItem("missionPaidDone_" + today) === "1" };
case "wallet":
return { done: (profile.credits || 0) > 100 };
}
return { done: false };
}

// ── Timer to midnight ──
let dmTimerInterval = null;
function startDmTimer() {
const el = document.getElementById("dm-timer");
if (!el) return;
const update = () => {
const now = new Date();
const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
const ms = midnight - now;
const h = Math.floor(ms / 3600000);
const mm = Math.floor((ms % 3600000) / 60000);
el.textContent = `🔄 ${h}h ${mm}m`;
};
update();
clearInterval(dmTimerInterval);
dmTimerInterval = setInterval(update, 30000);
}

// ── Render ──
async function renderMissions() {
const list = document.getElementById("dm-list");
const bonusEl = document.getElementById("dm-bonus");
if (!list) return;
const user = window.cashTreasureUser;
if (!user) { list.innerHTML = '<p class="dm-no-task">Login to see today\'s missions</p>'; return; }

const cfg = getTodayConfig();
const claims = getClaims();

if (cfg.missions.length === 0) {
list.innerHTML = '<p class="dm-no-task">😴 No missions today — come back tomorrow!</p>';
if (bonusEl) bonusEl.style.display = "none";
return;
}

let profile;
try { profile = await getUserProfile(user.uid); } catch { profile = {}; }

list.innerHTML = cfg.missions.map((m, i) => {
const st = getMissionState(m, profile);
const claimed = claims.includes(m.id);
let bottom = "";

if (m.type === "ads") {
const pct = Math.round((st.progress / st.target) * 100);
let action = "";
if (claimed) action = '<span class="dm-claimed">✓ CLAIMED</span>';
else if (st.done) action = `<button class="dm-claim-btn" data-claim="${m.id}">CLAIM</button>`;
bottom = `
<span class="dm-m-status">${st.progress}/${st.target}</span>
<div class="dm-progress"><div class="dm-progress-fill" style="width:${pct}%"></div></div>
<span class="dm-m-pct">${pct}%</span>
${action}`;
} else {
const statusHTML = st.done
? '<span class="dm-m-status done">✓ Completed</span>'
: '<span class="dm-m-status notdone">Not Completed</span>';
let action;
if (claimed) action = '<span class="dm-claimed">✓ CLAIMED</span>';
else if (st.done) action = `<button class="dm-claim-btn" data-claim="${m.id}">CLAIM</button>`;
else action = `<button class="dm-go-btn" data-go="${m.type}">GO →</button>`;
bottom = `${statusHTML}${action}`;
}

return `
<div class="dm-mission">
<div class="dm-m-top">
<span class="dm-m-icon">${m.icon}</span>
<span class="dm-m-title">${i + 1}. ${m.title}</span>
<span class="dm-m-reward">${m.rewardLabel}</span>
</div>
<div class="dm-m-bottom">${bottom}</div>
</div>`;
}).join("");

// Bonus block
if (bonusEl) {
if (cfg.bonus) {
bonusEl.style.display = "flex";
document.getElementById("dm-bonus-reward").textContent = cfg.bonus.label;
const allClaimed = cfg.missions.every(m => claims.includes(m.id));
const bonusClaimed = claims.includes("bonus");
const btn = document.getElementById("dm-bonus-claim");
if (bonusClaimed) { btn.disabled = true; btn.textContent = "CLAIMED ✓"; }
else { btn.disabled = !allClaimed; btn.textContent = "CLAIM"; }
} else {
bonusEl.style.display = "none";
}
}
}

// ── Click handling (GO / CLAIM) ──
document.getElementById("daily-mission-card")?.addEventListener("click", async (e) => {
const goBtn = e.target.closest("[data-go]");
const claimBtn = e.target.closest("[data-claim]");
const user = window.cashTreasureUser;

if (goBtn) {
const type = goBtn.dataset.go;
if (type === "share") {
// Trigger the refer page share button — user gets credit no matter what
localStorage.setItem("missionShared_" + todayKey(), "1");
document.getElementById("refer-share-btn")?.click();
setTimeout(renderMissions, 600);
} else if (type === "checkin" || type === "wallet") {
window.navigateTo?.("home");
} else if (type === "order") {
window.navigateTo?.("order");
} else if (type === "buy") {
window.navigateTo?.("buy");
window.initBuyPage?.();
}
return;
}

if (claimBtn && user) {
const id = claimBtn.dataset.claim;
const cfg = getTodayConfig();
const mission = cfg.missions.find(m => m.id === id);
if (!mission || getClaims().includes(id)) return;
claimBtn.disabled = true;
try {
await updateDoc(doc(db, "users", user.uid), {
credits: increment(mission.reward),
total_earned: increment(mission.reward)
});
await logTransaction(user.uid, `Daily Mission: ${mission.title}`, mission.reward);
addClaim(id);
window.showToast?.(`+${mission.reward} Credits Added 🎉`, "success");
} catch (err) {
console.error("[Missions] claim error:", err);
window.showToast?.("Failed to claim. Try again.", "error");
}
renderMissions();
}
});

// ── Bonus claim ──
document.getElementById("dm-bonus-claim")?.addEventListener("click", async () => {
const user = window.cashTreasureUser;
if (!user) return;
const cfg = getTodayConfig();
if (!cfg.bonus) return;
const claims = getClaims();
if (claims.includes("bonus")) return;
if (!cfg.missions.every(m => claims.includes(m.id))) return;

const btn = document.getElementById("dm-bonus-claim");
btn.disabled = true;
try {
if (cfg.bonus.type === "diamond") {
await updateDoc(doc(db, "users", user.uid), { diamonds: increment(cfg.bonus.amount) });
await addDoc(collection(db, "transactions"), {
user_id: user.uid,
action: "Daily Mission Bonus - 1 Diamond",
amount: 0,
diamondChange: cfg.bonus.amount,
date: serverTimestamp()
});
window.showToast?.("💎 +1 Diamond Added!", "success");
} else {
await updateDoc(doc(db, "users", user.uid), {
credits: increment(cfg.bonus.amount),
total_earned: increment(cfg.bonus.amount)
});
await logTransaction(user.uid, "Daily Mission Bonus", cfg.bonus.amount);
window.showToast?.(`+${cfg.bonus.amount} Bonus Credits 🎉`, "success");
}
addClaim("bonus");
} catch (err) {
console.error("[Missions] bonus error:", err);
window.showToast?.("Failed to claim bonus.", "error");
}
renderMissions();
});

// ── Init ──
window.addEventListener("userReady", () => { startDmTimer(); renderMissions(); });
document.querySelector('.nav-item[data-page="contact"]')?.addEventListener("click", () => {
startDmTimer();
renderMissions();
});

console.log("✅ Daily Missions module loaded.");