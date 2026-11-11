// Autonomous Restrictor - Background Service Worker
// ARE (Autonomous Restrictor Engine) v2.1 - Cozy 3-Day Anti-Escapism Protocol

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 72 Hours Mandatory Lock
const CATALOG_VERSION = 2;

// Comprehensive Anti-Escapism Catalog: All Social Media, Messaging, Video, Forums & Streaming
const SOCIAL_CONSUMPTION_CATALOG = [
  // --- Social Networks & Infinite Feeds ---
  { id: "rule_instagram", name: "Instagram", pattern: "instagram.com", category: "social", customMessage: "Step back from the feed. Protect your peace and attention." },
  { id: "rule_facebook", name: "Facebook", pattern: "facebook.com", category: "social", customMessage: "No endless feed scrolling. Reclaim your quiet time." },
  { id: "rule_fb", name: "Facebook Shortlink", pattern: "fb.com", category: "social", customMessage: "Social detour intercepted. Stay grounded." },
  { id: "rule_threads_net", name: "Threads", pattern: "threads.net", category: "social", customMessage: "Don't hop to another feed. Let your mind rest." },
  { id: "rule_threads_com", name: "Threads (Alt)", pattern: "threads.com", category: "social", customMessage: "Don't hop to another feed. Let your mind rest." },
  { id: "rule_x", name: "X (Twitter)", pattern: "x.com", category: "social", customMessage: "Step away from the noise and timeline outrage." },
  { id: "rule_twitter", name: "Twitter (Legacy)", pattern: "twitter.com", category: "social", customMessage: "Step away from the noise and timeline outrage." },
  { id: "rule_bluesky", name: "Bluesky", pattern: "bsky.app", category: "social", customMessage: "Another microblogging feed won't give you peace. Rest." },
  { id: "rule_mastodon", name: "Mastodon", pattern: "mastodon.social", category: "social", customMessage: "Social timeline paused under your 3-day pledge." },
  { id: "rule_linkedin", name: "LinkedIn", pattern: "linkedin.com", category: "social", customMessage: "Even 'productive' feeds are still dopamine traps after hours." },
  { id: "rule_tumblr", name: "Tumblr", pattern: "tumblr.com", category: "social", customMessage: "Infinite scroll barrier active. Protect your focus." },

  // --- Visual, Pins & Short-Form Video ---
  { id: "rule_pinterest", name: "Pinterest (All Regions)", pattern: "pinterest.*", category: "video", customMessage: "Visual rabbit holes paused. Save your energy for real creation." },
  { id: "rule_pinit", name: "Pinterest Shortlink", pattern: "pin.it", category: "video", customMessage: "Pinterest redirect intercepted under your 3-day lock." },
  { id: "rule_tiktok", name: "TikTok", pattern: "tiktok.com", category: "video", customMessage: "Short-form dopamine loop blocked. Guard your attention span." },
  { id: "rule_snapchat", name: "Snapchat Web", pattern: "snapchat.com", category: "video", customMessage: "Snaps and streaks can wait. Stay present." },
  { id: "rule_youtube", name: "YouTube & Shorts", pattern: "youtube.com", category: "video", customMessage: "Avoid the autoplay rabbit hole. Rest your eyes." },
  { id: "rule_youtu_be", name: "YouTube Shortlink", pattern: "youtu.be", category: "video", customMessage: "Video link paused under your focus commitment." },
  { id: "rule_vimeo", name: "Vimeo", pattern: "vimeo.com", category: "video", customMessage: "Video consumption barrier active." },
  { id: "rule_dailymotion", name: "Dailymotion", pattern: "dailymotion.com", category: "video", customMessage: "Video consumption barrier active." },

  // --- Messaging & Community Escapism ---
  { id: "rule_whatsapp", name: "WhatsApp Web", pattern: "web.whatsapp.com", category: "messaging", customMessage: "Curfew Active. Disconnect from chats, rest your mind, and recharge." },
  { id: "rule_wa_me", name: "WhatsApp Direct", pattern: "wa.me", category: "messaging", customMessage: "Direct chat link paused under your commitment." },
  { id: "rule_telegram", name: "Telegram Web", pattern: "telegram.org", category: "messaging", customMessage: "Channels and chats paused. Protect your quiet hours." },
  { id: "rule_tme", name: "Telegram Links", pattern: "t.me", category: "messaging", customMessage: "Telegram redirect intercepted." },
  { id: "rule_messenger", name: "Messenger", pattern: "messenger.com", category: "messaging", customMessage: "Messaging barrier active. Unplug for real rest." },
  { id: "rule_discord", name: "Discord Web", pattern: "discord.com", category: "messaging", customMessage: "Servers and chats paused. Protect your deep focus." },
  { id: "rule_discord_gg", name: "Discord Invites", pattern: "discord.gg", category: "messaging", customMessage: "Discord invite link paused under your 3-day pledge." },

  // --- Forums, Q&A & Meme Aggregators ---
  { id: "rule_reddit", name: "Reddit", pattern: "reddit.com", category: "forums", customMessage: "Threads and rabbit holes paused. Step away from the screen." },
  { id: "rule_redd_it", name: "Reddit Shortlink", pattern: "redd.it", category: "forums", customMessage: "Reddit link intercepted under your commitment." },
  { id: "rule_quora", name: "Quora", pattern: "quora.com", category: "forums", customMessage: "Q&A doom-scrolling paused. Save your focus." },
  { id: "rule_9gag", name: "9GAG", pattern: "9gag.com", category: "forums", customMessage: "Meme feed paused. Protect your dopamine balance." },
  { id: "rule_imgur", name: "Imgur", pattern: "imgur.com", category: "forums", customMessage: "Image scroll barrier active." },
  { id: "rule_4chan", name: "4chan", pattern: "4chan.org", category: "forums", customMessage: "Imageboard barrier active. Guard your peace." },
  { id: "rule_ifunny", name: "iFunny", pattern: "ifunny.co", category: "forums", customMessage: "Meme consumption paused." },

  // --- Streaming, Live Video & Binge ---
  { id: "rule_twitch", name: "Twitch", pattern: "twitch.tv", category: "streaming", customMessage: "Livestreams paused. Live your own life instead." },
  { id: "rule_kick", name: "Kick", pattern: "kick.com", category: "streaming", customMessage: "Livestreams paused under your 3-day pledge." },
  { id: "rule_netflix", name: "Netflix", pattern: "netflix.com", category: "streaming", customMessage: "Binge barrier active. Choose rest over 'next episode'." },
  { id: "rule_primevideo", name: "Prime Video", pattern: "primevideo.com", category: "streaming", customMessage: "Streaming barrier active. Protect your sleep." },
  { id: "rule_hotstar", name: "Disney+ Hotstar", pattern: "hotstar.com", category: "streaming", customMessage: "Streaming barrier active. Step away and unwind." },
  { id: "rule_disneyplus", name: "Disney+", pattern: "disneyplus.com", category: "streaming", customMessage: "Streaming barrier active." },
  { id: "rule_jiocinema", name: "JioCinema", pattern: "jiocinema.com", category: "streaming", customMessage: "Streaming barrier active." },
  { id: "rule_sonyliv", name: "SonyLIV", pattern: "sonyliv.com", category: "streaming", customMessage: "Streaming barrier active." },
  { id: "rule_crunchyroll", name: "Crunchyroll", pattern: "crunchyroll.com", category: "streaming", customMessage: "Anime marathon paused. Honor your commitment." },

  // --- Dating & Swipe Apps ---
  { id: "rule_tinder", name: "Tinder Web", pattern: "tinder.com", category: "dating", customMessage: "Swiping paused. Protect your focus and energy." },
  { id: "rule_bumble", name: "Bumble Web", pattern: "bumble.com", category: "dating", customMessage: "Swiping paused under your 3-day pledge." },
  { id: "rule_hinge", name: "Hinge", pattern: "hinge.co", category: "dating", customMessage: "Dating app barrier active." }
];

function buildCatalogRules(options = {}) {
  const now = Date.now();
  const mode = options.mode || "schedule";
  const startTime = options.startTime || "21:00";
  const endTime = options.endTime || "07:00";

  return SOCIAL_CONSUMPTION_CATALOG.map(item => ({
    id: item.id,
    name: item.name,
    pattern: item.pattern,
    category: item.category,
    enabled: true,
    mode,
    startTime,
    endTime,
    days: [0, 1, 2, 3, 4, 5, 6],
    customMessage: item.customMessage,
    createdAt: now,
    lockedUntil: now + THREE_DAYS_MS,
    renewalCount: 0,
    graceExpiresAt: null
  }));
}

function getDefaultState() {
  return {
    catalogVersion: CATALOG_VERSION,
    rules: buildCatalogRules({ mode: "schedule", startTime: "21:00", endTime: "07:00" }),
    globalCurfew: {
      enabled: true,
      startTime: "21:00",
      endTime: "07:00"
    },
    focusLock: {
      active: false,
      durationMinutes: 0,
      startedAt: 0,
      expiresAt: 0
    },
    strictMode: true,
    reflectionLogs: [],
    stats: {
      totalBlocked: 0,
      todayBlocked: 0,
      commitmentsHonored: 0,
      lastResetDate: new Date().toISOString().split('T')[0]
    }
  };
}

// Initialize Storage Defaults & Upgrade Migration
async function initializeAndMigrateStorage() {
  const data = await chrome.storage.local.get(null);
  const now = Date.now();

  if (!data.rules) {
    await chrome.storage.local.set(getDefaultState());
  } else {
    let modified = false;
    let rules = (data.rules || []).map(r => {
      const createdAt = r.createdAt || now;
      const lockedUntil = r.lockedUntil || (createdAt + THREE_DAYS_MS);
      if (!r.createdAt || !r.lockedUntil) modified = true;

      // Upgrade explicit 'pinterest.com' to multi-TLD 'pinterest.*' so regional Pinterest can't bypass
      let pattern = r.pattern;
      if (pattern && pattern.toLowerCase().replace(/^www\./, '').trim() === 'pinterest.com') {
        pattern = 'pinterest.*';
        modified = true;
      }

      // Backfill category from catalog if missing
      let category = r.category;
      if (!category) {
        const clean = (pattern || "").toLowerCase().replace(/^www\./, '').trim();
        const match = SOCIAL_CONSUMPTION_CATALOG.find(c => c.pattern === clean);
        category = match ? match.category : "custom";
        modified = true;
      }

      return {
        ...r,
        pattern,
        category,
        createdAt,
        lockedUntil,
        renewalCount: r.renewalCount || 0,
        graceExpiresAt: r.graceExpiresAt || null
      };
    });

    // Upgrade to Catalog v2: Merge all missing anti-escapism social & consumption links
    const currentCatalogVersion = data.catalogVersion || 1;
    if (currentCatalogVersion < CATALOG_VERSION) {
      // Match the user's dominant existing mode (if they locked everything to 'always', use 'always'; else 'schedule')
      const alwaysCount = rules.filter(r => r.mode === 'always').length;
      const scheduleRule = rules.find(r => r.mode === 'schedule');
      const dominantMode = (rules.length > 0 && alwaysCount === rules.length) ? 'always' : 'schedule';
      const defaultStart = (scheduleRule && scheduleRule.startTime) || (data.globalCurfew && data.globalCurfew.startTime) || "21:00";
      const defaultEnd = (scheduleRule && scheduleRule.endTime) || (data.globalCurfew && data.globalCurfew.endTime) || "07:00";

      const existingPatterns = new Set(
        rules.map(r => (r.pattern || "").toLowerCase().replace(/^www\./, '').trim())
      );

      for (const item of SOCIAL_CONSUMPTION_CATALOG) {
        if (!existingPatterns.has(item.pattern)) {
          rules.push({
            id: item.id,
            name: item.name,
            pattern: item.pattern,
            category: item.category,
            enabled: true,
            mode: dominantMode,
            startTime: defaultStart,
            endTime: defaultEnd,
            days: [0, 1, 2, 3, 4, 5, 6],
            customMessage: item.customMessage,
            createdAt: now,
            lockedUntil: now + THREE_DAYS_MS,
            renewalCount: 0,
            graceExpiresAt: null
          });
          existingPatterns.add(item.pattern);
        }
      }
      modified = true;
    }

    const reflectionLogs = data.reflectionLogs || [];
    if (!data.reflectionLogs) modified = true;

    if (modified || currentCatalogVersion < CATALOG_VERSION) {
      await chrome.storage.local.set({
        rules,
        reflectionLogs,
        catalogVersion: CATALOG_VERSION
      });
    }
  }

  chrome.alarms.create("autonomousCheck", { periodInMinutes: 1 });
  await sweepOpenTabs();
  console.log("ARE Cozy 3-Day Anti-Escapism Engine active with full social shield.");
}

chrome.runtime.onInstalled.addListener(() => {
  initializeAndMigrateStorage();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("autonomousCheck", { periodInMinutes: 1 });
  sweepOpenTabs();
});

// Time utilities
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function normalizeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return {
      hostname: parsed.hostname.toLowerCase().replace(/^www\./, ''),
      pathname: parsed.pathname.toLowerCase()
    };
  } catch (e) {
    return {
      hostname: rawUrl.toLowerCase().replace(/^www\./, ''),
      pathname: ""
    };
  }
}

function doesPatternMatch(hostname, pathname, rawPattern) {
  const pattern = (rawPattern || "").toLowerCase().replace(/^www\./, '').trim();
  if (!pattern) return false;

  // Support trailing '.*' wildcard for multi-TLD platforms (e.g., pinterest.* -> pinterest.com, in.pinterest.com, pinterest.co.uk)
  if (pattern.endsWith('.*')) {
    const base = pattern.slice(0, -2);
    if (!base) return false;
    return hostname === base || hostname.startsWith(base + '.') || hostname.includes('.' + base + '.');
  }

  if (pattern.includes('/')) {
    const fullPath = hostname + pathname;
    return fullPath === pattern || fullPath.startsWith(pattern);
  }

  return hostname === pattern || hostname.endsWith('.' + pattern);
}

// Core Matching Engine
async function evaluateUrlAgainstRestrictions(targetUrl) {
  if (!targetUrl || targetUrl.startsWith('chrome://') || targetUrl.startsWith('chrome-extension://') || targetUrl.startsWith('about:') || targetUrl.startsWith('edge://')) {
    return { shouldBlock: false };
  }

  const { hostname, pathname } = normalizeUrl(targetUrl);
  const state = await chrome.storage.local.get(null);
  const rules = state.rules || [];
  const focusLock = state.focusLock || {};
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nowMs = Date.now();

  const isFocusLockActive = focusLock.active && nowMs < focusLock.expiresAt;

  for (const rule of rules) {
    if (!rule.enabled) continue;

    if (doesPatternMatch(hostname, pathname, rule.pattern)) {
      // Check if user currently has an active 1-hour grace pass for this rule
      if (rule.graceExpiresAt && nowMs < rule.graceExpiresAt) {
        return { shouldBlock: false };
      }

      // Check if the 3-day restriction period has elapsed -> trigger milestone review
      const isReviewDue = rule.lockedUntil && nowMs >= rule.lockedUntil;
      if (isReviewDue) {
        return {
          shouldBlock: true,
          rule,
          isReviewDue: true,
          reason: "3-Day Restriction Complete • Decision Required",
          remainingMs: 0,
          lockedUntil: rule.lockedUntil,
          message: "You have completed 3 days under this restriction. Do you wish to continue?"
        };
      }

      const commitmentRemainingMs = Math.max(0, (rule.lockedUntil || 0) - nowMs);

      // Focus Lock override
      if (isFocusLockActive) {
        return {
          shouldBlock: true,
          rule,
          isReviewDue: false,
          reason: "Focus Sanctuary Active",
          remainingMs: focusLock.expiresAt - nowMs,
          lockedUntil: rule.lockedUntil,
          commitmentRemainingMs,
          message: rule.customMessage || "Deep focus session in progress."
        };
      }

      // Mode: Always
      if (rule.mode === 'always') {
        return {
          shouldBlock: true,
          rule,
          isReviewDue: false,
          reason: "24/7 Continuous Rest Barrier",
          remainingMs: commitmentRemainingMs,
          lockedUntil: rule.lockedUntil,
          commitmentRemainingMs,
          message: rule.customMessage
        };
      }

      // Mode: Countdown / Timer
      if (rule.mode === 'countdown') {
        if (rule.expiresAt && nowMs < rule.expiresAt) {
          return {
            shouldBlock: true,
            rule,
            isReviewDue: false,
            reason: "Timer Sprint Barrier Active",
            remainingMs: rule.expiresAt - nowMs,
            lockedUntil: rule.lockedUntil,
            commitmentRemainingMs,
            message: rule.customMessage
          };
        }
      }

      // Mode: Schedule (Curfew / Timed window)
      if (rule.mode === 'schedule') {
        const days = rule.days || [0, 1, 2, 3, 4, 5, 6];
        const start = timeToMinutes(rule.startTime);
        const end = timeToMinutes(rule.endTime);
        let inCurfew = false;

        if (start > end) {
          // Overnight span (e.g. 21:00 to 07:00)
          if (currentMinutes >= start) {
            inCurfew = days.includes(currentDay);
          } else if (currentMinutes < end) {
            const prevDay = (currentDay + 6) % 7;
            inCurfew = days.includes(prevDay);
          }
        } else {
          // Same day window (e.g. 09:00 to 18:00)
          inCurfew = days.includes(currentDay) && currentMinutes >= start && currentMinutes < end;
        }

        if (inCurfew) {
          return {
            shouldBlock: true,
            rule,
            isReviewDue: false,
            reason: `Curfew Active (${rule.startTime} - ${rule.endTime})`,
            remainingMs: commitmentRemainingMs,
            lockedUntil: rule.lockedUntil,
            commitmentRemainingMs,
            message: rule.customMessage
          };
        }
      }
    }
  }

  return { shouldBlock: false };
}

// Debounce map to prevent double-counting stats when multiple navigation listeners trigger
const recentTabBlocks = new Map();

// Redirect tab to blocked page with rich contextual metadata
async function enforceBlockOnTab(tabId, targetUrl, evaluation) {
  const now = Date.now();
  const lastBlock = recentTabBlocks.get(tabId) || 0;
  const shouldCountStat = (now - lastBlock) > 2000;
  recentTabBlocks.set(tabId, now);

  if (shouldCountStat) {
    const state = await chrome.storage.local.get("stats");
    const stats = state.stats || { totalBlocked: 0, todayBlocked: 0, commitmentsHonored: 0, lastResetDate: "" };
    const today = new Date().toISOString().split('T')[0];

    if (stats.lastResetDate !== today) {
      stats.todayBlocked = 0;
      stats.lastResetDate = today;
    }
    stats.totalBlocked += 1;
    stats.todayBlocked += 1;
    await chrome.storage.local.set({ stats });
  }

  const isReview = evaluation.isReviewDue ? "1" : "0";
  const ruleId = evaluation.rule ? evaluation.rule.id : "";
  const lockedUntil = evaluation.lockedUntil || 0;
  const commitmentRemainingMs = evaluation.commitmentRemainingMs || 0;

  const blockedPageUrl = chrome.runtime.getURL(
    `blocked/blocked.html?url=${encodeURIComponent(targetUrl)}` +
    `&reason=${encodeURIComponent(evaluation.reason || "Autonomous Restriction")}` +
    `&message=${encodeURIComponent(evaluation.message || "")}` +
    `&remaining=${encodeURIComponent(evaluation.remainingMs || 0)}` +
    `&review=${isReview}` +
    `&ruleId=${encodeURIComponent(ruleId)}` +
    `&lockedUntil=${lockedUntil}` +
    `&commitmentRemaining=${commitmentRemainingMs}`
  );

  try {
    await chrome.tabs.update(tabId, { url: blockedPageUrl });
  } catch (e) {
    // Tab may have been closed concurrently
  }
}

async function sweepOpenTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url) {
        const evaluation = await evaluateUrlAgainstRestrictions(tab.url);
        if (evaluation.shouldBlock) {
          await enforceBlockOnTab(tab.id, tab.url, evaluation);
        }
      }
    }
  } catch (e) {
    console.warn("ARE sweep error:", e);
  }
}

// Layer 1: Pre-Navigation Interceptor
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const evaluation = await evaluateUrlAgainstRestrictions(details.url);
  if (evaluation.shouldBlock) {
    await enforceBlockOnTab(details.tabId, details.url, evaluation);
  }
});

// Layer 2: SPA / Redirect Tab URL Watcher
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.url) {
    const evaluation = await evaluateUrlAgainstRestrictions(changeInfo.url);
    if (evaluation.shouldBlock) {
      await enforceBlockOnTab(tabId, changeInfo.url, evaluation);
    }
  }
});

// Layer 3: Autonomous Periodic Watcher (Checks currently open tabs every minute)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "autonomousCheck") {
    await sweepOpenTabs();
  }
});

// Clean up debounce entries when tabs close
chrome.tabs.onRemoved.addListener((tabId) => {
  recentTabBlocks.delete(tabId);
});

// Helper to format remaining duration for error messages
function formatRemainingTime(ms) {
  if (ms <= 0) return "0 minutes";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days > 0) return `${days} day(s) and ${remHours} hour(s)`;
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} hour(s) and ${mins} minute(s)`;
}

// Message Listener for Popup, Options, and Blocked Interceptor
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request.action === "GET_STATE") {
        const state = await chrome.storage.local.get(null);
        sendResponse({ status: "success", state, catalogCount: SOCIAL_CONSUMPTION_CATALOG.length });
      }

      else if (request.action === "GET_CATALOG") {
        sendResponse({ status: "success", catalog: SOCIAL_CONSUMPTION_CATALOG });
      }

      else if (request.action === "ADD_RULE") {
        const state = await chrome.storage.local.get("rules");
        let rules = state.rules || [];
        const cleanPattern = request.rule.pattern.toLowerCase().replace(/^www\./, '').trim();
        const existingIndex = rules.findIndex(r => r.pattern.toLowerCase().replace(/^www\./, '').trim() === cleanPattern);

        const now = Date.now();
        const newRule = {
          category: "custom",
          ...request.rule,
          pattern: cleanPattern,
          createdAt: now,
          lockedUntil: now + THREE_DAYS_MS,
          renewalCount: 0,
          graceExpiresAt: null,
          enabled: true
        };

        if (existingIndex !== -1) {
          const existing = rules[existingIndex];
          rules[existingIndex] = {
            ...existing,
            ...newRule,
            id: existing.id,
            lockedUntil: Math.max(existing.lockedUntil || 0, now + THREE_DAYS_MS)
          };
        } else {
          rules.push(newRule);
        }
        await chrome.storage.local.set({ rules });
        await sweepOpenTabs();
        sendResponse({ status: "success", rule: newRule, rules });
      }

      else if (request.action === "ADD_RULES_BATCH") {
        const state = await chrome.storage.local.get("rules");
        let rules = state.rules || [];
        const now = Date.now();
        const incoming = Array.isArray(request.rules) ? request.rules : [];

        for (const reqRule of incoming) {
          const cleanPattern = (reqRule.pattern || "").toLowerCase().replace(/^www\./, '').trim();
          if (!cleanPattern) continue;

          const existingIndex = rules.findIndex(r => r.pattern.toLowerCase().replace(/^www\./, '').trim() === cleanPattern);
          if (existingIndex !== -1) {
            const existing = rules[existingIndex];
            rules[existingIndex] = {
              ...existing,
              ...reqRule,
              id: existing.id,
              pattern: cleanPattern,
              createdAt: existing.createdAt || now,
              lockedUntil: Math.max(existing.lockedUntil || 0, now + THREE_DAYS_MS),
              enabled: true
            };
          } else {
            rules.push({
              category: "custom",
              ...reqRule,
              pattern: cleanPattern,
              createdAt: now,
              lockedUntil: now + THREE_DAYS_MS,
              renewalCount: 0,
              graceExpiresAt: null,
              enabled: true
            });
          }
        }
        await chrome.storage.local.set({ rules, catalogVersion: CATALOG_VERSION });
        await sweepOpenTabs();
        sendResponse({ status: "success", rules });
      }

      else if (request.action === "ARM_FULL_SOCIAL_SHIELD") {
        // Arms all 45 social, video, messaging, forum, streaming, and dating sites atomically
        const mode = request.mode === "always" ? "always" : "schedule";
        const startTime = request.startTime || "21:00";
        const endTime = request.endTime || "07:00";
        const days = Array.isArray(request.days) ? request.days : [0, 1, 2, 3, 4, 5, 6];

        const state = await chrome.storage.local.get("rules");
        let rules = state.rules || [];
        const now = Date.now();

        for (const item of SOCIAL_CONSUMPTION_CATALOG) {
          const existingIndex = rules.findIndex(r => (r.pattern || "").toLowerCase().replace(/^www\./, '').trim() === item.pattern);
          if (existingIndex !== -1) {
            const existing = rules[existingIndex];
            // Never weaken an existing 'always' rule down to 'schedule' during an active 3-day lock
            const isLocked = existing.lockedUntil && now < existing.lockedUntil;
            const nextMode = (isLocked && existing.mode === 'always' && mode !== 'always') ? 'always' : mode;
            rules[existingIndex] = {
              ...existing,
              category: item.category,
              enabled: true,
              mode: nextMode,
              startTime,
              endTime,
              days,
              lockedUntil: Math.max(existing.lockedUntil || 0, now + THREE_DAYS_MS)
            };
          } else {
            rules.push({
              id: item.id,
              name: item.name,
              pattern: item.pattern,
              category: item.category,
              enabled: true,
              mode,
              startTime,
              endTime,
              days,
              customMessage: item.customMessage,
              createdAt: now,
              lockedUntil: now + THREE_DAYS_MS,
              renewalCount: 0,
              graceExpiresAt: null
            });
          }
        }

        await chrome.storage.local.set({ rules, catalogVersion: CATALOG_VERSION });
        await sweepOpenTabs();
        sendResponse({ status: "success", rules, count: rules.length });
      }

      else if (request.action === "UPDATE_RULE") {
        const state = await chrome.storage.local.get(["rules", "strictMode", "focusLock"]);
        const rules = state.rules || [];
        const existing = rules.find(r => r.id === request.rule.id);

        if (!existing) {
          sendResponse({ status: "error", message: "Rule not found." });
          return;
        }

        const now = Date.now();
        const isLocked = existing.lockedUntil && now < existing.lockedUntil;

        // Anti-Tamper 3-Day Lock Rule: User CANNOT disable or weaken during the 3-day commitment period
        if (isLocked) {
          const timeLeft = formatRemainingTime(existing.lockedUntil - now);
          if (existing.enabled && !request.rule.enabled) {
            sendResponse({
              status: "error",
              message: `🔒 3-Day Commitment Active! This rule cannot be toggled off for another ${timeLeft}. Honor your pledge.`
            });
            return;
          }
          if (existing.mode === 'always' && request.rule.mode !== 'always') {
            sendResponse({
              status: "error",
              message: `🔒 3-Day Commitment Active! A 24/7 rule cannot be downgraded for another ${timeLeft}.`
            });
            return;
          }
        }

        // Strict Mode Focus Lock Guard
        if (state.strictMode && state.focusLock && state.focusLock.active && now < state.focusLock.expiresAt && !request.rule.enabled) {
          sendResponse({
            status: "error",
            message: "Strict Mode Active: Cannot modify or disable rules during an active Focus Sprint!"
          });
          return;
        }

        const updatedRules = rules.map(r => {
          if (r.id === request.rule.id) {
            return {
              ...r,
              ...request.rule,
              createdAt: r.createdAt,
              lockedUntil: r.lockedUntil,
              renewalCount: r.renewalCount
            };
          }
          return r;
        });

        await chrome.storage.local.set({ rules: updatedRules });
        sendResponse({ status: "success", rules: updatedRules });
      }

      else if (request.action === "DELETE_RULE") {
        const state = await chrome.storage.local.get("rules");
        const rules = state.rules || [];
        const ruleToDelete = rules.find(r => r.id === request.ruleId);

        if (!ruleToDelete) {
          sendResponse({ status: "error", message: "Rule not found." });
          return;
        }

        const now = Date.now();
        if (ruleToDelete.lockedUntil && now < ruleToDelete.lockedUntil) {
          const timeLeft = formatRemainingTime(ruleToDelete.lockedUntil - now);
          sendResponse({
            status: "error",
            message: `🚫 Access Denied: 3-Day Commitment Pledge is active! You cannot remove this restriction for another ${timeLeft}.`
          });
          return;
        }

        const updatedRules = rules.filter(r => r.id !== request.ruleId);
        await chrome.storage.local.set({ rules: updatedRules });
        sendResponse({ status: "success", rules: updatedRules });
      }

      else if (request.action === "RENEW_RULE_3DAYS") {
        const state = await chrome.storage.local.get(["rules", "stats"]);
        let rules = state.rules || [];
        const stats = state.stats || { commitmentsHonored: 0 };

        const target = rules.find(r => r.id === request.ruleId);
        if (!target) {
          sendResponse({ status: "error", message: "Rule not found." });
          return;
        }

        const now = Date.now();
        target.lockedUntil = now + THREE_DAYS_MS;
        target.renewalCount = (target.renewalCount || 0) + 1;
        target.graceExpiresAt = null;
        target.enabled = true;

        stats.commitmentsHonored = (stats.commitmentsHonored || 0) + 1;

        await chrome.storage.local.set({ rules, stats });
        sendResponse({
          status: "success",
          message: `Restriction renewed for another 3 days! New unlock: ${new Date(target.lockedUntil).toLocaleString()}`,
          rule: target
        });
      }

      else if (request.action === "SUBMIT_REFLECTION_AUDIT") {
        const state = await chrome.storage.local.get(["rules", "reflectionLogs", "stats"]);
        let rules = state.rules || [];
        let reflectionLogs = state.reflectionLogs || [];
        let stats = state.stats || {};

        const target = rules.find(r => r.id === request.ruleId);
        const auditEntry = {
          id: "audit_" + Date.now(),
          ruleId: request.ruleId,
          domain: target ? target.pattern : "unknown",
          timestamp: new Date().toISOString(),
          answers: request.answers || {},
          finalAction: request.finalAction
        };

        reflectionLogs.unshift(auditEntry);
        if (reflectionLogs.length > 100) reflectionLogs = reflectionLogs.slice(0, 100);

        if (request.finalAction === 'remove') {
          rules = rules.filter(r => r.id !== request.ruleId);
        } else if (request.finalAction === 'grace_1h' && target) {
          const now = Date.now();
          target.graceExpiresAt = now + 60 * 60 * 1000;
          target.lockedUntil = now + (3 * 24 + 1) * 60 * 60 * 1000;
        } else if (request.finalAction === 'relock_3d' && target) {
          const now = Date.now();
          target.lockedUntil = now + THREE_DAYS_MS;
          target.renewalCount = (target.renewalCount || 0) + 1;
          target.graceExpiresAt = null;
        }

        await chrome.storage.local.set({ rules, reflectionLogs, stats });
        sendResponse({ status: "success", finalAction: request.finalAction, auditEntry });
      }

      else if (request.action === "START_FOCUS_LOCK") {
        const duration = Number(request.durationMinutes) || 30;
        const startedAt = Date.now();
        const expiresAt = startedAt + duration * 60 * 1000;
        const focusLock = { active: true, durationMinutes: duration, startedAt, expiresAt };
        await chrome.storage.local.set({ focusLock });
        await sweepOpenTabs();
        sendResponse({ status: "success", focusLock });
      }

      else if (request.action === "STOP_FOCUS_LOCK") {
        const state = await chrome.storage.local.get(["focusLock", "strictMode"]);
        if (state.strictMode && state.focusLock && state.focusLock.active && Date.now() < state.focusLock.expiresAt) {
          sendResponse({ status: "error", message: "Strict Mode Active: Focus sprint cannot be cancelled early!" });
          return;
        }
        const focusLock = { active: false, durationMinutes: 0, startedAt: 0, expiresAt: 0 };
        await chrome.storage.local.set({ focusLock });
        sendResponse({ status: "success", focusLock });
      }

      else if (request.action === "CLEAR_REFLECTION_LOGS") {
        await chrome.storage.local.set({ reflectionLogs: [] });
        sendResponse({ status: "success" });
      }
    } catch (err) {
      console.error("ARE Background Error:", err);
      sendResponse({ status: "error", message: err.message });
    }
  })();
  return true;
});
