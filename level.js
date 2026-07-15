// ================================
// Prime Follower - Level & Membership System
// Complete membership tier system with carousel, progress tracking, and retention
// ★ CINEMATIC VIP EDITION v4 — logic 100% unchanged, only decorative layers added
//   (Royal Golden Palace Doors entrance + non-wrapping title stack)
// ================================

// ── 1. Imports ────────────────────────────────────────────────────────────────

import {
  db,
  getUserProfile,
  doc, updateDoc,
  Timestamp, serverTimestamp
} from "./firebase.js";

// ── 2. Level Definitions ──────────────────────────────────────────────────────

const LEVELS = [
  {
    id: 1,
    name: "Prime Starter",
    shortName: "STARTER",
    badge: "icons/plant.png",
    levelBadge: "images/badge1.png",
    badgeGlow: "rgba(34,197,94,0.6)",
    journey: "Your journey has just begun.",
    requirement: "Default level for every new member.",
    retentionReq: "NO REQUIREMENT!",
    benefits: [
      { icon: "🏷️", text: "Monthly 5% Coupon Code" },
      { icon: "📺", text: "Daily Ad Limit: 10" },
      { icon: "⏱️", text: "Order Delivery Time: 24 Hours" }
    ],
    adLimit: 10,
    deliveryHours: 24,
    adMultiplier: 1,
    checkinMultiplier: 1,
    couponPercent: 5,
    creditOrderDiscount: 0,
    freeFollowersMonthly: 0,
    freeFollowersLifetime: 0,
    viralBonusFollowers: 500
  },
  {
    id: 2,
    name: "Prime Lion",
    shortName: "LION",
    badge: "icons/lion.png",
    levelBadge: "images/badge2.png",
    badgeGlow: "rgba(255,215,0,0.6)",
    journey: "You are building consistency and growing stronger every day.",
    requirement: "Complete 7-Day Check-In Challenge.",
    retentionReq: "NO REQUIREMENT!",
   benefits: [
      { icon: "🏷️", text: "Monthly 5% Coupon Code" },
      { icon: "💰", text: "10% Credit Order Discount" },
      { icon: "📺", text: "Daily Ad Limit: 15" },
      { icon: "⚡", text: "Priority Support" },
      { icon: "⏱️", text: "Order Delivery Time: 24 Hours" },
      { icon: "⭐", text: "Exclusive attractive avatars package✨" }
    ],
    adLimit: 15,
    deliveryHours: 24,
    adMultiplier: 1,
    checkinMultiplier: 1,
    couponPercent: 5,
    creditOrderDiscount: 10,
    freeFollowersMonthly: 0,
    freeFollowersLifetime: 0,
    viralBonusFollowers: 500
  },
  {
    id: 3,
    name: "Prime Shark",
    shortName: "SHARK",
    badge: "icons/shark.png",
    levelBadge: "images/badge3.png",
    badgeGlow: "rgba(96,165,250,0.6)",
    journey: "You are making waves and unlocking powerful rewards.",
    requirement: "Complete Prime Viral Bonus OR Any Successful Paid Purchase.",
    retentionReq: "EARN ATLEAST 100 CREDITS IN A MONTH",
   benefits: [
      { icon: "🏷️", text: "Monthly 5% Coupon Code" },
      { icon: "💰", text: "10% Credit Order Discount" },
      { icon: "👥", text: "100 Free Followers (Lifetime)" },
      { icon: "📈", text: "Ad Earnings Multiplier: 1.2x" },
      { icon: "📺", text: "Daily Ad Limit: 20" },
      { icon: "🚀", text: "Prime Viral Bonus: 750 Followers" },
      { icon: "⚡", text: "Priority Support" },
      { icon: "⏱️", text: "Order Delivery Time: 12 Hours" },
      { icon: "🎁", text: "Exclusive Credit Packages" },
      { icon: "⭐", text: "Exclusive attractive avatars package✨" }
    ],
    adLimit: 20,
    deliveryHours: 12,
    adMultiplier: 1.2,
    checkinMultiplier: 1,
    couponPercent: 5,
    creditOrderDiscount: 10,
    freeFollowersMonthly: 0,
    freeFollowersLifetime: 100,
    viralBonusFollowers: 750
  },
  {
    id: 4,
    name: "Prime Elite",
    shortName: "ELITE",
    badge: "icons/diamond.png",
    levelBadge: "images/badge4.png",
    badgeGlow: "rgba(37,99,235,0.6)",
    journey: "You are among our elite members with premium privileges.",
    requirement: "₹1000+ Lifetime Spending.",
    retentionReq: "SPEND ATLEAST ₹500 DURING A CALENDER MONTH",
benefits: [
      { icon: "🏷️", text: "Monthly 10% Coupon Code" },
      { icon: "💰", text: "Monthly 10% Credit Order Coupon" },
      { icon: "👥", text: "100 Free Followers Every Month" },
      { icon: "💎", text: "Secret PRIME Telegram Group" },
      { icon: "📈", text: "Ad Earnings Multiplier: 1.5x" },
      { icon: "📺", text: "Daily Ad Limit: 35" },
      { icon: "🚀", text: "Prime Viral Bonus: 1000 Followers" },
      { icon: "✨", text: "Check-In Rewards: 1.2x" },
      { icon: "👑", text: "Elite Priority Queue" },
      { icon: "⏱️", text: "Order Delivery Time: 12 Hours" },
      { icon: "🎁", text: "Exclusive Credit Packages" },
      { icon: "⭐", text: "Exclusive attractive avatars package✨" }
    ],
    adLimit: 35,
    deliveryHours: 12,
    adMultiplier: 1.5,
    checkinMultiplier: 1.2,
    couponPercent: 10,
    creditOrderDiscount: 10,
    freeFollowersMonthly: 100,
    freeFollowersLifetime: 100,
    viralBonusFollowers: 1000
  },
  {
    id: 5,
    name: "Prime Member",
    shortName: "MEMBER",
    badge: "icons/member.png",
    levelBadge: "images/badge5.png",
    badgeGlow: "rgba(168,85,247,0.6)",
    journey: "You have reached the highest rank and unlocked VIP status.",
    requirement: "₹2000+ Spending During Current Calendar Month.",
    retentionReq: "SPEND ATLEAST ₹1000 DURING A CALENDER MONTH",
benefits: [
      { icon: "🏷️", text: "Monthly 50% Coupon Code" },
      { icon: "💰", text: "Monthly 25% Credit Order Coupon" },
      { icon: "👥", text: "500 Free Followers Every Month" },
      { icon: "💎", text: "Secret PRIME Telegram Group" },
      { icon: "📈", text: "Ad Earnings Multiplier: 2x" },
      { icon: "📺", text: "Daily Ad Limit: 50" },
      { icon: "🚀", text: "Prime Viral Bonus: 2000 Followers" },
      { icon: "✨", text: "Check-In Rewards: 1.5x" },
      { icon: "👑", text: "VIP Badge" },
      { icon: "⚡", text: "Top Priority Support" },
      { icon: "⏱️", text: "Order Delivery Time: 10 Hours" },
      { icon: "🎁", text: "Exclusive Credit Packages" },
      { icon: "💸", text: "Exclusive Paid Order Packages" },
      { icon: "⭐", text: "Exclusive attractive avatars package✨" }
    ],
    adLimit: 50,
    deliveryHours: 10,
    adMultiplier: 2,
    checkinMultiplier: 1.5,
    couponPercent: 15,
    creditOrderDiscount: 10,
    freeFollowersMonthly: 250,
    freeFollowersLifetime: 100,
    viralBonusFollowers: 2000
  }
];

// ── 3. Level Calculation Engine ───────────────────────────────────────────────

export function calculateUserLevel(profile) {
  if (!profile) return 1;

  const lifetimeSpending = profile.lifetime_spending || 0;
  const monthlySpending = profile.monthly_spending || 0;
  const checkinDay = profile.checkinDay || 0;
  const checkinCycle = profile.checkinCycle || 0;
  const primeViralCompleted = profile.primeViralBonusClaimed || false;
  const firstPaidOrder = profile.first_paid_order_completed || false;

  if (monthlySpending >= 2000) return 5;
  if (lifetimeSpending >= 1000) return 4;
  if (primeViralCompleted || firstPaidOrder) return 3;
  if (checkinCycle >= 1 || checkinDay >= 7) return 2;
  return 1;
}

export function getLevelDef(levelId) {
  return LEVELS.find(l => l.id === levelId) || LEVELS[0];
}

export function getNextLevel(currentLevel) {
  if (currentLevel >= 5) return null;
  return LEVELS.find(l => l.id === currentLevel + 1);
}

export function getLevelBenefits(levelId) {
  const def = getLevelDef(levelId);
  return {
    adLimit: def.adLimit,
    deliveryHours: def.deliveryHours,
    adMultiplier: def.adMultiplier,
    checkinMultiplier: def.checkinMultiplier,
    couponPercent: def.couponPercent,
    creditOrderDiscount: def.creditOrderDiscount,
    freeFollowersMonthly: def.freeFollowersMonthly,
    freeFollowersLifetime: def.freeFollowersLifetime,
    viralBonusFollowers: def.viralBonusFollowers
  };
}

export function calculateProgress(profile, currentLevel) {
  if (currentLevel >= 5) {
    return { percent: 100, text: "Maximum Level Reached", nextName: null };
  }

  const checkinDay = profile.checkinDay || 0;
  const checkinCycle = profile.checkinCycle || 0;
  const lifetimeSpending = profile.lifetime_spending || 0;
  const monthlySpending = profile.monthly_spending || 0;
  const primeViralCompleted = profile.primeViralBonusClaimed || false;
  const firstPaidOrder = profile.first_paid_order_completed || false;

  switch (currentLevel) {
    case 1: {
      const totalDays = (checkinCycle * 7) + checkinDay;
      const pct = Math.min(Math.round((totalDays / 7) * 100), 100);
      const remaining = Math.max(7 - totalDays, 0);
      return {
        percent: pct,
        text: remaining > 0 ? `Complete ${remaining} more check-in${remaining !== 1 ? 's' : ''}` : "Challenge complete!",
        nextName: "PRIME LION"
      };
    }
    case 2: {
      if (primeViralCompleted || firstPaidOrder) {
        return { percent: 100, text: "Requirement met!", nextName: "PRIME SHARK" };
      }
      return { percent: 25, text: "Complete Prime Viral Bonus or make a paid purchase", nextName: "PRIME SHARK" };
    }
    case 3: {
      const pct = Math.min(Math.round((lifetimeSpending / 1000) * 100), 100);
      const remaining = Math.max(1000 - lifetimeSpending, 0);
      return {
        percent: pct,
        text: remaining > 0 ? `Spend ₹${remaining} more` : "Requirement met!",
        nextName: "PRIME ELITE"
      };
    }
    case 4: {
      const pct = Math.min(Math.round((monthlySpending / 2000) * 100), 100);
      const remaining = Math.max(2000 - monthlySpending, 0);
      return {
        percent: pct,
        text: remaining > 0 ? `Spend ₹${remaining} more this month` : "Requirement met!",
        nextName: "PRIME MEMBER"
      };
    }
    default:
      return { percent: 0, text: "", nextName: null };
  }
}

// ── 4. Monthly Retention Review ───────────────────────────────────────────────

export async function applyMonthlyReview(uid, profile) {
  if (!profile) return { demoted: false };

  const now = new Date();
  const lastReview = profile.level_reviewed_at?.toDate?.() || null;

  if (lastReview) {
    const lastMonth = lastReview.getMonth();
    const lastYear = lastReview.getFullYear();
    if (lastMonth === now.getMonth() && lastYear === now.getFullYear()) {
      return { demoted: false };
    }
  }

  if (now.getDate() > 3) return { demoted: false };

  const currentLevel = profile.level || 1;
  const lastMonthSpending = profile.last_month_spending || 0;
  const lastMonthCredits = profile.monthly_credits_earned || 0;
  let newLevel = currentLevel;

  switch (currentLevel) {
    case 5:
      if (lastMonthSpending >= 1000) newLevel = 5;
      else if (lastMonthSpending >= 500) newLevel = 4;
      else newLevel = 3;
      break;
    case 4:
      if (lastMonthSpending >= 500) newLevel = 4;
      else newLevel = 3;
      break;
    case 3:
      if (lastMonthCredits < 100) newLevel = 2;
      break;
    case 2:
    case 1:
      break;
  }

  const updateData = {
    level_reviewed_at: Timestamp.now(),
    last_month_spending: profile.monthly_spending || 0,
    monthly_spending: 0,
    monthly_credits_earned: 0,
    monthly_free_followers_claimed: false
  };

  if (newLevel !== currentLevel) {
    updateData.level = newLevel;
    updateData.level_updated_at = Timestamp.now();
    // Also update benefits when demoted
    const benefits = getLevelBenefits(newLevel);
    updateData.current_ad_limit = benefits.adLimit;
    updateData.current_ad_multiplier = benefits.adMultiplier;
    updateData.current_checkin_multiplier = benefits.checkinMultiplier;
    updateData.current_delivery_hours = benefits.deliveryHours;
    updateData.vip_badge_enabled = newLevel >= 5;
  }

  try {
    await updateDoc(doc(db, "users", uid), updateData);
  } catch (err) {
    console.error("[Level] Monthly review error:", err);
  }

  return {
    demoted: newLevel < currentLevel,
    oldLevel: currentLevel,
    newLevel
  };
}

export async function grantLevelBenefits(uid, levelId) {
  const benefits = getLevelBenefits(levelId);
  try {
    await updateDoc(doc(db, "users", uid), {
      level: levelId,
      level_updated_at: Timestamp.now(),
      current_ad_limit: benefits.adLimit,
      current_ad_multiplier: benefits.adMultiplier,
      current_checkin_multiplier: benefits.checkinMultiplier,
      current_delivery_hours: benefits.deliveryHours,
      vip_badge_enabled: levelId >= 5
    });
  } catch (err) {
    console.error("[Level] Grant benefits error:", err);
  }
}

export async function evaluateAndUpdateLevel(uid) {
  try {
    const profile = await getUserProfile(uid);
    if (!profile) return { levelChanged: false };

    const currentLevel = profile.level || 1;
    const calculatedLevel = calculateUserLevel(profile);

    if (calculatedLevel !== currentLevel) {
      await grantLevelBenefits(uid, calculatedLevel);
      return {
        levelChanged: true,
        oldLevel: currentLevel,
        newLevel: calculatedLevel,
        levelDef: getLevelDef(calculatedLevel)
      };
    }

    return { levelChanged: false, oldLevel: currentLevel, newLevel: currentLevel, levelDef: getLevelDef(currentLevel) };
  } catch (err) {
    console.error("[Level] Evaluate error:", err);
    return { levelChanged: false };
  }
}

// ── 4b. ★ COSMETIC HELPER — percentage count-up (display only) ────────────────
// Animates the TEXT of the percentage from 0 → target. Never touches the
// calculated value or any state. Pure eye-candy.
function lvCountUpPercent(el, target) {
  if (!el) return;
  const duration = 1300;
  const start = performance.now();
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(easeOut(p) * target) + "%";
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── 5. Home Page Level Card (CINEMATIC VISUAL MARKUP) ─────────────────────────

export function renderLevelCard(profile) {
  const currentLevel = profile.level || calculateUserLevel(profile);
  const levelDef = getLevelDef(currentLevel);
  const progress = calculateProgress(profile, currentLevel);
  const nextLevel = getNextLevel(currentLevel);

  document.getElementById("level-card")?.remove();

  const card = document.createElement("div");
  card.id = "level-card";
  // ★ VISUAL: level-theme-X drives per-tier glow colors in CSS only
  card.className = `level-card-home level-theme-${currentLevel}`;
  card.addEventListener("click", () => openMembershipPage(profile));

  const progressLabel = nextLevel
    ? `Progress To ${nextLevel.name.toUpperCase()}`
    : "Maximum Level Achieved";

  // ★ VISUAL: staggered letter reveal — each word renders on its OWN
  // non-wrapping line ("PRIME" / "STARTER") so names never break mid-word.
  let lvLetterIndex = 0;
  const nameLines = levelDef.name.toUpperCase().split(" ").map(word => {
    const letters = word.split("").map(ch =>
      `<span class="lv-letter" style="--i:${lvLetterIndex++}">${ch}</span>`
    ).join("");
    return `<span class="lv-name-line">${letters}</span>`;
  }).join("");

  // ★ VISUAL: glowing progression path — reads already-computed currentLevel only
  const pathNodes = LEVELS.map((l, li) => {
    const state = l.id < currentLevel ? "done" : (l.id === currentLevel ? "now" : "lock");
    const node = `
      <div class="lv-path-node lv-node-${state}" style="--pi:${li}">
        <img src="${l.levelBadge}" alt="">
        ${state === "lock" ? '<span class="lv-node-lock">🔒</span>' : ''}
      </div>`;
    const link = li < LEVELS.length - 1
      ? `<span class="lv-path-link ${l.id < currentLevel ? 'lv-link-lit' : ''}"></span>`
      : "";
    return node + link;
  }).join("");

  // ★ VISUAL: "Next Rewards" teaser strip — uses already-computed nextLevel
  const nextTeaserHTML = nextLevel ? `
    <div class="lv-next-teaser">
      <div class="lv-next-badge-wrap">
        <img src="${nextLevel.levelBadge}" class="lv-next-badge" alt="">
        <span class="lv-next-lock">🔒</span>
      </div>
      <div class="lv-next-info">
        <span class="lv-next-label">NEXT REWARDS</span>
        <span class="lv-next-name">${nextLevel.name.toUpperCase()}</span>
      </div>
      <i class="fas fa-chevron-right lv-next-arrow"></i>
    </div>` : `
    <div class="lv-next-teaser lv-max">
      <span class="lv-next-crown">👑</span>
      <div class="lv-next-info">
        <span class="lv-next-label">LEGENDARY STATUS</span>
        <span class="lv-next-name">MAXIMUM LEVEL</span>
      </div>
    </div>`;

  card.innerHTML = `
    <div class="lv-aurora"></div>
    <div class="lv-fog"></div>
    <div class="level-particles" id="level-particles"></div>
    <div class="level-shine"></div>
    <div class="lv-gloss"></div>
    <div class="level-card-inner">
      <div class="level-badge-section">
        <div class="lv-badge-aura"></div>
        <div class="level-badge-ring level-ring-${currentLevel}" style="position:relative;">
          <span class="lv-badge-sheen"></span>
          <span class="lv-sparkle lv-s1">✦</span>
          <span class="lv-sparkle lv-s2">✧</span>
          <span class="lv-sparkle lv-s3">✦</span>
          <img src="${levelDef.badge}" alt="${levelDef.name}" class="level-badge-img">
          <span class="level-badge-number">${levelDef.id}</span>
          <div class="level-badge-overlay lv-badge-float" style="
            position:absolute; top:-22px; left:50%; transform:translateX(-50%);
            width:50px; height:50px; z-index:10;
            filter:drop-shadow(0 0 14px ${levelDef.badgeGlow}) drop-shadow(0 0 30px ${levelDef.badgeGlow});
          ">
            <img src="${levelDef.levelBadge}" style="width:100%;height:100%;object-fit:contain;">
          </div>
        </div>
      </div>
      <div class="level-info-section">
        <span class="level-you-are lv-fade-up" style="--d:.08s">You Are</span>
        <h3 class="level-name-text">${nameLines}</h3>
        <p class="level-journey-text lv-fade-up" style="--d:.38s">${levelDef.journey}</p>
        <div class="level-progress-section lv-fade-up" style="--d:.52s">
          <span class="level-progress-label">${progressLabel}</span>
          <div class="level-progress-track">
            <div class="lv-energy-spark"></div>
            <div class="level-progress-fill" style="width:0%">
              <span class="level-progress-pct">0%</span>
            </div>
          </div>
          <span class="level-progress-desc">${progress.text}</span>
        </div>
      </div>
    </div>
    <div class="lv-path lv-fade-up" style="--d:.6s">
      <div class="lv-path-track">${pathNodes}</div>
    </div>
    ${nextTeaserHTML}
    <div class="lv-floor-reflection"></div>
    <div class="level-card-tap-hint">TAP TO VIEW MEMBERSHIP <i class="fas fa-chevron-right"></i></div>
  `;

  const checkinCard = document.getElementById("checkin-card");
  if (checkinCard) {
    checkinCard.parentNode.insertBefore(card, checkinCard);
  }

  requestAnimationFrame(() => {
    setTimeout(() => {
      const fill = card.querySelector(".level-progress-fill");
      if (fill) fill.style.width = progress.percent + "%";
      // ★ VISUAL: cosmetic count-up of displayed percentage text
      lvCountUpPercent(card.querySelector(".level-progress-pct"), progress.percent);
    }, 200);
  });

  spawnLevelParticles();
  startLevelPulse();
}

function spawnLevelParticles() {
  const container = document.getElementById("level-particles");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 12; i++) {
    const dot = document.createElement("span");
    dot.className = "level-particle-dot";
    dot.style.left = Math.random() * 100 + "%";
    dot.style.top = Math.random() * 100 + "%";
    dot.style.animationDelay = (Math.random() * 4) + "s";
    dot.style.animationDuration = (3 + Math.random() * 4) + "s";
    // ★ VISUAL: organic size variance for constellation dust feel
    const size = (1.5 + Math.random() * 2.5).toFixed(1);
    dot.style.width = size + "px";
    dot.style.height = size + "px";
    container.appendChild(dot);
  }
}

let levelPulseInterval = null;
function startLevelPulse() {
  if (levelPulseInterval) clearInterval(levelPulseInterval);
  levelPulseInterval = setInterval(() => {
    const card = document.getElementById("level-card");
    if (!card) { clearInterval(levelPulseInterval); return; }
    card.classList.add("level-pulse");
    setTimeout(() => card.classList.remove("level-pulse"), 1200);
  }, 5000);
}

// ── 6. Membership Full Page (CINEMATIC VIP HALL MARKUP) ───────────────────────

let memberSlideIndex = 0;
let memberAutoTimer = null;
let memberTouchStartX = 0;
let memberIsSwiping = false;

function openMembershipPage(profile) {
  const currentLevel = profile.level || calculateUserLevel(profile);
  document.getElementById("membership-page-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "membership-page-overlay";
  overlay.className = "membership-overlay";

  overlay.innerHTML = `
    <div class="membership-header">
      <button class="membership-back-btn" id="membership-back"><i class="fas fa-arrow-left"></i></button>
      <h3 class="membership-title">PRIME LEVELS</h3>
      <div style="width:36px;"></div>
    </div>
    <div class="membership-dots" id="membership-dots"></div>
    <div class="membership-viewport" id="membership-viewport">
      <div class="membership-track" id="membership-track">
        ${buildAllSlides(profile, currentLevel)}
      </div>
    </div>

    <!-- ★ VISUAL: VIP hall ambient layers (pointer-events:none, decorative only) -->
    <div class="ms-hall" aria-hidden="true">
      <div class="ms-hall-fog"></div>
      <div class="ms-hall-floor"></div>
      <div class="ms-hall-gems">
        <span class="ms-gem" style="--gx:12%;--gd:0s;--gs:13px">💎</span>
        <span class="ms-gem" style="--gx:78%;--gd:4s;--gs:10px">✦</span>
        <span class="ms-gem" style="--gx:35%;--gd:8s;--gs:9px">✧</span>
        <span class="ms-gem" style="--gx:60%;--gd:12s;--gs:12px">💎</span>
        <span class="ms-gem" style="--gx:88%;--gd:16s;--gs:8px">✦</span>
        <span class="ms-gem" style="--gx:22%;--gd:20s;--gs:10px">✧</span>
      </div>
    </div>

    <!-- ★ VISUAL: ROYAL GOLDEN PALACE DOORS entrance (auto-removed, GPU-only) -->
    <div class="msd" id="msd-doors" aria-hidden="true">
      <div class="msd-rays"></div>
      <div class="msd-glow"></div>
      <div class="msd-particles">
        <span class="msd-dust" style="--dx:12%;--dd:.40s;--ds:3px"></span>
        <span class="msd-dust" style="--dx:26%;--dd:.65s;--ds:2px"></span>
        <span class="msd-dust" style="--dx:38%;--dd:.50s;--ds:2.5px"></span>
        <span class="msd-dust" style="--dx:50%;--dd:.80s;--ds:3px"></span>
        <span class="msd-dust" style="--dx:62%;--dd:.55s;--ds:2px"></span>
        <span class="msd-dust" style="--dx:74%;--dd:.70s;--ds:2.5px"></span>
        <span class="msd-dust" style="--dx:88%;--dd:.45s;--ds:3px"></span>
        <span class="msd-dust" style="--dx:45%;--dd:.95s;--ds:2px"></span>
      </div>
      <img src="icons/crowns.png" class="msd-crown-center" alt="">
      <div class="msd-door msd-left">
        <div class="msd-frame">
          <img src="icons/crowns.png" class="msd-crown" alt="">
          <img src="icons/prime-text.png" class="msd-word-img" alt="PRIME">
          <img src="icons/crowns.png" class="msd-crown" alt="">
        </div>
        <div class="msd-edge"></div>
      </div>
      <div class="msd-door msd-right">
        <div class="msd-frame">
          <img src="icons/crowns.png" class="msd-crown" alt="">
          <img src="icons/levels-text.png" class="msd-word-img" alt="LEVELS">
          <img src="icons/crowns.png" class="msd-crown" alt="">
        </div>
        <div class="msd-edge"></div>
      </div>
      <div class="msd-vignette"></div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));

  // ★ VISUAL: royal doors — fade out & remove once fully open (~1.4s total)
  const msdEl = document.getElementById("msd-doors");
  if (msdEl) {
    setTimeout(() => msdEl.classList.add("msd-out"), 2300);
    setTimeout(() => msdEl.remove(), 2500);
  }

  // ★ VISUAL: light reflections react to scroll (passive, CSS-var only)
  overlay.querySelectorAll(".membership-slide-scroll").forEach(sc => {
    sc.addEventListener("scroll", () => {
      sc.style.setProperty("--scroll-glint", ((sc.scrollTop % 600) / 600).toFixed(3));
    }, { passive: true });
  });

  buildMemberDots(6);
  goToMemberSlide(0);

  document.getElementById("membership-back").addEventListener("click", closeMembershipPage);

  const viewport = document.getElementById("membership-viewport");
  viewport.addEventListener("touchstart", onMemberTouchStart, { passive: true });
  viewport.addEventListener("touchend", onMemberTouchEnd, { passive: true });

  startMemberAutoplay();
}

function closeMembershipPage() {
  const overlay = document.getElementById("membership-page-overlay");
  if (!overlay) return;
  overlay.classList.remove("visible");
  stopMemberAutoplay();
  setTimeout(() => overlay.remove(), 350);
}

function buildAllSlides(profile, currentLevel) {
  let html = buildIntroSlide();
  for (let i = 0; i < LEVELS.length; i++) {
    html += buildLevelSlide(LEVELS[i], currentLevel, profile);
  }
  return html;
}

function buildIntroSlide() {
  return `
    <div class="membership-slide ms-slide-intro">
      <div class="ms-bg-particles" id="ms-particles-0"></div>
      <div class="membership-slide-scroll">
        <div class="ms-scroll-light"></div>
        <div class="membership-intro-content">
          <div class="membership-crown-wrap ms-anim" style="--d:.05s">
            <img src="icons/crown.png" alt="Crown" class="membership-crown-img">
          </div>
          <h2 class="membership-intro-heading ms-anim" style="--d:.14s">PRIME<br>MEMBERSHIP</h2>
          <div class="membership-intro-divider ms-anim" style="--d:.22s"></div>
          <p class="membership-intro-desc ms-anim" style="--d:.3s">
            Prime Membership rewards active users with exclusive discounts, free followers,
            premium benefits, faster delivery, higher earnings, and VIP rewards.
          </p>
          <p class="membership-intro-desc ms-anim" style="--d:.38s;margin-top:12px;">
            The more active you become, the more rewards you unlock.
            Reach higher levels and enjoy the full Prime experience.
          </p>
          <div class="ms-info-card ms-info-white ms-anim" style="--d:.46s">
            <h4 class="ms-info-title">🚀 LEVEL SKIP SYSTEM</h4>
            <p class="ms-info-text">You are <b>NOT</b> required to level up one by one. Prime Follower automatically assigns the <b>highest level</b> you qualify for.</p>
            <div class="ms-info-example">
              <span class="ms-info-ex-label">EXAMPLE 1</span>
              <p>A new user completes Prime Viral Bonus → <b>Immediately becomes Prime Shark</b>. No need to unlock Prime Lion first.</p>
            </div>
            <div class="ms-info-example">
              <span class="ms-info-ex-label">EXAMPLE 2</span>
              <p>A new user spends ₹2500 this month → <b>Immediately becomes Prime Member</b>. Highest level always wins.</p>
            </div>
          </div>
          <div class="ms-info-card ms-info-gold ms-anim" style="--d:.56s">
            <div class="ms-info-gold-shine"></div>
            <h4 class="ms-info-title" style="color:#1a1000;">⭐ MONTHLY LEVEL REVIEW</h4>
            <p class="ms-info-text" style="color:#3b2800;">At the start of every month, Prime Follower reviews your previous month's activity to keep membership fair.</p>
            <div class="ms-info-example" style="background:rgba(255,255,255,0.5);border-color:rgba(180,130,0,0.2);">
              <span class="ms-info-ex-label" style="color:#8b6914;">EXAMPLE 1</span>
              <p style="color:#3b2800;">Prime Member spent ₹1200 last month → <b>Remains Prime Member</b> ✅</p>
            </div>
            <div class="ms-info-example" style="background:rgba(255,255,255,0.5);border-color:rgba(180,130,0,0.2);">
              <span class="ms-info-ex-label" style="color:#8b6914;">EXAMPLE 2</span>
              <p style="color:#3b2800;">Prime Member spent ₹300 last month → <b>Demoted to Prime Shark</b> ⚠️</p>
            </div>
            <div class="ms-info-example" style="background:rgba(255,255,255,0.5);border-color:rgba(180,130,0,0.2);">
              <span class="ms-info-ex-label" style="color:#8b6914;">EXAMPLE 3</span>
              <p style="color:#3b2800;">Prime Shark earned only 50 credits → <b>Demoted to Prime Lion</b> ⚠️</p>
            </div>
            <p class="ms-info-text" style="color:#5a4000;font-size:12px;margin-top:10px;font-style:italic;">Level maintenance keeps membership fair and rewards active members.</p>
          </div>
          <div class="membership-swipe-hint ms-anim" style="--d:.68s">
            <span>SWIPE TO EXPLORE LEVELS</span>
            <i class="fas fa-chevron-right"></i>
            <i class="fas fa-chevron-right" style="opacity:0.4;"></i>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildLevelSlide(levelDef, currentLevel, profile) {
  const isCurrentLevel = levelDef.id === currentLevel;
  const isUnlocked = levelDef.id <= currentLevel;
  const slideThemeClass = `ms-slide-level-${levelDef.id}`;

  let statusBadge = "";
  if (isCurrentLevel) {
    statusBadge = `<span class="membership-status-badge current ms-anim" style="--d:.05s">YOUR LEVEL</span>`;
  } else if (isUnlocked) {
    statusBadge = `<span class="membership-status-badge unlocked ms-anim" style="--d:.05s">UNLOCKED</span>`;
  } else {
    statusBadge = `<span class="membership-status-badge locked ms-anim" style="--d:.05s">LOCKED</span>`;
  }

  // ★ VISUAL: two stacked, non-wrapping title lines — "PRIME" / rank word.
  // Long names can never break mid-word (e.g. "STAR / TER").
  const nameWords = levelDef.name.toUpperCase().split(" ");
  const namePrime = nameWords[0];
  const nameRank = nameWords.slice(1).join(" ") || nameWords[0];

  // ★ VISUAL: staggered achievement-style reveal per benefit row
  const benefitsHTML = levelDef.benefits.map((b, bi) => `
    <div class="membership-benefit-item ms-anim" style="--d:${(0.5 + bi * 0.05).toFixed(2)}s">
      <span class="membership-benefit-icon">${b.icon}</span>
      <span class="membership-benefit-text">${b.text}</span>
    </div>
  `).join("");

  return `
    <div class="membership-slide ${slideThemeClass}">
      <div class="ms-bg-particles" id="ms-particles-${levelDef.id}"></div>
      <div class="membership-slide-scroll">
        <div class="ms-scroll-light"></div>
        <div class="membership-level-content">
          ${statusBadge}
          <div class="membership-level-badge-wrap ms-badge-ring-${levelDef.id} ${isCurrentLevel ? 'active-glow' : ''} ms-anim" style="position:relative;--d:.12s">
            <span class="lv-badge-sheen"></span>
            <span class="lv-sparkle lv-s1">✦</span>
            <span class="lv-sparkle lv-s2">✧</span>
            <img src="${levelDef.badge}" alt="${levelDef.name}" class="membership-level-badge-img">
            <span class="membership-level-badge-num">${levelDef.id}</span>
            <div class="lv-badge-float" style="position:absolute; top:-26px; left:50%; transform:translateX(-50%);
                        width:56px; height:56px; z-index:10;
                        filter:drop-shadow(0 0 14px ${levelDef.badgeGlow}) drop-shadow(0 0 28px ${levelDef.badgeGlow});">
              <img src="${levelDef.levelBadge}" style="width:100%;height:100%;object-fit:contain;">
            </div>
          </div>
          <h2 class="membership-level-name ms-anim" style="--d:.22s">
            <span class="ms-name-line ms-name-prime">${namePrime}</span>
            <span class="ms-name-line ms-name-rank">${nameRank}</span>
          </h2>
          <p class="membership-level-journey ms-anim" style="--d:.3s">${levelDef.journey}</p>
          <div class="membership-req-box ms-glass-card ms-float-a ms-anim" style="--d:.38s">
            <span class="membership-req-label">REQUIREMENT</span>
            <p class="membership-req-text">${levelDef.requirement}</p>
          </div>
          <div class="membership-benefits-box ms-glass-card ms-float-b ms-anim" style="--d:.46s">
            <span class="membership-benefits-label">BENEFITS</span>
            ${benefitsHTML}
          </div>
          <div class="membership-req-box ms-glass-card ms-float-c ms-anim" style="margin-top:14px;--d:.6s">
            <span class="membership-req-label">⚠️ REQUIREMENT TO STAY</span>
            <p class="membership-req-text" style="font-weight:800; ${levelDef.retentionReq === 'NO REQUIREMENT!' ? 'color:#86efac;' : 'color:#fbbf24;'}">${levelDef.retentionReq}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── 7. Carousel Navigation ───────────────────────────────────────────────────

function buildMemberDots(count) {
  const dotsEl = document.getElementById("membership-dots");
  if (!dotsEl) return;
  dotsEl.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("button");
    dot.className = "membership-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => {
      goToMemberSlide(i);
      stopMemberAutoplay();
      restartMemberAutoplayDelayed();
    });
    dotsEl.appendChild(dot);
  }
}

function goToMemberSlide(index) {
  const track = document.getElementById("membership-track");
  const dots = document.querySelectorAll(".membership-dot");
  const slides = document.querySelectorAll(".membership-slide");
  if (!track || !slides.length) return;

  const totalSlides = 6;
  const prevIndex = memberSlideIndex;
  memberSlideIndex = ((index % totalSlides) + totalSlides) % totalSlides;

  slides.forEach((slide, i) => {
    slide.classList.remove("ms-active", "ms-prev", "ms-next");
    if (i === memberSlideIndex) slide.classList.add("ms-active");
    else if (i === prevIndex && prevIndex !== memberSlideIndex) slide.classList.add("ms-prev");
  });

  track.style.transform = `translateX(-${memberSlideIndex * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle("active", i === memberSlideIndex));
  spawnSlideParticles(memberSlideIndex);
}

function nextMemberSlide() { goToMemberSlide(memberSlideIndex + 1); }

function startMemberAutoplay() {
  stopMemberAutoplay();
  const delay = memberSlideIndex === 0 ? 3000 : 5000;
  memberAutoTimer = setTimeout(() => { nextMemberSlide(); startMemberAutoplay(); }, delay);
}

function stopMemberAutoplay() { clearTimeout(memberAutoTimer); memberAutoTimer = null; }
function restartMemberAutoplayDelayed() { setTimeout(startMemberAutoplay, 8000); }

function onMemberTouchStart(e) {
  memberTouchStartX = e.touches[0].clientX;
  memberIsSwiping = true;
  stopMemberAutoplay();
}

function onMemberTouchEnd(e) {
  if (!memberIsSwiping) return;
  memberIsSwiping = false;
  const delta = memberTouchStartX - e.changedTouches[0].clientX;
  if (Math.abs(delta) > 50) {
    if (delta > 0) goToMemberSlide(memberSlideIndex + 1);
    else goToMemberSlide(memberSlideIndex - 1);
  }
  restartMemberAutoplayDelayed();
}

const SLIDE_PARTICLE_COLORS = [
  ["rgba(255,215,0,0.4)", "rgba(255,182,193,0.3)"],
  ["rgba(34,197,94,0.5)", "rgba(16,185,129,0.4)"],
  ["rgba(255,215,0,0.5)", "rgba(245,158,11,0.4)"],
  ["rgba(59,130,246,0.5)", "rgba(96,165,250,0.4)"],
  ["rgba(37,99,235,0.5)", "rgba(79,70,229,0.4)"],
  ["rgba(168,85,247,0.4)", "rgba(255,215,0,0.35)"]
];

function spawnSlideParticles(slideIndex) {
  const container = document.getElementById(`ms-particles-${slideIndex}`);
  if (!container || container.dataset.spawned === "true") return;
  container.dataset.spawned = "true";
  container.innerHTML = "";
  const colors = SLIDE_PARTICLE_COLORS[slideIndex] || SLIDE_PARTICLE_COLORS[0];
  const count = slideIndex === 5 ? 20 : 14;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("span");
    dot.className = "ms-particle";
    dot.style.left = (10 + Math.random() * 80) + "%";
    dot.style.bottom = (-5 + Math.random() * 10) + "%";
    dot.style.background = colors[Math.floor(Math.random() * colors.length)];
    dot.style.width = (2 + Math.random() * 3) + "px";
    dot.style.height = dot.style.width;
    dot.style.animationDelay = (Math.random() * 5) + "s";
    dot.style.animationDuration = (4 + Math.random() * 6) + "s";
    container.appendChild(dot);
  }
}

// ── 8. Initialization ─────────────────────────────────────────────────────────

export async function initLevelSystem(uid) {
  try {
    let profile = await getUserProfile(uid);
    if (!profile) return;

    const migrationFields = {};
    if (profile.level === undefined) migrationFields.level = 1;
    if (profile.lifetime_spending === undefined) migrationFields.lifetime_spending = 0;
    if (profile.monthly_spending === undefined) migrationFields.monthly_spending = 0;
    if (profile.last_month_spending === undefined) migrationFields.last_month_spending = 0;
    if (profile.monthly_credits_earned === undefined) migrationFields.monthly_credits_earned = 0;
    if (profile.first_paid_order_completed === undefined) migrationFields.first_paid_order_completed = false;
    if (profile.monthly_free_followers_claimed === undefined) migrationFields.monthly_free_followers_claimed = false;
    if (profile.vip_badge_enabled === undefined) migrationFields.vip_badge_enabled = false;
    if (profile.level_updated_at === undefined) migrationFields.level_updated_at = serverTimestamp();
    if (profile.level_reviewed_at === undefined) migrationFields.level_reviewed_at = null;
    if (profile.current_ad_limit === undefined) migrationFields.current_ad_limit = 10;
    if (profile.current_ad_multiplier === undefined) migrationFields.current_ad_multiplier = 1;
    if (profile.current_checkin_multiplier === undefined) migrationFields.current_checkin_multiplier = 1;
    if (profile.current_delivery_hours === undefined) migrationFields.current_delivery_hours = 24;

    if (Object.keys(migrationFields).length > 0) {
      await updateDoc(doc(db, "users", uid), migrationFields);
      profile = { ...profile, ...migrationFields };
    }

    const reviewResult = await applyMonthlyReview(uid, profile);
    // Skip the auto-upgrade check right after a demotion — otherwise
    // evaluateAndUpdateLevel() re-reads the still-true lifetime flags
    // (primeViralBonusClaimed / first_paid_order_completed) and bumps
    // the user straight back up to the level they were just demoted from.
    const evalResult = reviewResult.demoted
      ? { levelChanged: false, oldLevel: reviewResult.newLevel, newLevel: reviewResult.newLevel, levelDef: getLevelDef(reviewResult.newLevel) }
      : await evaluateAndUpdateLevel(uid);
    profile = await getUserProfile(uid);

    renderLevelCard(profile);

    if (evalResult.levelChanged && evalResult.newLevel > evalResult.oldLevel) {
      showLevelUpNotification(evalResult.levelDef);

      // Award diamond when reaching Level 3 (Shark) — server-controlled
      if (evalResult.newLevel >= 3 && evalResult.oldLevel < 3) {
        try {
          const resp = await fetch('https://myserver-production-d47c.up.railway.app/diamond-shark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: uid })
          });
          const r = await resp.json();
          if (r.success && !r.already) {
            setTimeout(() => {
              window.showToast?.("💎 Shark Level Diamond Awarded!", "success");
              const diamondEl = document.getElementById("diamond-count");
              if (diamondEl && r.diamonds !== undefined) diamondEl.textContent = r.diamonds;
            }, 2000);
          }
        } catch (e) { console.warn("Shark diamond award failed:", e); }
      }
    }

    if (reviewResult.demoted) {
      const newDef = getLevelDef(reviewResult.newLevel);
      showDemotionNotification(newDef);
    }

  } catch (err) {
    console.error("[Level] Init error:", err);
  }
}

function showLevelUpNotification(levelDef) {
  document.querySelectorAll(".level-up-overlay").forEach(el => el.remove());
  const overlay = document.createElement("div");
  overlay.className = "level-up-overlay";
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;z-index:99999;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);`;
  overlay.innerHTML = `
    <div class="level-up-card">
      <div class="lvup-rays"></div>
      <div class="level-up-sparkles">
        <span class="lvup-star" style="--sx:12%;--sy:18%;--sd:0s">✦</span>
        <span class="lvup-star" style="--sx:82%;--sy:12%;--sd:.6s">✧</span>
        <span class="lvup-star" style="--sx:20%;--sy:78%;--sd:1.1s">✦</span>
        <span class="lvup-star" style="--sx:88%;--sy:70%;--sd:1.6s">✧</span>
        <span class="lvup-star" style="--sx:50%;--sy:8%;--sd:2.1s">✦</span>
        <span class="lvup-star" style="--sx:65%;--sy:88%;--sd:2.6s">✧</span>
        <span class="lvup-star" style="--sx:40%;--sy:60%;--sd:3.1s">💎</span>
      </div>
      <div class="lvup-converge">
        <span class="lvup-orb" style="--ox:-120px;--oy:-70px;--od:.1s"></span>
        <span class="lvup-orb" style="--ox:130px;--oy:-50px;--od:.25s"></span>
        <span class="lvup-orb" style="--ox:-100px;--oy:90px;--od:.4s"></span>
        <span class="lvup-orb" style="--ox:110px;--oy:80px;--od:.55s"></span>
        <span class="lvup-orb" style="--ox:0px;--oy:-130px;--od:.7s"></span>
      </div>
      <div class="lvup-sheen"></div>
      <div style="font-size:50px;margin-bottom:10px;" class="lvup-emoji">🎉</div>
      <h2 class="level-up-title">LEVEL UP!</h2>
      <div class="level-up-badge-ring">
        <span class="lvup-burst"></span>
        <span class="lv-badge-sheen"></span>
        <img src="${levelDef.badge}" alt="${levelDef.name}" class="level-up-badge-img">
      </div>
      <h3 class="level-up-name">${levelDef.name.toUpperCase()}</h3>
      <p class="level-up-journey">${levelDef.journey}</p>
      <button class="level-up-close-btn" id="level-up-close">AWESOME!</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));
  document.getElementById("level-up-close").addEventListener("click", () => {
    overlay.classList.remove("visible");
    setTimeout(() => overlay.remove(), 350);
  });
}

function showDemotionNotification(newLevelDef) {
  window.showToast?.(`Level adjusted to ${newLevelDef.name}. Stay active to maintain your rank!`, "info");
}

// ── 9. Visual-Only Motion Helper ──────────────────────────────────────────────
// Pauses all CSS animations while the tab is hidden (battery / performance).
// Purely cosmetic — no app logic, state, or user flow is affected.
document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle("motion-paused", document.hidden);
});

export { LEVELS };

console.log("✅ Level & Membership module loaded.");