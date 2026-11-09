// Autonomous Restrictor - Background Service Worker
// ARE (Autonomous Restrictor Engine) v2.0 - Cozy 3-Day Commitment Protocol

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 72 Hours Mandatory Lock

const DEFAULT_STATE = {
  rules: [
    {
      id: "rule_whatsapp",
      name: "WhatsApp Web",
      pattern: "web.whatsapp.com",
      enabled: true,
      mode: "schedule", // 'schedule', 'always', 'countdown'
      startTime: "21:00",
      endTime: "07:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      customMessage: "Night Curfew Active. Time to disconnect, rest your mind, and prepare for tomorrow.",
      createdAt: Date.now(),
      lockedUntil: Date.now() + THREE_DAYS_MS,
      renewalCount: 0,
      graceExpiresAt: null
    },
    {
      id: "rule_instagram",
      name: "Instagram",
      pattern: "instagram.com",
      enabled: true,
      mode: "schedule",
      startTime: "21:00",
      endTime: "07:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      customMessage: "Night Curfew Active. Stop endless scrolling and sleep peacefully.",
      createdAt: Date.now(),
      lockedUntil: Date.now() + THREE_DAYS_MS,
      renewalCount: 0,
      graceExpiresAt: null
    }
  ],
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
  strictMode: true, // Prevents early tampering
  reflectionLogs: [], // Records the 7 follow-up inquiry answers
  stats: {
    totalBlocked: 0,
    todayBlocked: 0,
    commitmentsHonored: 0,
    lastResetDate: new Date().toISOString().split('T')[0]
  }
};

// Initialize Storage Defaults & Migration
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(null);
  if (!data.rules) {
    await chrome.storage.local.set(DEFAULT_STATE);
  } else {
    // Migrate existing rules to include 3-day locks and audit logs if missing
    let modified = false;
    const rules = (data.rules || []).map(r => {
      const now = Date.now();
      const createdAt = r.createdAt || now;
      const lockedUntil = r.lockedUntil || (createdAt + THREE_DAYS_MS);
      if (!r.createdAt || !r.lockedUntil) modified = true;
      return {
        ...r,
        createdAt,
        lockedUntil,
        renewalCount: r.renewalCount || 0,
        graceExpiresAt: r.graceExpiresAt || null
      };
    });
    const reflectionLogs = data.reflectionLogs || [];
    if (!data.reflectionLogs) modified = true;
    if (modified) {
      await chrome.storage.local.set({ rules, reflectionLogs });
    }
  }

  // Set autonomous background alarm to check active tabs every minute
  chrome.alarms.create("autonomousCheck", { periodInMinutes: 1 });
  console.log("ARE Cozy 3-Day Engine installed and active.");
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

// Core Matching Engine
async function evaluateUrlAgainstRestrictions(targetUrl) {
  if (!targetUrl || targetUrl.startsWith('chrome://') || targetUrl.startsWith('chrome-extension://') || targetUrl.startsWith('about:')) {
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

  // 1. Check Global Focus Lock
  const isFocusLockActive = focusLock.active && nowMs < focusLock.expiresAt;

  for (const rule of rules) {
    if (!rule.enabled) continue;

    const pattern = rule.pattern.toLowerCase().replace(/^www\./, '').trim();
    if (!pattern) continue;

    let matchesPattern = false;
    if (pattern.includes('/')) {
      const fullPath = hostname + pathname;
      matchesPattern = fullPath === pattern || fullPath.startsWith(pattern);
    } else {
      matchesPattern = hostname === pattern || hostname.endsWith('.' + pattern);
    }

    if (matchesPattern) {
      // Check if user currently has an active 1-hour grace pass for this rule
      if (rule.graceExpiresAt && nowMs < rule.graceExpiresAt) {
        return { shouldBlock: false };
      }

      // Check if the 3-day restriction period has elapsed!
      // If elapsed, trigger the review prompt on the blocked screen.
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

      // 3-Day Commitment is actively running (nowMs < rule.lockedUntil)
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
          reason: "Continuous Rest Barrier",
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
            // Early morning hours belong to the schedule armed yesterday evening
            const prevDay = (currentDay + 6) % 7;
            inCurfew = days.includes(prevDay);
          }
        } else {
          // Same day window (e.g. 09:00 to 17:00)
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

// Redirect tab to blocked page with rich contextual metadata
async function enforceBlockOnTab(tabId, targetUrl, evaluation) {
  // Update stats
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

  chrome.tabs.update(tabId, { url: blockedPageUrl });
}

// Navigation Interceptor
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Top-level frame only

  const evaluation = await evaluateUrlAgainstRestrictions(details.url);
  if (evaluation.shouldBlock) {
    await enforceBlockOnTab(details.tabId, details.url, evaluation);
  }
});

// Autonomous Periodic Watcher (Checks currently open tabs every minute)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "autonomousCheck") {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url) {
        const evaluation = await evaluateUrlAgainstRestrictions(tab.url);
        if (evaluation.shouldBlock) {
          await enforceBlockOnTab(tab.id, tab.url, evaluation);
        }
      }
    }
  }
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
        sendResponse({ status: "success", state });
      }

      else if (request.action === "ADD_RULE") {
        const state = await chrome.storage.local.get("rules");
        let rules = state.rules || [];
        const cleanPattern = request.rule.pattern.toLowerCase().replace(/^www\./, '').trim();
        const existingIndex = rules.findIndex(r => r.pattern.toLowerCase().replace(/^www\./, '').trim() === cleanPattern);

        const now = Date.now();
        // Mandatory 3-Day Lock initialization for any added link
        const newRule = {
          ...request.rule,
          pattern: cleanPattern,
          createdAt: now,
          lockedUntil: now + THREE_DAYS_MS, // 72-hour pledge
          renewalCount: 0,
          graceExpiresAt: null,
          enabled: true
        };

        if (existingIndex !== -1) {
          // If already exists, re-arm with fresh 3-day lock
          rules[existingIndex] = { ...rules[existingIndex], ...newRule, lockedUntil: now + THREE_DAYS_MS };
        } else {
          rules.push(newRule);
        }
        await chrome.storage.local.set({ rules });
        sendResponse({ status: "success", rule: newRule, rules });
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

        // Anti-Tamper 3-Day Lock Rule: User CANNOT disable during the 3-day commitment period
        if (isLocked && existing.enabled && !request.rule.enabled) {
          const timeLeft = formatRemainingTime(existing.lockedUntil - now);
          sendResponse({
            status: "error",
            message: `🔒 3-Day Commitment Active! This rule cannot be toggled off for another ${timeLeft}. Honor your pledge.`
          });
          return;
        }

        // Strict Mode Focus Lock Guard
        if (state.strictMode && state.focusLock && state.focusLock.active && now < state.focusLock.expiresAt && !request.rule.enabled) {
          sendResponse({
            status: "error",
            message: "Strict Mode Active: Cannot modify or disable rules during an active Focus Sprint!"
          });
          return;
        }

        // Apply safe updates (preserve immutable security fields)
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
        // Mandatory 3-Day Lock Guard: User has NO ACCESS to remove the link before 3 days
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
        // User agreed to continue restriction for another 3 days
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
        // User answered the 7 follow-up questions
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
          answers: request.answers || {}, // The 7 answers
          finalAction: request.finalAction // 'remove', 'grace_1h', 'relock_3d'
        };

        reflectionLogs.unshift(auditEntry);
        // Keep last 100 reflection logs
        if (reflectionLogs.length > 100) reflectionLogs = reflectionLogs.slice(0, 100);

        if (request.finalAction === 'remove') {
          // Permitted after completing the 3-day requirement and the 7-step audit
          rules = rules.filter(r => r.id !== request.ruleId);
        } else if (request.finalAction === 'grace_1h' && target) {
          // Grant 1 hour of temporary pass, then re-lock for 3 days!
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

        // Immediately enforce on open tabs
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          if (tab.url) {
            const evaluation = await evaluateUrlAgainstRestrictions(tab.url);
            if (evaluation.shouldBlock) {
              await enforceBlockOnTab(tab.id, tab.url, evaluation);
            }
          }
        }
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
