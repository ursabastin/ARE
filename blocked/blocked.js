// ARE Interception Screen Controller - Cozy 3-Day Protocol

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get('url') || 'Restricted Site';
  const reason = params.get('reason') || 'Scheduled Restriction';
  const message = params.get('message') || 'Protecting your focus, sleep cycle, and mental tranquility.';
  const isReview = params.get('review') === '1';
  const isPermanent = params.get('permanent') === '1';
  const ruleId = params.get('ruleId') || '';
  const category = params.get('category') || '';
  const lockedUntil = parseInt(params.get('lockedUntil') || '0', 10);
  const commitmentRemaining = parseInt(params.get('commitmentRemaining') || '0', 10);

  // Extract clean domain
  let domain = targetUrl;
  try {
    const parsed = new URL(targetUrl);
    domain = parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    domain = targetUrl.replace(/^www\./, '');
  }

  // Set shared domain text
  const blockedUrlElem = document.getElementById('blockedUrlDisplay');
  if (blockedUrlElem) blockedUrlElem.textContent = domain;
  const reviewDomainElem = document.getElementById('reviewDomainName');
  if (reviewDomainElem) reviewDomainElem.textContent = domain;

  if (isReview && !isPermanent) {
    initReviewView(ruleId, domain, targetUrl);
  } else {
    initActiveLockView(reason, message, lockedUntil, commitmentRemaining, isPermanent, category, targetUrl);
  }

  // Global button handlers
  document.getElementById('closeTabBtn')?.addEventListener('click', closeCurrentTab);
  document.getElementById('openStudioBtn')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

// View 1: Active 3-Day / Permanent Lock
function initActiveLockView(reason, message, lockedUntil, commitmentRemaining, isPermanent, category, originalUrl) {
  document.getElementById('activeLockView').style.display = 'block';
  document.getElementById('reviewView').style.display = 'none';

  const reasonElem = document.getElementById('blockReasonText');
  if (reasonElem) reasonElem.textContent = reason;

  const quoteElem = document.getElementById('quoteText');
  if (quoteElem && message) quoteElem.textContent = `“${message}”`;

  const countdownElem = document.getElementById('lockCountdown');

  if (isPermanent) {
    const badgeText = document.getElementById('shieldBadgeText');
    if (badgeText) badgeText.textContent = "24/7 NSFW Guard Active";
    if (countdownElem) countdownElem.textContent = "PERMANENT 24/7 LOCK (NORMAL & INCOGNITO)";
    return;
  }

  if (category === 'streaming') {
    initStreamingBracketPod(originalUrl);
  }

  // Countdown timer
  const targetTime = lockedUntil > 0 ? lockedUntil : (Date.now() + commitmentRemaining);

  function tick() {
    const diff = Math.max(0, targetTime - Date.now());
    if (diff <= 0) {
      if (countdownElem) countdownElem.textContent = "3-Day Milestone Reached! Refresh to review.";
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let text = "";
    if (days > 0) {
      text = `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
    } else {
      text = `${hours}h ${minutes}m ${seconds}s remaining`;
    }

    if (countdownElem) countdownElem.textContent = text;
  }

  tick();
  setInterval(tick, 1000);
}

function formatHms(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function initStreamingBracketPod(originalUrl) {
  const pod = document.getElementById('streamingBracketPod');
  const chip = document.getElementById('bracketChip');
  const mainText = document.getElementById('bracketMainText');
  const subDesc = document.getElementById('bracketSubDesc');
  const startBtn = document.getElementById('startBracketBlockedBtn');
  if (!pod) return;

  let bracketTicker = null;

  function renderBracketState() {
    chrome.runtime.sendMessage({ action: "GET_STATE" }, (res) => {
      if (!res || !res.bracketStatus) return;
      const b = res.bracketStatus;
      const focusLock = (res.state && res.state.focusLock) || {};
      const focusActive = focusLock.active && Date.now() < focusLock.expiresAt;

      pod.style.display = 'block';
      if (bracketTicker) {
        clearInterval(bracketTicker);
        bracketTicker = null;
      }

      if (b.state === 'exhausted') {
        pod.classList.add('exhausted');
        chip.textContent = 'ENDED TODAY';
        subDesc.textContent = 'Your daily 2-hour anime & streaming window has ended completely for today. It will automatically refresh tomorrow.';
        startBtn.style.display = 'none';
        const resetAt = Date.now() + b.resetInMs;
        const updateReset = () => {
          const left = Math.max(0, resetAt - Date.now());
          if (left <= 0) {
            renderBracketState();
            return;
          }
          mainText.textContent = `Refreshes tomorrow in ${formatHms(left)}`;
        };
        updateReset();
        bracketTicker = setInterval(updateReset, 1000);
      } else if (b.state === 'active') {
        pod.classList.remove('exhausted');
        chip.textContent = focusActive ? 'PAUSED BY FOCUS' : '2H ACTIVE';
        mainText.textContent = `${formatHms(b.remainingMs)} remaining today`;
        if (focusActive) {
          subDesc.textContent = 'Your Focus Sprint Lock is active right now. Anime & streaming stay paused until the focus sprint ends.';
          startBtn.style.display = 'none';
        } else {
          window.location.href = originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`;
        }
      } else {
        pod.classList.remove('exhausted');
        chip.textContent = '2H READY';
        mainText.textContent = '02:00:00 available today';
        subDesc.textContent = 'Starting unlocks all anime & streaming sites for one continuous 2-hour window. Once those 2 hours end, access locks completely until tomorrow.';
        if (focusActive) {
          startBtn.disabled = true;
          startBtn.textContent = '☕ Finish Active Focus Sprint First';
        } else {
          startBtn.style.display = 'inline-flex';
          startBtn.disabled = false;
          startBtn.textContent = '▶ Start Daily 2-Hour Bracket & Open Site';
          startBtn.onclick = () => {
            startBtn.disabled = true;
            chrome.runtime.sendMessage({ action: "START_STREAMING_BRACKET" }, (startRes) => {
              if (startRes && startRes.status === 'success') {
                window.location.href = originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`;
              } else {
                alert((startRes && startRes.message) || 'Could not start daily bracket.');
                renderBracketState();
              }
            });
          };
        }
      }
    });
  }

  renderBracketState();
}

// View 2: 3-Day Review & 7-Step Follow-Up Reflection Wizard
function initReviewView(ruleId, domain, originalUrl) {
  document.getElementById('activeLockView').style.display = 'none';
  document.getElementById('reviewView').style.display = 'block';

  const badgeText = document.getElementById('shieldBadgeText');
  if (badgeText) badgeText.textContent = "Milestone Review Due";

  const initialStage = document.getElementById('initialDecisionStage');
  const wizardStage = document.getElementById('reflectionWizardStage');
  const resultStage = document.getElementById('decisionResultStage');

  // Option A: Continue restriction for another 3 days
  document.getElementById('btnContinueRestriction')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "RENEW_RULE_3DAYS", ruleId }, (res) => {
      showCompletionResult(
        "🌱",
        "Pledge Renewed For 3 More Days!",
        `Congratulations on honoring your digital calm. ${domain} is safely restricted for another 72 hours.`,
        () => closeCurrentTab()
      );
    });
  });

  // Option B: Decline continuing -> Launch the 7-Step Reflection Wizard!
  document.getElementById('btnDeclineContinue')?.addEventListener('click', () => {
    initialStage.style.display = 'none';
    wizardStage.style.display = 'block';
    setupWizardNavigation(ruleId, domain, originalUrl);
  });
}

// 7-Step Wizard Navigation & Data Submission
function setupWizardNavigation(ruleId, domain, originalUrl) {
  let currentStep = 1;
  const totalSteps = 7;

  const nextBtn = document.getElementById('wizardNextBtn');
  const backBtn = document.getElementById('wizardBackBtn');
  const submitBtn = document.getElementById('wizardSubmitBtn');
  const counterText = document.getElementById('stepCounterText');
  const progressBar = document.getElementById('wizardProgressBar');
  const form = document.getElementById('auditForm');

  function updateStepUI() {
    // Show active pane
    document.querySelectorAll('.wizard-question-pane').forEach(pane => {
      const step = parseInt(pane.getAttribute('data-step'), 10);
      pane.classList.toggle('active', step === currentStep);
    });

    // Update Counter & Progress
    counterText.textContent = `Question ${currentStep} of ${totalSteps}`;
    const percent = Math.round((currentStep / totalSteps) * 100);
    progressBar.style.width = `${percent}%`;

    // Button visibility
    backBtn.style.display = currentStep > 1 ? 'inline-flex' : 'none';
    if (currentStep === totalSteps) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-flex';
    } else {
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
    }
  }

  nextBtn.addEventListener('click', () => {
    const currentPane = document.querySelector(`.wizard-question-pane[data-step="${currentStep}"]`);
    const checked = currentPane.querySelector('input[type="radio"]:checked');
    if (!checked) {
      alert("Please select one option to continue your reflection.");
      return;
    }
    if (currentStep < totalSteps) {
      currentStep++;
      updateStepUI();
    }
  });

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateStepUI();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const answers = {
      q1_remove_intent: formData.get('q1_remove'),
      q2_task_trigger: formData.get('q2_task'),
      q3_emotional_state: formData.get('q3_emotion'),
      q4_time_budget: formData.get('q4_time'),
      q5_scroll_risk: formData.get('q5_risk'),
      q6_offline_alternative: formData.get('q6_alternative'),
      q7_final_action: formData.get('q7_action')
    };

    const finalAction = formData.get('q7_action');

    chrome.runtime.sendMessage({
      action: "SUBMIT_REFLECTION_AUDIT",
      ruleId,
      answers,
      finalAction
    }, (res) => {
      if (res && res.status === 'success') {
        if (finalAction === 'remove') {
          showCompletionResult(
            "🕊️",
            "Restriction Released",
            `Your reflection data has been safely logged in ARE Studio. Access to ${domain} is now open. Be mindful of your time!`,
            () => {
              window.location.href = originalUrl.startsWith('http') ? originalUrl : `https://${domain}`;
            }
          );
        } else if (finalAction === 'grace_1h') {
          showCompletionResult(
            "⏳",
            "1-Hour Grace Pass Active",
            `You have 60 minutes of intentional access. ARE will automatically re-lock ${domain} for another 3 days when this hour expires.`,
            () => {
              window.location.href = originalUrl.startsWith('http') ? originalUrl : `https://${domain}`;
            }
          );
        } else {
          showCompletionResult(
            "🌱",
            "Protected For 3 More Days!",
            `Outstanding self-awareness! You reflected, caught the impulse, and chose peace. ${domain} is locked for another 72 hours.`,
            () => closeCurrentTab()
          );
        }
      } else {
        alert("Could not submit audit. Please try again.");
      }
    });
  });

  updateStepUI();
}

function showCompletionResult(icon, title, desc, onAction) {
  const wizardStage = document.getElementById('reflectionWizardStage');
  const initialStage = document.getElementById('initialDecisionStage');
  const resultStage = document.getElementById('decisionResultStage');

  if (wizardStage) wizardStage.style.display = 'none';
  if (initialStage) initialStage.style.display = 'none';
  if (resultStage) resultStage.style.display = 'block';

  document.getElementById('resultIcon').textContent = icon;
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultDesc').textContent = desc;

  const btn = document.getElementById('resultActionBtn');
  btn.onclick = onAction;
}

function closeCurrentTab() {
  try {
    chrome.tabs.getCurrent((tab) => {
      if (tab && tab.id) {
        chrome.tabs.remove(tab.id);
      } else {
        window.close();
      }
    });
  } catch (e) {
    window.close();
  }
}
