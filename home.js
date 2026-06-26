// ================================
// Prime Follower - Home Page Module
// ================================

// ── 1. Imports ────────────────────────────────────────────────────────────────

import { getUserProfile, getDailyAdsCount } from "./firebase.js";
import { renderCheckin } from "./dailycheckin.js";

// ── 2. Utility Functions ──────────────────────────────────────────────────────

function updateCreditsDisplay(credits) {
  const el = document.getElementById("credit-count");
  const container = document.getElementById("floating-credits");
  if (!el || !container) return;

  el.textContent = credits;
  container.classList.add("credit-bump");
  setTimeout(() => container.classList.remove("credit-bump"), 400);
}

function getTodayAds(profile) {
  const today = new Date().toISOString().split("T")[0];
  const adsDate = profile.daily_ads_date
    ? profile.daily_ads_date.toDate().toISOString().split("T")[0]
    : null;
  return adsDate === today ? (profile.daily_ads_watched || 0) : 0;
}

// ── 3. Initialization ─────────────────────────────────────────────────────────

window.addEventListener("userReady", async (e) => {
  const { uid } = e.detail;
  const resetCount = await getDailyAdsCount(uid);
  const profile = await getUserProfile(uid);
  if (!profile) return;

  profile.daily_ads_watched = resetCount;
  updateAdCount(profile);
  renderCheckin(profile);
});

// ── 4. Watch Ad Button ────────────────────────────────────────────────────────

const watchBtn = document.getElementById("btn-watch-ad");
if (watchBtn) {
  watchBtn.addEventListener('click', () => {
    window.location.href = "download.html";
  });
}

// ── 5. Ad Count Update ────────────────────────────────────────────────────────

function updateAdCount(profile) {
  const count = getTodayAds(profile);
  const adLimit = profile.current_ad_limit || 10;
  const el = document.getElementById("ad-count");
  const btn = document.getElementById("btn-watch-ad");
  if (!el || !btn) return;

  el.textContent = `${count} / ${adLimit} ads today`;

  if (count >= adLimit) {
    btn.disabled = true;
    btn.textContent = "🚫 Limit Reached";
  } else {
    btn.disabled = false;
    btn.textContent = "▶ WATCH AD";
  }
}

window.renderCheckin = renderCheckin;

// ── 6. Spin Button → Redirect to Download ────────────────────────────────────

document.getElementById("btn-spin-now")?.addEventListener("click", () => {
  window.location.href = "download.html";
});

// (Optional) Keep a small "Coming Soon" popup if you want — but redirect anyway
// Remove the whole showSpinComingSoon function if you don't need it.

console.log("✅ Home module loaded.");