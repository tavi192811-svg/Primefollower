// ================================
// Prime Follower - Badges & Rewards Module
// ================================

import {
db, doc, updateDoc, increment,
addDoc, collection, query, where, getDocs,
serverTimestamp, Timestamp,
logTransaction, getUserProfile
} from "./firebase.js";

// ── Tiers ──
const TIERS = [
{ key: "common",    name: "Common",    emoji: "⚪", color: "#6b7280", bg: "#f3f4f6" },
{ key: "uncommon",  name: "Uncommon",  emoji: "🟢", color: "#16a34a", bg: "#dcfce7" },
{ key: "epic",      name: "Epic",      emoji: "🟣", color: "#9333ea", bg: "#f3e8ff" },
{ key: "legendary", name: "Legendary", emoji: "🟠", color: "#ea580c", bg: "#ffedd5" },
{ key: "mythic",    name: "Mythic",    emoji: "🌈", color: "#db2777", bg: "linear-gradient(90deg,#fde68a,#fbcfe8,#ddd6fe)" }
];
const tierOf = (key) => TIERS.find(t => t.key === key);

// ── Badge definitions ──
const BADGES = [
{ icon: "🥉", name: "First Step",        req: "Create an account",                      tier: "common",    check: () => true },
{ icon: "🎁", name: "First Credit",      req: "Earn your first credit",                 tier: "common",    check: (p) => (p.total_earned || 0) >= 1 },
{ icon: "💯", name: "Credit Collector",  req: "Earn 100 lifetime credits",              tier: "uncommon",  check: (p) => (p.total_earned || 0) >= 100 },
{ icon: "💎", name: "Credit Master",     req: "Earn 500 lifetime credits",              tier: "epic",      check: (p) => (p.total_earned || 0) >= 500 },
{ icon: "👑", name: "Credit Legend",     req: "Earn 1000 lifetime credits",             tier: "legendary", check: (p) => (p.total_earned || 0) >= 1000 },
{ icon: "🔥", name: "Daily Grinder",     req: "Check in for 7 consecutive days",        tier: "uncommon",  check: (p) => (p.checkinCycle || 0) >= 1 || (p.checkinDay || 0) >= 7 },
{ icon: "📅", name: "100 Days Strong",   req: "Complete 100 total check-ins",           tier: "legendary", check: (p) => (p.total_checkins || 0) >= 100 },
{ icon: "🎥", name: "Ad Explorer",       req: "Watch 50 ads",                           tier: "epic",      check: (p) => (p.total_ads_watched || 0) >= 50 },
{ icon: "📺", name: "Ad Champion",       req: "Watch 500 ads",                          tier: "legendary", check: (p) => (p.total_ads_watched || 0) >= 500 },
{ icon: "💰", name: "First Purchase",    req: "Complete your first paid order",         tier: "legendary", check: (p) => p.first_paid_order_completed === true || (p.lifetime_spending || 0) > 0 },
{ icon: "🛒", name: "Order Rookie",      req: "Complete 10 orders",                     tier: "uncommon",  check: (p, s) => s.orderCount >= 10 },
{ icon: "🚀", name: "Order Expert",      req: "Complete 20 orders",                     tier: "epic",      check: (p, s) => s.orderCount >= 20 },
{ icon: "🏆", name: "Order Legend",      req: "Complete 100 orders",                    tier: "mythic",    check: (p, s) => s.orderCount >= 100 },
{ icon: "🤝", name: "Prime Referrer",    req: "Successfully refer your first friend",   tier: "uncommon",  check: (p) => (p.referralCount || 0) >= 1 },
{ icon: "👥", name: "Community Builder", req: "Successfully refer 3 friends",           tier: "common",    check: (p) => (p.referralCount || 0) >= 3 },
{ icon: "🌟", name: "Referral Bonus",    req: "Unlock the Prime Referral Bonus reward", tier: "legendary", check: (p) => p.primeViralBonusClaimed === true },
{ icon: "💳", name: "Premium Supporter", req: "Spend ₹500 in total",                    tier: "mythic",    check: (p) => (p.lifetime_spending || 0) >= 500 },
{ icon: "💖", name: "Loyal Member",      req: "Stay active for 365 days",               tier: "mythic",    check: (p) => { const c = p.created_at?.toDate?.(); return !!c && (Date.now() - c.getTime()) >= 365 * 24 * 60 * 60 * 1000; } }
];

// ── Reward definitions ──
const REWARDS = [
{ id: 1, field: "badgeReward1Claimed", icon: "🪙", title: "Get FREE 25 Credits",   desc: "Earn 3 Common badges",            style: "plain",
check: (c) => c.common >= 3,
popup: (c) => `Earn at least 3 Common badges.\n\nYou currently have:\n${c.common} / 3 Common badges` },
{ id: 2, field: "badgeReward2Claimed", icon: "💎", title: "Get FREE 1 Diamond",    desc: "Earn 2 Uncommon badges",          style: "plain",
check: (c) => c.uncommon >= 2,
popup: (c) => `Earn at least 2 Uncommon badges.\n\nYou currently have:\n${c.uncommon} / 2 Uncommon badges` },
{ id: 3, field: "badgeReward3Claimed", icon: "👥", title: "Get FREE 50 Followers", desc: "3 Common + 3 Uncommon badges",    style: "goldlite", followers: 50,
check: (c) => c.common >= 3 && c.uncommon >= 3,
popup: (c) => `Earn at least 3 Common badges\nAND\n3 Uncommon badges.\n\nYou currently have:\n\nCommon: ${c.common} / 3\nUncommon: ${c.uncommon} / 3` },
{ id: 4, field: "badgeReward4Claimed", icon: "🚀", title: "Get FREE 100 Followers", desc: "1 Epic OR 1 Legendary badge",    style: "gold", followers: 100,
check: (c) => c.epic >= 1 || c.legendary >= 1,
popup: (c) => `Earn at least\n\n1 Epic badge\n\nOR\n\n1 Legendary badge.\n\nYou currently have:\n\nEpic: ${c.epic}\nLegendary: ${c.legendary}` },
{ id: 5, field: "badgeReward5Claimed", icon: "🌈", title: "Get FREE 500 Followers", desc: "Any 1 Mythic badge",             style: "mythic", followers: 500,
check: (c) => c.mythic >= 1,
popup: (c) => `Earn any 1 Mythic badge.\n\nYou currently have:\n\n${c.mythic} / 1 Mythic badge` }
];

// ── Compute state ──
function safeCheck(b, p, s) { try { return b.check(p, s); } catch { return false; } }

async function computeBadgeState(uid) {
const profile = await getUserProfile(uid);
let orderCount = 0;
try {
const snap = await getDocs(query(collection(db, "orders"), where("user_id", "==", uid)));
orderCount = snap.size;
} catch (e) { console.warn("[Badges] order count failed:", e); }
const stats = { orderCount };
const badges = BADGES.map(b => ({ ...b, earned: !!safeCheck(b, profile, stats) }));
const counts = { common: 0, uncommon: 0, epic: 0, legendary: 0, mythic: 0 };
badges.forEach(b => { if (b.earned) counts[b.tier]++; });
return { profile, badges, counts };
}

// ── Open page ──
async function openBadgesPage() {
const user = window.cashTreasureUser;
if (!user) return window.showToast?.("Please login first", "error");

document.getElementById("badges-page-overlay")?.remove();
const overlay = document.createElement("div");
overlay.id = "badges-page-overlay";
overlay.className = "badges-overlay";
overlay.innerHTML = `
<button class="badges-close" id="badges-close">✕</button>
<div class="badges-inner">
<h2 class="badges-page-title">YOUR ACTIVITIES</h2>

<div class="badges-howto">
<h4 class="badges-howto-title">How We See Your Activities</h4>
<p><b>1.</b> We automatically track your activities while you use Prime Follower, including earning credits, placing orders, referrals, daily check-ins, and other achievements.</p>
<p><b>2.</b> Whenever you complete the required milestone for a badge, it is unlocked instantly and added to your profile automatically. No manual claim is required.</p>
<p><b>3.</b> Collect badges to unlock exclusive rewards. The more badges you earn, the more free credits, diamonds, and followers you can claim.</p>
</div>

<h3 class="badges-section-title">BADGES</h3>
<p class="badges-tier-legend">Badge Tiers: ⚪ Common · 🟢 Uncommon · 🟣 Epic · 🟠 Legendary · 🌈 Mythic</p>
<div id="badges-table"><div class="spinner"></div></div>

<h3 class="badges-section-title">MY BADGES</h3>
<div id="mybadges-area"><div class="spinner"></div></div>

<h3 class="badges-section-title">REWARDS</h3>
<div id="rewards-area"><div class="spinner"></div></div>
</div>`;
document.body.appendChild(overlay);
document.getElementById("badges-close").addEventListener("click", () => overlay.remove());

const state = await computeBadgeState(user.uid);
renderBadgesTable(state);
renderMyBadges(state);
renderRewards(state);
}

// ── Render: badge list ──
function renderBadgesTable(state) {
const el = document.getElementById("badges-table");
if (!el) return;
el.innerHTML = state.badges.map(b => {
const t = tierOf(b.tier);
return `
<div class="badge-row ${b.earned ? "earned" : ""}">
<span class="badge-row-icon">${b.icon}</span>
<div class="badge-row-info">
<div class="badge-row-name">${b.name} ${b.earned ? "✓" : ""}</div>
<div class="badge-row-req">${b.req}</div>
</div>
<span class="badge-tier-pill" style="color:${t.color}; background:${t.bg};">${t.emoji} ${t.name}</span>
</div>`;
}).join("");
}

// ── Render: my badges grouped by tier ──
function renderMyBadges(state) {
const el = document.getElementById("mybadges-area");
if (!el) return;
el.innerHTML = TIERS.map(t => {
const earned = state.badges.filter(b => b.tier === t.key && b.earned);
let body;
if (earned.length === 0) {
body = `<p class="mybadges-empty">You don't have any ${t.name} badges yet.</p>`;
} else {
body = `<div class="mybadges-grid">${earned.map(b => `
<div class="mybadge-item">
<span class="mb-icon">${b.icon}</span>
<span class="mb-name">${b.name}</span>
</div>`).join("")}</div>`;
}
return `
<div class="mybadges-group">
<div class="mybadges-group-title" style="color:${t.color};">${t.emoji} ${t.name}</div>
${body}
</div>`;
}).join("");
}

// ── Render: rewards ──
function renderRewards(state) {
const el = document.getElementById("rewards-area");
if (!el) return;
el.innerHTML = REWARDS.map(r => {
const claimed = state.profile[r.field] === true;
const unlocked = r.check(state.counts);
let btnClass = "locked", btnText = "CLAIM";
if (claimed) { btnClass = "claimed"; btnText = "CLAIMED ✓"; }
else if (unlocked) { btnClass = "unlocked"; }
return `
<div class="reward-card ${r.style}">
<span class="reward-icon">${r.icon}</span>
<div class="reward-info">
<div class="reward-title">${r.title}</div>
<div class="reward-desc">${r.desc}</div>
</div>
<button class="reward-claim-btn ${btnClass}" data-reward="${r.id}">${btnText}</button>
</div>`;
}).join("");

el.querySelectorAll(".reward-claim-btn").forEach(btn => {
btn.addEventListener("click", () => {
const reward = REWARDS.find(r => r.id === Number(btn.dataset.reward));
if (reward) handleRewardClaim(reward, state);
});
});
}

// ── Claim handling ──
async function handleRewardClaim(reward, state) {
const user = window.cashTreasureUser;
if (!user) return;
if (state.profile[reward.field] === true) return;

if (!reward.check(state.counts)) {
showReqPopup(reward.popup(state.counts));
return;
}

if (reward.followers) {
showBadgeIGForm(reward, state);
return;
}

try {
if (reward.id === 1) {
await updateDoc(doc(db, "users", user.uid), { credits: increment(25), total_earned: increment(25), badgeReward1Claimed: true });
await logTransaction(user.uid, "Badge Reward - 25 Credits", 25);
window.showToast?.("+25 Credits Added 🎉", "success");
} else if (reward.id === 2) {
await updateDoc(doc(db, "users", user.uid), { diamonds: increment(1), badgeReward2Claimed: true });
await addDoc(collection(db, "transactions"), {
user_id: user.uid, action: "Badge Reward - 1 Diamond",
amount: 0, diamondChange: 1, date: serverTimestamp()
});
window.showToast?.("💎 +1 Diamond Added!", "success");
}
state.profile[reward.field] = true;
renderRewards(state);
} catch (err) {
console.error("[Badges] claim error:", err);
window.showToast?.("Failed to claim. Try again.", "error");
}
}

// ── Requirement popup ──
function showReqPopup(text) {
document.querySelectorAll(".badge-req-popup").forEach(el => el.remove());
const overlay = document.createElement("div");
overlay.className = "badge-req-popup";
overlay.innerHTML = `
<div class="badge-req-card">
<div class="badge-req-icon">🔒</div>
<p class="badge-req-text">${text.replace(/</g, "&lt;")}</p>
<button class="btn-primary btn-full badge-req-ok">OK</button>
</div>`;
document.body.appendChild(overlay);
overlay.querySelector(".badge-req-ok").addEventListener("click", () => overlay.remove());
overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
}

// ── IG form for follower rewards ──
function showBadgeIGForm(reward, state) {
document.querySelectorAll(".badge-ig-popup").forEach(el => el.remove());
const overlay = document.createElement("div");
overlay.className = "badge-req-popup badge-ig-popup";
overlay.innerHTML = `
<div class="badge-req-card">
<img src="images/insta.jpeg" style="width:60px;height:60px;border-radius:14px;margin:0 auto 10px;display:block;">
<h3 style="font-size:17px;font-weight:800;margin-bottom:14px;text-align:center;">Claim ${reward.followers} FREE Followers</h3>
<input class="modal-input" id="badge-ig-username" type="text" placeholder="Instagram Username (e.g. @yourname)">
<input class="modal-input" id="badge-ig-link" type="url" placeholder="Instagram Profile Link">
<button class="btn-primary btn-full" id="badge-ig-confirm">CONFIRM</button>
<button class="btn-outline btn-full mt-12" id="badge-ig-cancel">Cancel</button>
</div>`;
document.body.appendChild(overlay);

if (typeof window.autoFillInstagram === "function") {
window.autoFillInstagram(
overlay.querySelector("#badge-ig-username"),
overlay.querySelector("#badge-ig-link")
);
}

overlay.querySelector("#badge-ig-cancel").addEventListener("click", () => overlay.remove());
overlay.querySelector("#badge-ig-confirm").addEventListener("click", async () => {
const user = window.cashTreasureUser;
const igUser = overlay.querySelector("#badge-ig-username").value.trim();
const igLink = overlay.querySelector("#badge-ig-link").value.trim();
if (!igUser) return window.showToast?.("Please enter username", "error");
if (igLink && !igLink.startsWith("https://www.instagram.com")) {
return window.showToast?.("Link must start with https://www.instagram.com", "error");
}
const btn = overlay.querySelector("#badge-ig-confirm");
btn.disabled = true;
btn.textContent = "⏳ Processing...";
try {
await addDoc(collection(db, "orders"), {
user_id: user.uid,
instagram_username: igUser,
instagram_link: igLink || "",
followers: reward.followers,
credits_spent: 0,
order_time: Timestamp.now(),
completion_time: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
status: "processing",
isPaidOrder: false,
isBadgeReward: true
});
await logTransaction(user.uid, `Badge Reward - ${reward.followers} Followers`, 0);
await updateDoc(doc(db, "users", user.uid), { [reward.field]: true });
state.profile[reward.field] = true;
overlay.remove();
window.showToast?.(`🎉 ${reward.followers} FREE Followers order placed!`, "success");
renderRewards(state);
} catch (err) {
console.error("[Badges] IG claim error:", err);
btn.disabled = false;
btn.textContent = "CONFIRM";
window.showToast?.("Something went wrong", "error");
}
});
}

// ── Wire home card ──
document.getElementById("badges-home-card")?.addEventListener("click", openBadgesPage);

console.log("✅ Badges module loaded.");