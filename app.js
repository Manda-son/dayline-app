const STORAGE_KEY = "dayline-poc-v1";
const JOURNAL_KEY = "dayline-journals-v1";
const RECAP_KEY = "dayline-recap-v1";
const METRICS_KEY = "dayline-metrics-v1";
const DEV_KEY = "dayline-dev-v1";
const RECAP_UNLOCK_WINDOW_MS = 2 * 60 * 60 * 1000;

const toneMessages = {
  Motivational: [
    "The day is not gone. It is asking for one clean move.",
    "You do not need a perfect reset. You need the next useful hour.",
    "Use what is left like it matters. Because it does.",
    "Small actions compound. Spend the next block on purpose."
  ],
  Reflective: [
    "Notice the time without fighting it. Then choose the next thing gently.",
    "Today is passing. That can be painful, but it can also be clarifying.",
    "Pause for ten seconds. What would make the rest of today feel honest?",
    "You are allowed to begin again in the middle of the day."
  ],
  Brutal: [
    "Time kept moving while you negotiated with yourself.",
    "Your future self cannot use the hours you burn today.",
    "The day does not care about your intentions. It only records your actions.",
    "If this hour disappears, it will not file an appeal."
  ],
  Toxic: [
    "Your screen won that round. Are you taking the next one back?",
    "The scroll will still be there after you stop feeding it your life.",
    "You said your goals matter. Very interesting behavior so far.",
    "Another hour sacrificed to the rectangle? Bold strategy."
  ]
};

const defaultSettings = {
  wakeTime: "07:30",
  bedTime: "23:30",
  defaultView: "progress"
};

const state = {
  settings: loadSettings(),
  activeView: "progress",
  currentTone: "Reflective",
  currentMessage: "",
  lastRecap: loadRecap(),
  journals: loadJournals(),
  metrics: loadMetrics()
};

const els = {
  setupPanel: document.querySelector("#setupPanel"),
  dashboard: document.querySelector("#dashboard"),
  settingsForm: document.querySelector("#settingsForm"),
  setupEyebrow: document.querySelector("#setupEyebrow"),
  setupTitle: document.querySelector("#setupTitle"),
  setupLead: document.querySelector("#setupLead"),
  defaultViewField: document.querySelector("#defaultViewField"),
  settingsSubmit: document.querySelector("#settingsSubmit"),
  testReport: document.querySelector("#testReport"),
  wakeTime: document.querySelector("#wakeTime"),
  bedTime: document.querySelector("#bedTime"),
  openSettings: document.querySelector("#openSettings"),
  progressMode: document.querySelector("#progressMode"),
  countdownMode: document.querySelector("#countdownMode"),
  timeLabel: document.querySelector("#timeLabel"),
  heroVerdict: document.querySelector("#heroVerdict"),
  heroNumber: document.querySelector("#heroNumber"),
  heroSubtext: document.querySelector("#heroSubtext"),
  progressFill: document.querySelector("#progressFill"),
  statDayUsed: document.querySelector("#statDayUsed"),
  statTimeLeft: document.querySelector("#statTimeLeft"),
  statScrollTax: document.querySelector("#statScrollTax"),
  openRecap: document.querySelector("#openRecap"),
  openJournal: document.querySelector("#openJournal"),
  openReceipt: document.querySelector("#openReceipt"),
  openNotes: document.querySelector("#openNotes"),
  journalModal: document.querySelector("#journalModal"),
  receiptModal: document.querySelector("#receiptModal"),
  notesModal: document.querySelector("#notesModal"),
  closeJournal: document.querySelector("#closeJournal"),
  closeReceipt: document.querySelector("#closeReceipt"),
  closeNotes: document.querySelector("#closeNotes"),
  recapModal: document.querySelector("#recapModal"),
  recapForm: document.querySelector("#recapForm"),
  goalReminder: document.querySelector("#goalReminder"),
  goalReminderList: document.querySelector("#goalReminderList"),
  scrollHours: document.querySelector("#scrollHours"),
  scrollMinutes: document.querySelector("#scrollMinutes"),
  numberWheels: document.querySelectorAll(".wheel-control"),
  goalWorkScore: document.querySelector("#goalWorkScore"),
  goalWorkOutput: document.querySelector("#goalWorkOutput"),
  goalWorkDescriptor: document.querySelector("#goalWorkDescriptor"),
  cancelRecap: document.querySelector("#cancelRecap"),
  awarenessModal: document.querySelector("#awarenessModal"),
  awarenessMessage: document.querySelector("#awarenessMessage"),
  closeAwareness: document.querySelector("#closeAwareness"),
  journalForm: document.querySelector("#journalForm"),
  longTermGoals: document.querySelector("#longTermGoals"),
  dayReflection: document.querySelector("#dayReflection"),
  tomorrowGoals: document.querySelector("#tomorrowGoals"),
  clearJournal: document.querySelector("#clearJournal"),
  receiptCanvas: document.querySelector("#receiptCanvas"),
  dayRecapStory: document.querySelector("#dayRecapStory"),
  recapSlides: document.querySelectorAll(".recap-slide"),
  recapBars: document.querySelectorAll(".story-progress span"),
  recapPrev: document.querySelector("#recapPrev"),
  recapNext: document.querySelector("#recapNext"),
  recapNavActions: document.querySelector(".recap-nav-actions"),
  posterSharePanel: document.querySelector("#posterSharePanel"),
  posterShareTitle: document.querySelector("#posterShareTitle"),
  posterEmpty: document.querySelector("#posterEmpty"),
  posterLogScroll: document.querySelector("#posterLogScroll"),
  posterPreview: document.querySelector("#posterPreview"),
  showRecapPoster: document.querySelector("#showRecapPoster"),
  hideRecapPoster: document.querySelector("#hideRecapPoster"),
  recapDayPercent: document.querySelector("#recapDayPercent"),
  recapDayLeftLabel: document.querySelector("#recapDayLeftLabel"),
  recapDayLeft: document.querySelector("#recapDayLeft"),
  recapDayBedtime: document.querySelector("#recapDayBedtime"),
  recapDayRange: document.querySelector("#recapDayRange"),
  recapScrollTitle: document.querySelector("#recapScrollTitle"),
  recapScrollBody: document.querySelector("#recapScrollBody"),
  recapScrollGrid: document.querySelector("#recapScrollGrid"),
  recapScrollShare: document.querySelector("#recapScrollShare"),
  recapScrollSource: document.querySelector("#recapScrollSource"),
  recapScrollLog: document.querySelector("#recapScrollLog"),
  recapGoalsTitle: document.querySelector("#recapGoalsTitle"),
  recapTodayList: document.querySelector("#recapTodayList"),
  recapNoPlan: document.querySelector("#recapNoPlan"),
  recapRating: document.querySelector("#recapRating"),
  recapRatingText: document.querySelector("#recapRatingText"),
  recapGoalsLog: document.querySelector("#recapGoalsLog"),
  recapGoalsSource: document.querySelector("#recapGoalsSource"),
  recapGoalList: document.querySelector("#recapGoalList"),
  recapUnplanned: document.querySelector("#recapUnplanned"),
  writeTomorrowGoals: document.querySelector("#writeTomorrowGoals"),
  recapWhy: document.querySelector("#recapWhy"),
  recapLongTermGoal: document.querySelector("#recapLongTermGoal"),
  sharePoster: document.querySelector("#sharePoster"),
  copyTestReport: document.querySelector("#copyTestReport"),
  metricRecaps: document.querySelector("#metricRecaps"),
  metricJournals: document.querySelector("#metricJournals"),
  metricReceipts: document.querySelector("#metricReceipts"),
  historyList: document.querySelector("#historyList"),
  toast: document.querySelector("#toast")
};

let activeRecapSlide = 0;
let recapMetricsTouched = {
  hours: false,
  minutes: false,
  goals: false
};

init();

function init() {
  buildNumberWheels();
  fillSettingsForm();
  fillRecapForm();
  state.activeView = state.settings.defaultView;
  bindEvents();
  showApp();
  trackEvent("app_open");
  tick();
  setInterval(tick, 1000);
  registerServiceWorker();
}

function bindEvents() {
  els.settingsForm.addEventListener("submit", handleSettingsSubmit);
  els.openSettings.addEventListener("click", () => {
    // During onboarding the setup panel is the only screen there is.
    if (document.body.classList.contains("is-onboarding")) {
      return;
    }

    const isHidden = els.setupPanel.hidden;
    if (isHidden) {
      setSetupMode("settings");
    }
    els.setupPanel.hidden = !isHidden;
    if (isHidden) {
      els.setupPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  els.progressMode.addEventListener("click", () => setActiveView("progress"));
  els.countdownMode.addEventListener("click", () => setActiveView("countdown"));
  els.openRecap.addEventListener("click", openRecapModal);
  els.goalWorkScore.addEventListener("input", () => {
    markRecapMetricTouched("goalWorkScore");
    updateGoalWorkScale();
  });
  els.goalWorkScore.addEventListener("pointerdown", () => markRecapMetricTouched("goalWorkScore"));
  els.goalWorkScore.addEventListener("keydown", () => markRecapMetricTouched("goalWorkScore"));
  els.openJournal.addEventListener("click", () => openFeatureModal("journal"));
  els.openReceipt.addEventListener("click", () => openFeatureModal("receipt"));
  els.openNotes.addEventListener("click", () => openFeatureModal("notes"));
  els.closeJournal.addEventListener("click", () => closeFeatureModal("journal"));
  els.closeReceipt.addEventListener("click", () => closeFeatureModal("receipt"));
  els.closeNotes.addEventListener("click", () => closeFeatureModal("notes"));
  els.cancelRecap.addEventListener("click", closeRecapModal);
  els.recapForm.addEventListener("submit", handleRecapSubmit);
  els.closeAwareness.addEventListener("click", closeAwarenessModal);
  els.journalForm.addEventListener("submit", handleJournalSubmit);
  els.clearJournal.addEventListener("click", () => {
    els.longTermGoals.value = "";
    els.dayReflection.value = "";
    els.tomorrowGoals.value = "";
    showToast("Journal fields cleared.");
    renderReceipt(getDayStats(new Date()));
  });
  els.sharePoster.addEventListener("click", sharePoster);
  els.copyTestReport.addEventListener("click", copyTestReport);
  els.recapPrev.addEventListener("click", () => setActiveRecapSlide(activeRecapSlide - 1));
  els.recapNext.addEventListener("click", () => setActiveRecapSlide(activeRecapSlide + 1));
  els.dayRecapStory.addEventListener("click", handleRecapStoryTap);
  els.dayRecapStory.addEventListener("keydown", handleRecapStoryKeydown);
  els.showRecapPoster.addEventListener("click", showRecapPosterPanel);
  els.writeTomorrowGoals.addEventListener("click", () => openFeatureModal("journal"));
  els.hideRecapPoster.addEventListener("click", hideRecapPosterPanel);
  els.posterLogScroll.addEventListener("click", openRecapModal);
  els.recapScrollLog.addEventListener("click", openRecapModal);
  els.recapGoalsLog.addEventListener("click", openRecapModal);
}

function fillSettingsForm() {
  els.wakeTime.value = state.settings.wakeTime;
  els.bedTime.value = state.settings.bedTime;
  const defaultViewInput = document.querySelector(`input[name="defaultView"][value="${state.settings.defaultView}"]`);
  if (defaultViewInput) {
    defaultViewInput.checked = true;
  }
}

function fillRecapForm() {
  const minutes = state.lastRecap.scrollingMinutes || 0;
  els.scrollHours.value = String(Math.floor(minutes / 60));
  els.scrollMinutes.value = String(minutes % 60);
  syncNumberWheels();
  setGoalWorkScore(getStoredGoalWorkScore());
}

function isDevMode() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("dev")) {
    const enabled = params.get("dev") !== "0";
    localStorage.setItem(DEV_KEY, enabled ? "1" : "0");
    return enabled;
  }

  return localStorage.getItem(DEV_KEY) === "1";
}

// First run shows nothing but the two times. Returning users land on the
// dashboard and reach the same form through the settings icon.
function setSetupMode(mode) {
  const onboarding = mode === "onboarding";

  document.body.classList.toggle("is-onboarding", onboarding);
  els.setupEyebrow.textContent = onboarding ? "Welcome" : "Setup";
  els.setupTitle.textContent = onboarding ? "When does your day run?" : "Define your usable day.";
  els.setupLead.hidden = !onboarding;
  els.defaultViewField.hidden = onboarding;
  els.settingsSubmit.textContent = onboarding ? "Start" : "Save setup";
  els.testReport.hidden = onboarding || !isDevMode();
}

function showApp() {
  const hasSettings = Boolean(localStorage.getItem(STORAGE_KEY));

  setSetupMode(hasSettings ? "settings" : "onboarding");
  els.setupPanel.hidden = hasSettings;
  els.dashboard.hidden = !hasSettings;
  setActiveView(state.activeView);
  renderHistory();
}

function handleSettingsSubmit(event) {
  event.preventDefault();
  const formData = new FormData(els.settingsForm);
  const nextSettings = {
    wakeTime: formData.get("wakeTime"),
    bedTime: formData.get("bedTime"),
    defaultView: formData.get("defaultView")
  };

  if (nextSettings.wakeTime === nextSettings.bedTime) {
    showToast("Wake-up time and bedtime need to be different.");
    return;
  }

  const wasOnboarding = document.body.classList.contains("is-onboarding");

  state.settings = nextSettings;
  state.activeView = nextSettings.defaultView;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
  trackEvent(wasOnboarding ? "onboarding_completed" : "setup_saved", { defaultView: nextSettings.defaultView });
  setSetupMode("settings");
  els.setupPanel.hidden = true;
  els.dashboard.hidden = false;
  setActiveView(state.activeView);
  tick();
  showToast(wasOnboarding ? "You are set. Here is your day." : "Setup saved.");
}

function setActiveView(view) {
  state.activeView = view;
  trackEvent("view_changed", { view });
  const isProgress = view === "progress";
  els.progressMode.classList.toggle("is-active", isProgress);
  els.countdownMode.classList.toggle("is-active", !isProgress);
  els.progressMode.setAttribute("aria-selected", String(isProgress));
  els.countdownMode.setAttribute("aria-selected", String(!isProgress));
  tick();
}

function tick() {
  const now = new Date();
  expireStaleRecap(now);
  const stats = getDayStats(now);
  renderHero(stats);
  renderReceipt(stats);
  renderRecapStory(stats);
  renderRecapAvailability(stats);
  renderMetrics();
}

function renderHero(stats) {
  const dayPercent = Math.round(stats.percent);
  els.progressFill.style.width = `${dayPercent}%`;
  renderDaySignals(stats);

  if (state.activeView === "countdown") {
    els.timeLabel.textContent = "Bedtime countdown";
    els.heroNumber.classList.add("is-clock");
    els.heroNumber.textContent = stats.countdownShort;
    if (stats.pastBedtime) {
      els.heroSubtext.textContent = `You are ${stats.overtimeLong} past bedtime. The usable day is spent.`;
    } else {
      els.heroSubtext.textContent = stats.dayStarted
        ? `${stats.remainingLong} before your planned shutdown. Spend the rest deliberately.`
        : `Your usable day starts in ${stats.startsInLong}. Bedtime is still ${stats.timeUntilBedLong} away.`;
    }
    return;
  }

  els.timeLabel.textContent = "Day progress";
  els.heroNumber.classList.remove("is-clock");
  els.heroNumber.textContent = `${dayPercent}%`;
  if (stats.pastBedtime) {
    els.heroSubtext.textContent = `Your usable day is over. You are ${stats.overtimeLong} past bedtime.`;
  } else {
    els.heroSubtext.textContent = stats.dayStarted
      ? `${stats.elapsedLong} used. ${stats.remainingLong} left before bedtime.`
      : `Your usable day has not started yet. Wake-up is in ${stats.startsInLong}.`;
  }
}

function renderDaySignals(stats) {
  const dayPercent = Math.round(stats.percent);
  const scrollingMinutes = state.lastRecap.scrollingMinutes || 0;
  const progressFeeling = state.lastRecap.progressFeeling || "none";

  els.statDayUsed.textContent = `${dayPercent}%`;
  els.statTimeLeft.textContent = stats.remainingShort;
  els.statScrollTax.textContent = formatScrollTax(state.lastRecap);
  // "Not logged" cannot fit a third of the row at the value type size.
  // Real numbers stay large; only the placeholder steps down.
  els.statScrollTax.classList.toggle("is-empty", !isRecapLogged(state.lastRecap));
  els.heroVerdict.textContent = stats.pastBedtime
    ? "Past bedtime"
    : getHeroVerdict(dayPercent, scrollingMinutes, progressFeeling);
}

function renderRecapAvailability(stats) {
  const available = isRecapAvailable(stats);
  els.openReceipt.classList.toggle("is-locked", !available);
  els.openReceipt.setAttribute("aria-disabled", String(!available));
  els.openReceipt.title = available ? "Day recap" : "Day recap unlocks 2 hours before bedtime";
}

function getHeroVerdict(dayPercent, scrollingMinutes, progressFeeling) {
  if (scrollingMinutes >= 360) {
    return "Scroll tax loud";
  }

  if (dayPercent >= 75 && progressFeeling === "none") {
    return "Comeback window";
  }

  if (progressFeeling === "solid" && scrollingMinutes < 90) {
    return "Momentum alive";
  }

  if (dayPercent < 30) {
    return "Early enough";
  }

  return "Still yours";
}

function openRecapModal() {
  // Always start from the day's saved totals, so an update changes only what moved.
  fillRecapForm();
  renderGoalReminder();
  trackEvent("recap_opened");
  resetRecapMetricTouches();
  els.recapModal.hidden = false;
  document.body.classList.add("has-modal");
  syncNumberWheels();
  window.setTimeout(() => document.querySelector("#scrollHoursWheel")?.focus(), 50);
}

function closeRecapModal() {
  els.recapModal.hidden = true;
  syncModalLock();
}

// The page stays locked while any modal is open, so closing the journal or the reality
// check over the recap does not let the page scroll under it.
function syncModalLock() {
  const anyOpen = [...document.querySelectorAll(".modal-backdrop")].some((modal) => !modal.hidden);
  document.body.classList.toggle("has-modal", anyOpen);
}

function openFeatureModal(feature) {
  const modal = getFeatureModal(feature);
  if (!modal) {
    return;
  }

  if (feature === "receipt") {
    const stats = getDayStats(new Date());
    if (!isRecapAvailable(stats)) {
      showToast("Day recap unlocks 2 hours before bedtime.");
      trackEvent("recap_locked_tapped");
      return;
    }
  }

  if (feature === "journal" && !els.longTermGoals.value.trim()) {
    els.longTermGoals.value = getLatestLongTermGoal();
  }

  trackEvent(`${feature}_opened`);
  modal.hidden = false;
  document.body.classList.add("has-modal");
  if (feature === "receipt") {
    const stats = getDayStats(new Date());
    hideRecapPosterPanel();
    renderReceipt(stats);
    renderRecapStory(stats);
    setActiveRecapSlide(0);
  }
  if (feature === "notes") {
    renderHistory();
  }
}

function closeFeatureModal(feature) {
  const modal = getFeatureModal(feature);
  if (!modal) {
    return;
  }

  modal.hidden = true;
  syncModalLock();
}

function getFeatureModal(feature) {
  return {
    journal: els.journalModal,
    receipt: els.receiptModal,
    notes: els.notesModal
  }[feature];
}

function isRecapAvailable(stats) {
  return stats.pastBedtime || (stats.dayStarted && stats.remainingMs <= RECAP_UNLOCK_WINDOW_MS);
}

function getGoalWorkScore() {
  return clamp(Number.parseInt(els.goalWorkScore.value, 10) || 0, 0, 10);
}

function setGoalWorkScore(score) {
  els.goalWorkScore.value = String(clamp(score, 0, 10));
  updateGoalWorkScale();
}

function getStoredGoalWorkScore() {
  const storedScore = Number.parseInt(state.lastRecap.goalWorkScore, 10);
  if (Number.isFinite(storedScore)) {
    return storedScore;
  }

  return getScoreFromProgressFeeling(state.lastRecap.progressFeeling || "light");
}

function getScoreFromProgressFeeling(value) {
  if (value === "solid") {
    return 8;
  }

  if (value === "none") {
    return 0;
  }

  return 5;
}

function getProgressFeelingFromScore(score) {
  if (score <= 2) {
    return "none";
  }

  if (score >= 7) {
    return "solid";
  }

  return "light";
}

function resetRecapMetricTouches() {
  recapMetricsTouched = {
    hours: false,
    minutes: false,
    goals: false
  };
}

function markRecapMetricTouched(inputName) {
  if (inputName === "scrollHours") {
    recapMetricsTouched.hours = true;
  }

  if (inputName === "scrollMinutes") {
    recapMetricsTouched.minutes = true;
  }

  if (inputName === "goalWorkScore") {
    recapMetricsTouched.goals = true;
  }
}

function validateRecapMetrics() {
  // The touch-every-control rule is for the day's first check-in. Updating a check-in
  // made today saves straight away.
  if (isRecapLogged(state.lastRecap) && isRecapCurrent(state.lastRecap, new Date())) {
    return true;
  }

  const missing = [];
  if (!recapMetricsTouched.hours) {
    missing.push("hours");
  }

  if (!recapMetricsTouched.minutes) {
    missing.push("minutes");
  }

  if (!recapMetricsTouched.goals) {
    missing.push("goal score");
  }

  if (!missing.length) {
    return true;
  }

  showToast(`Fill ${missing.join(", ")} before validating.`);
  return false;
}

function updateGoalWorkScale() {
  const score = getGoalWorkScore();
  els.goalWorkOutput.textContent = `${score}/10`;
  els.goalWorkDescriptor.textContent = getGoalWorkDescriptor(score);
}

function getGoalWorkDescriptor(score) {
  if (score <= 1) {
    return "Goals got ignored";
  }

  if (score <= 3) {
    return "Barely touched them";
  }

  if (score <= 6) {
    return "Some real work";
  }

  if (score <= 8) {
    return "Strong progress";
  }

  return "Protected the day";
}

// The plan pinned in the reality check is slide 3's: last night's journal by the cycle,
// so a plan written after midnight still counts.
function renderGoalReminder() {
  const goals = getTodayGoalsForDay(getDayStats(new Date()).cycleStart);

  if (!goals.length) {
    els.goalReminder.hidden = true;
    els.goalReminderList.innerHTML = "";
    return;
  }

  els.goalReminder.hidden = false;
  els.goalReminderList.innerHTML = goals
    .map((goal) => `<li>${escapeHtml(goal)}</li>`)
    .join("");
}

// Split on line breaks, semicolons, bullets and spaced dashes (" - "), never on a
// hyphen inside a word: "follow-up", "Jean-Pierre" and "30-minute" are one goal.
// A leading list dash ("- Gym") is dropped; a minus sign ("-5kg") is kept.
function splitGoalLines(text) {
  return String(text)
    .split(/\n|;|\u2022|\s[-\u2013\u2014]\s/)
    .map((line) => line.replace(/^\s*[-*\u2013\u2014]\s+/, "").trim())
    .filter(Boolean);
}

function buildNumberWheels() {
  els.numberWheels.forEach((wheel) => {
    if (wheel.dataset.ready === "true") {
      return;
    }

    const { min, max, pad } = getWheelConfig(wheel);
    const list = document.createElement("div");
    list.className = "wheel-list";

    for (let value = min; value <= max; value += 1) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "wheel-item";
      item.dataset.value = String(value);
      item.textContent = pad ? String(value).padStart(pad, "0") : String(value);
      list.appendChild(item);
    }

    wheel.textContent = "";
    wheel.appendChild(list);
    wheel.dataset.ready = "true";

    wheel.addEventListener("pointerdown", () => markRecapMetricTouched(wheel.dataset.input));
    wheel.addEventListener("wheel", () => markRecapMetricTouched(wheel.dataset.input));

    wheel.addEventListener("click", (event) => {
      const item = event.target instanceof Element ? event.target.closest(".wheel-item") : null;
      if (!item) {
        return;
      }

      event.preventDefault();
      markRecapMetricTouched(wheel.dataset.input);
      wheel.dataset.tapLockUntil = String(performance.now() + 220);
      setWheelValue(wheel, Number.parseInt(item.dataset.value, 10), { scroll: false });
    });

    wheel.addEventListener("scroll", () => {
      window.cancelAnimationFrame(wheel.scrollFrame);
      wheel.scrollFrame = window.requestAnimationFrame(() => syncWheelFromScroll(wheel));
    });

    wheel.addEventListener("keydown", (event) => handleWheelKeydown(event, wheel));
    syncWheelFromInput(wheel);
  });
}

function syncNumberWheels() {
  els.numberWheels.forEach((wheel) => syncWheelFromInput(wheel));
}

function getWheelConfig(wheel) {
  return {
    min: Number.parseInt(wheel.dataset.min, 10) || 0,
    max: Number.parseInt(wheel.dataset.max, 10) || 0,
    pad: Number.parseInt(wheel.dataset.pad, 10) || 0,
    input: document.getElementById(wheel.dataset.input)
  };
}

function syncWheelFromInput(wheel) {
  const { min, input } = getWheelConfig(wheel);
  const value = Number.parseInt(input?.value, 10);
  setWheelValue(wheel, Number.isNaN(value) ? min : value);
}

function syncWheelFromScroll(wheel) {
  const tapLockUntil = Number.parseFloat(wheel.dataset.tapLockUntil || "0");
  if (tapLockUntil > performance.now()) {
    return;
  }

  const items = Array.from(wheel.querySelectorAll(".wheel-item"));
  if (!items.length || !wheel.clientHeight) {
    return;
  }

  const center = wheel.scrollTop + wheel.clientHeight / 2;
  const closest = items.reduce((winner, item) => {
    const itemCenter = item.offsetTop + item.offsetHeight / 2;
    const distance = Math.abs(itemCenter - center);
    return distance < winner.distance ? { item, distance } : winner;
  }, { item: items[0], distance: Number.POSITIVE_INFINITY }).item;

  setWheelValue(wheel, Number.parseInt(closest.dataset.value, 10), { scroll: false });
}

function handleWheelKeydown(event, wheel) {
  const { min, max } = getWheelConfig(wheel);
  const current = Number.parseInt(wheel.dataset.value, 10) || min;
  let next = current;

  if (event.key === "ArrowUp") {
    next = current - 1;
  } else if (event.key === "ArrowDown") {
    next = current + 1;
  } else if (event.key === "PageUp") {
    next = current - 5;
  } else if (event.key === "PageDown") {
    next = current + 5;
  } else if (event.key === "Home") {
    next = min;
  } else if (event.key === "End") {
    next = max;
  } else {
    return;
  }

  event.preventDefault();
  markRecapMetricTouched(wheel.dataset.input);
  setWheelValue(wheel, next, { behavior: "smooth" });
}

function setWheelValue(wheel, value, options = {}) {
  const { min, max, input } = getWheelConfig(wheel);
  const next = clamp(Number.isNaN(value) ? min : value, min, max);
  const item = wheel.querySelector(`.wheel-item[data-value="${next}"]`);

  if (input) {
    input.value = String(next);
  }

  wheel.dataset.value = String(next);
  wheel.setAttribute("aria-valuenow", String(next));
  wheel.querySelectorAll(".wheel-item").forEach((wheelItem) => {
    wheelItem.classList.toggle("is-active", wheelItem === item);
  });

  if (options.scroll === false || !item || !wheel.clientHeight) {
    return;
  }

  const top = item.offsetTop - (wheel.clientHeight - item.offsetHeight) / 2;
  if (Math.abs(wheel.scrollTop - top) > 1) {
    wheel.scrollTo({ top, behavior: options.behavior || "auto" });
  }
}

function handleRecapSubmit(event) {
  event.preventDefault();
  if (!validateRecapMetrics()) {
    return;
  }

  const stats = getDayStats(new Date());
  const hours = Number.parseInt(els.scrollHours.value, 10) || 0;
  const minutes = Number.parseInt(els.scrollMinutes.value, 10) || 0;
  const scrollingMinutes = clamp(hours * 60 + minutes, 0, 18 * 60 + 59);
  const goalWorkScore = getGoalWorkScore();
  const progressFeeling = getProgressFeelingFromScore(goalWorkScore);

  state.lastRecap = {
    date: new Date().toISOString(),
    scrollingMinutes,
    goalWorkScore,
    progressFeeling
  };
  localStorage.setItem(RECAP_KEY, JSON.stringify(state.lastRecap));

  closeRecapModal();
  const awareness = buildAwareness(stats, scrollingMinutes, progressFeeling);
  trackEvent("recap_completed", {
    dayPercent: Math.round(stats.percent),
    scrollingMinutes,
    goalWorkScore,
    progressFeeling,
    awarenessTone: awareness.tone
  });
  showAwareness(awareness);
  renderReceipt(stats);
}

function buildAwareness(stats, scrollingMinutes, progressFeeling) {
  const scrolling = formatMinutesAsWords(scrollingMinutes);
  const dayUsed = Math.round(stats.percent);

  if (scrollingMinutes >= 360) {
    return pickAwareness("Toxic", [
      `${scrolling} scrolling is not a break. It is a handover. Take the next hour back.`,
      `${scrolling} gone to the scroll. Your goals did not lose today. You benched them.`,
      `The rectangle got ${scrolling}. Your future got leftovers. Change the split now.`
    ]);
  }

  if (scrollingMinutes >= 180 || (dayUsed >= 65 && progressFeeling === "none")) {
    return pickAwareness("Brutal", [
      `${dayUsed}% of the day is gone. Intentions are not evidence. Pick one action now.`,
      `${scrolling || "A chunk of today"} leaked away. The next hour needs a job, not a mood.`,
      `You do not need another reset. You need to stop letting the day negotiate you down.`
    ]);
  }

  if (progressFeeling === "solid" && scrollingMinutes < 90) {
    return pickAwareness("Motivational", [
      `You kept the day yours. Protect that momentum with one more clean block.`,
      `${dayUsed}% used, but there is proof of movement. Finish like this version of you is real.`,
      `This is the version of you that compounds. One more focused block before shutdown.`
    ]);
  }

  if (progressFeeling === "light") {
    return pickAwareness("Reflective", [
      `Some progress counts. Now decide whether the rest of today gets scattered or directed.`,
      `${dayUsed}% of the day has passed. There is still room to turn a light day into an honest one.`,
      `You started. Good. Now make the next action too small to dodge.`
    ]);
  }

  return pickAwareness("Reflective", [
    `Notice the day without panicking. Then give the next hour one clear purpose.`,
    `${dayUsed}% of today is already written. The rest is still negotiable.`,
    `A comeback does not need a new day. It needs the next useful move.`
  ]);
}

function pickAwareness(tone, messages) {
  return {
    tone,
    message: messages[Math.floor(Math.random() * messages.length)]
  };
}

function showAwareness(awareness) {
  state.currentTone = awareness.tone;
  state.currentMessage = awareness.message;
  els.awarenessMessage.textContent = awareness.message;
  document.body.dataset.tone = awareness.tone.toLowerCase();
  els.awarenessModal.hidden = false;
  document.body.classList.add("has-modal");
}

function closeAwarenessModal() {
  trackEvent("awareness_closed", { tone: state.currentTone });
  els.awarenessModal.hidden = true;
  syncModalLock();
}

function handleJournalSubmit(event) {
  event.preventDefault();
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: new Date().toISOString(),
    longTermGoals: els.longTermGoals.value.trim(),
    dayReflection: els.dayReflection.value.trim(),
    tomorrowGoals: els.tomorrowGoals.value.trim()
  };

  if (!entry.longTermGoals && !entry.dayReflection && !entry.tomorrowGoals) {
    showToast("Write at least one line before saving.");
    return;
  }

  state.journals = [entry, ...state.journals].slice(0, 7);
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(state.journals));
  trackEvent("journal_saved", {
    hasLongTermGoals: Boolean(entry.longTermGoals),
    hasReflection: Boolean(entry.dayReflection),
    hasTomorrowGoals: Boolean(entry.tomorrowGoals)
  });
  renderHistory();
  renderReceipt(getDayStats(new Date()));
  renderRecapStory(getDayStats(new Date()));
  closeFeatureModal("journal");
  showToast("Journal saved. Recap updated.");
}

function renderHistory() {
  if (!state.journals.length) {
    els.historyList.innerHTML = '<p class="empty-state">No journal entries yet. Tonight is the first proof.</p>';
    return;
  }

  els.historyList.innerHTML = state.journals
    .map((entry) => {
      const date = new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(entry.date));
      const text = entry.tomorrowGoals || entry.tomorrowPlan || entry.dayReflection || entry.longTermGoals || entry.currentGoals;
      return `
        <article class="history-item">
          <time datetime="${entry.date}">${escapeHtml(date)}</time>
          <p>${escapeHtml(text)}</p>
        </article>
      `;
    })
    .join("");
}

function renderRecapStory(stats) {
  if (!els.recapDayPercent) {
    return;
  }

  renderDaySlide(stats);
  renderScrollSlide();
  renderGoalsSlide(stats);
  renderTomorrowSlide(stats);
}

// Assigns only real changes: the story is aria-live and tick() renders it every second.
function setText(element, text) {
  if (element.textContent !== text) {
    element.textContent = text;
  }
}

// Slide 1: how much of the usable day is gone, from the settings alone.
function renderDaySlide(stats) {
  const { wakeTime, bedTime } = state.settings;
  const minutes = Math.floor((stats.pastBedtime ? stats.overtimeMs : stats.remainingMs) / 60000);
  setText(els.recapDayPercent, `${Math.round(stats.percent)}%`);
  setText(els.recapDayLeftLabel, stats.pastBedtime ? "Past bedtime by" : "Left before bed");
  setText(els.recapDayLeft, formatPosterMinutes(minutes));
  setText(els.recapDayBedtime, bedTime);
  setText(els.recapDayRange, `Your day runs ${wakeTime} to ${bedTime}, from your settings.`);
}

// Slide 2: one square per half-hour awake, the wasted ones last and grey. They say how
// much went to the feed, not when. No check-in, no squares.
function renderScrollSlide() {
  const logged = isRecapLogged(state.lastRecap);
  els.recapScrollBody.hidden = !logged;
  els.recapScrollLog.hidden = logged;
  if (!logged) {
    setText(els.recapScrollTitle, "No scroll time logged yet.");
    renderHalfHourSquares({ total: 0, wasted: 0 });
    return;
  }

  const split = getDaySplit(state.lastRecap.scrollingMinutes || 0, state.settings.wakeTime, state.settings.bedTime);
  const savedAt = new Date(state.lastRecap.date);
  const hasTime = Boolean(state.lastRecap.date) && !Number.isNaN(savedAt.getTime());
  setText(els.recapScrollTitle, split.wasted > 0 ? `The feed took ${formatPosterMinutes(split.wasted)}.` : "The feed took nothing.");
  setText(els.recapScrollShare, split.share);
  renderHalfHourSquares(getHalfHourSquares(split.usable, split.wasted));
  els.recapScrollSource.hidden = !hasTime;
  setText(els.recapScrollSource, hasTime ? `From your check-in at ${formatClock(savedAt)}.` : "");
}

function getHalfHourSquares(usableMinutes, scrollingMinutes) {
  const total = Math.max(1, Math.round(usableMinutes / 30));
  return { total, wasted: clamp(Math.round(scrollingMinutes / 30), 0, total) };
}

function renderHalfHourSquares({ total, wasted }) {
  const key = `${total}:${wasted}`;
  if (els.recapScrollGrid.dataset.key === key) {
    return;
  }

  els.recapScrollGrid.dataset.key = key;
  els.recapScrollGrid.replaceChildren(
    ...Array.from({ length: total }, (_, index) => {
      const square = document.createElement("span");
      square.className = index >= total - wasted ? "recap-square is-wasted" : "recap-square";
      return square;
    })
  );
  els.recapScrollGrid.setAttribute("aria-label", `${total} squares of 30 minutes for your awake time: ${total - wasted} well used, ${wasted} went to the feed.`);
}

// Slide 3: last night's plan for today, with the user's own score for the day.
function renderGoalsSlide(stats) {
  const logged = isRecapLogged(state.lastRecap);
  const score = getStoredGoalWorkScore();
  const goals = getTodayGoalsForDay(stats.cycleStart);
  const planned = goals.length > 0;
  const listKey = JSON.stringify(goals);

  if (els.recapTodayList.dataset.key !== listKey) {
    els.recapTodayList.dataset.key = listKey;
    els.recapTodayList.replaceChildren(...goals.map(createRecapGoalItem));
  }

  setText(els.recapGoalsTitle, !logged ? "Not rated yet." : planned ? `${score}/10 on today's plan.` : `${score}/10 on your goals.`);
  els.recapTodayList.hidden = !planned;
  els.recapNoPlan.hidden = planned;
  els.recapRating.hidden = !logged;
  setText(els.recapRatingText, logged ? `${getGoalWorkDescriptor(score)}.` : "");
  els.recapGoalsLog.hidden = logged;

  const source = [planned ? "Planned in last night's journal." : "", logged ? "The score is your own rating." : ""].filter(Boolean).join(" ");
  els.recapGoalsSource.hidden = !source;
  setText(els.recapGoalsSource, source);
}

// Slide 4: tomorrow's goals from the journal saved during the recapped day, and the
// long-term goal as the reason. Only saved journals count, never text still in the form.
function renderTomorrowSlide(stats) {
  const goals = getTomorrowGoalsForDay(stats.cycleStart);
  const longTermGoal = getLatestLongTermGoal();
  const key = JSON.stringify([goals, longTermGoal]);
  if (els.recapGoalList.dataset.key === key) {
    return;
  }

  els.recapGoalList.dataset.key = key;
  els.recapGoalList.replaceChildren(...goals.map(createRecapGoalItem));
  els.recapGoalList.hidden = goals.length === 0;
  els.recapUnplanned.hidden = goals.length > 0;
  els.recapLongTermGoal.textContent = longTermGoal;
  els.recapWhy.hidden = !longTermGoal;
  els.showRecapPoster.classList.toggle("primary-button", goals.length > 0);
  els.showRecapPoster.classList.toggle("secondary-button", goals.length === 0);
}

function createRecapGoalItem(goal) {
  const item = document.createElement("li");
  const text = document.createElement("span");
  text.className = "recap-goal-text";
  text.textContent = goal;
  item.append(text);
  return item;
}

// The goals for tomorrow from the newest saved journal whose date passes `inWindow`,
// at most 4.
function getGoalsFromNewestJournal(inWindow) {
  const entry = state.journals
    .filter((item) => {
      const date = new Date(item.date);
      return !Number.isNaN(date.getTime()) && inWindow(date) && String(item.tomorrowGoals || item.tomorrowPlan || "").trim();
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return entry ? splitGoalLines(entry.tomorrowGoals || entry.tomorrowPlan).slice(0, 4) : [];
}

// A journal saved after midnight still belongs to the day being recapped when that day
// crosses midnight, because the day starts at cycleStart, not at 00:00.
function getTomorrowGoalsForDay(cycleStart) {
  return getGoalsFromNewestJournal((date) => date >= cycleStart);
}

// Today's plan: the goals for tomorrow saved in the 24 hours before the day started,
// usually last night's journal. A late owl's journal from after midnight still counts.
function getTodayGoalsForDay(cycleStart) {
  const start = new Date(cycleStart).getTime();
  return getGoalsFromNewestJournal((date) => date.getTime() >= start - 24 * 60 * 60 * 1000 && date.getTime() < start);
}

function getLatestLongTermGoal() {
  const entry = [...state.journals]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .find((item) => String(item.longTermGoals || item.currentGoals || "").trim());

  return entry ? String(entry.longTermGoals || entry.currentGoals).trim() : "";
}

function setActiveRecapSlide(index) {
  const total = els.recapSlides.length;
  if (!total) {
    return;
  }

  activeRecapSlide = clamp(index, 0, total - 1);
  els.recapSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeRecapSlide;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });

  els.recapBars.forEach((bar, barIndex) => {
    bar.classList.toggle("is-complete", barIndex < activeRecapSlide);
    bar.classList.toggle("is-active", barIndex === activeRecapSlide);
  });
}

function handleRecapStoryTap(event) {
  if (event.target instanceof Element && event.target.closest("button, a, input, textarea, select")) {
    return;
  }

  const bounds = els.dayRecapStory.getBoundingClientRect();
  const tapX = event.clientX - bounds.left;

  if (tapX <= bounds.width * 0.38) {
    setActiveRecapSlide(activeRecapSlide - 1);
    return;
  }

  if (tapX >= bounds.width * 0.62) {
    setActiveRecapSlide(activeRecapSlide + 1);
  }
}

function handleRecapStoryKeydown(event) {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setActiveRecapSlide(activeRecapSlide - 1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    setActiveRecapSlide(activeRecapSlide + 1);
  }
}

// Shows the poster at once (with fallback fonts if Archivo is not loaded yet), then
// redraws it once the fonts are in.
function showRecapPosterPanel() {
  els.dayRecapStory.hidden = true;
  els.posterSharePanel.hidden = false;
  trackEvent("recap_share_previewed");
  renderReceipt(getDayStats(new Date()), { force: true });
  return loadPosterFonts().then(() => {
    renderReceipt(getDayStats(new Date()));
  });
}

function hideRecapPosterPanel() {
  els.posterSharePanel.hidden = true;
  els.dayRecapStory.hidden = false;
}

// Where the poster's circle sits. The tests read it, so keep it in step with drawPoster.
const POSTER_CIRCLE = { cx: 320, cy: 996, radius: 240 };
const POSTER_FALLBACK_FONTS = '"Arial Narrow", Arial, sans-serif';
let lastPosterKey = null;

// What the poster shows, or null when the day has no check-in: no check-in, no rank.
function getPosterModel(stats) {
  if (!isRecapLogged(state.lastRecap)) {
    return null;
  }

  const split = getDaySplit(state.lastRecap.scrollingMinutes || 0, state.settings.wakeTime, state.settings.bedTime);
  const start = new Date(stats.cycleStart);
  const pad = (value) => String(value).padStart(2, "0");
  return {
    dateText: formatPosterDate(start),
    fileDate: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    rank: getRank(getStoredGoalWorkScore(), split.wasted),
    split
  };
}

// Draws only while the share panel is open, and only when the poster's data or fonts
// changed, so tick() no longer repaints it every second (B6).
function renderReceipt(stats, options = {}) {
  if (!options.force && els.posterSharePanel.hidden) {
    return false;
  }

  const model = getPosterModel(stats);
  const key = JSON.stringify([model, posterFontsReady]);
  if (!options.force && key === lastPosterKey) {
    return false;
  }

  lastPosterKey = key;
  els.posterEmpty.hidden = Boolean(model);
  els.posterPreview.hidden = !model;
  els.posterShareTitle.textContent = model ? "Poster ready." : "No poster yet.";
  if (!model) {
    posterFile = null;
    posterFilePromise = Promise.resolve(null);
    updateShareButton();
    return false;
  }

  drawPoster(els.receiptCanvas.getContext("2d"), model);
  preparePosterFile(model.fileDate);
  return true;
}

let posterFile = null;
let posterFilePromise = Promise.resolve(null);

// The PNG is made right after each draw, so a tap can share it at once: iOS only lets
// navigator.share run straight from the tap, with no slow work before it.
function preparePosterFile(fileDate) {
  posterFile = null;
  updateShareButton();
  const request = new Promise((resolve) => {
    els.receiptCanvas.toBlob((blob) => {
      resolve(blob ? new File([blob], `dayline-${fileDate}.png`, { type: "image/png" }) : null);
    }, "image/png");
  }).then((file) => {
    // A newer draw may have started meanwhile; only the latest file counts.
    if (posterFilePromise === request) {
      posterFile = file;
      updateShareButton();
    }
    return file;
  });
  posterFilePromise = request;
  return request;
}

function canSharePosterFile() {
  return Boolean(posterFile && navigator.canShare && navigator.canShare({ files: [posterFile] }));
}

function updateShareButton() {
  els.sharePoster.hidden = els.posterPreview.hidden;
  els.sharePoster.disabled = !posterFile;
  els.sharePoster.textContent = canSharePosterFile() ? "Share" : "Save image";
}

// Shares the image alone, with no text or link: Stories and chats take the image as is.
// A cancel does nothing; any other failure saves the image instead.
// A tap while the share sheet is still open does nothing: browsers reject a second
// share with InvalidStateError, which must not count as a failure.
let posterShareOpen = false;

async function sharePoster() {
  if (!posterFile || posterShareOpen) {
    return;
  }

  if (!canSharePosterFile()) {
    downloadReceipt();
    return;
  }

  posterShareOpen = true;
  try {
    await navigator.share({ files: [posterFile] });
    trackEvent("poster_shared");
  } catch (error) {
    if (error && (error.name === "AbortError" || error.name === "InvalidStateError")) {
      return;
    }

    downloadReceipt();
    showToast("Sharing did not work here, so the image was saved instead.");
  } finally {
    posterShareOpen = false;
  }
}

// The 1080x1920 rank poster. Positions follow the mockup's flow: text stays inside
// x 80-1000 and y 280-1440, clear of the Stories interface.
function drawPoster(ctx, model) {
  const { rank, split } = model;
  const left = 80;
  const right = 1000;
  const tint = rank.ink === "#FFFFFF" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)";

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = rank.color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = rank.ink;

  setPosterFont(ctx, '600 38px "Archivo"');
  ctx.fillText(model.dateText, left, 313);

  // The rank, on up to two lines, shrinks until its longest line fits the column.
  let size = 150;
  const widest = () => Math.max(...rank.lines.map((line) => ctx.measureText(line).width));
  setPosterFont(ctx, `900 ${size}px "Archivo Display"`, -0.03 * size);
  while (size > 40 && widest() > right - left) {
    size -= 2;
    setPosterFont(ctx, `900 ${size}px "Archivo Display"`, -0.03 * size);
  }
  const rankTop = 339;
  const step = Math.round((132 * size) / 150);
  const firstBaseline = rankTop + Math.round((116 * size) / 150);
  rank.lines.forEach((line, index) => ctx.fillText(line, left, firstBaseline + index * step));

  // Five-step meter, then "Rank N of 5".
  const meterTop = rankTop + step * rank.lines.length + 22;
  ctx.lineWidth = 3;
  for (let index = 0; index < 5; index += 1) {
    const x = left + index * 64;
    if (index < rank.tier) {
      drawRoundRect(ctx, x, meterTop + 10, 56, 14, 3, rank.ink, null);
    } else {
      drawRoundRect(ctx, x + 1.5, meterTop + 11.5, 53, 11, 1.5, null, rank.ink);
    }
  }
  setPosterFont(ctx, '600 32px "Archivo"');
  ctx.fillStyle = rank.ink;
  ctx.fillText(`Rank ${rank.tier} of 5`, left + 5 * 56 + 4 * 8 + 18, meterTop + 28);

  drawPosterCircle(ctx, split, rank, tint);
  drawPosterNumbers(ctx, split, rank.ink, tint);

  ctx.fillStyle = rank.ink;
  setPosterFont(ctx, '900 60px "Archivo Wordmark"', -0.6);
  ctx.fillText("Dayline", left, 1426);
  setPosterFont(ctx, '500 28px "Archivo"');
  ctx.textAlign = "right";
  ctx.fillText("manda-son.github.io/dayline-app", right, 1426);
  ctx.restore();
}

function setPosterFont(ctx, font, letterSpacingPx = 0) {
  ctx.font = `${font}, ${POSTER_FALLBACK_FONTS}`;
  if ("letterSpacing" in ctx) {
    ctx.letterSpacing = `${letterSpacingPx}px`;
  }
}

// One full circle for the 24 hours, clockwise from 12 o'clock: well used (solid ink),
// wasted (ink stripes) and sleep (the ink at 30%). Sizes, not clock times.
function drawPosterCircle(ctx, split, rank, tint) {
  const { cx, cy, radius } = POSTER_CIRCLE;
  const start = -Math.PI / 2;
  const turn = (minutes) => (minutes / 1440) * Math.PI * 2;
  const usedEnd = start + turn(split.used);
  const wastedEnd = usedEnd + turn(split.wasted);
  const slicePath = (from, to) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, from, to);
    ctx.closePath();
  };

  if (split.used > 0) {
    slicePath(start, usedEnd);
    ctx.fillStyle = rank.ink;
    ctx.fill();
  }

  if (split.sleep > 0) {
    slicePath(wastedEnd, start + Math.PI * 2);
    ctx.fillStyle = tint;
    ctx.fill();
  }

  if (split.wasted > 0) {
    ctx.save();
    slicePath(usedEnd, wastedEnd);
    ctx.clip();
    drawPosterStripes(ctx, cx, cy, radius + 20, 5, 18, rank.ink);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radius - 2.5, 0, Math.PI * 2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = rank.ink;
  ctx.stroke();

  // Gaps in the background colour between slices, drawn over the outline.
  if ([split.used, split.wasted, split.sleep].filter((minutes) => minutes > 0).length >= 2) {
    ctx.strokeStyle = rank.color;
    ctx.lineWidth = 10;
    ctx.lineCap = "butt";
    [start, usedEnd, wastedEnd].forEach((angle) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + (radius + 12) * Math.cos(angle), cy + (radius + 12) * Math.sin(angle));
      ctx.stroke();
    });
  }
}

// Diagonal stripes like CSS repeating-linear-gradient(135deg, ink 0 band, transparent band period).
function drawPosterStripes(ctx, cx, cy, reach, band, period, color) {
  const diagonal = Math.SQRT1_2;
  ctx.strokeStyle = color;
  ctx.lineWidth = band;
  ctx.lineCap = "butt";
  for (let offset = -reach; offset <= reach; offset += period) {
    const middle = offset + band / 2;
    const x = cx + middle * diagonal;
    const y = cy + middle * diagonal;
    ctx.beginPath();
    ctx.moveTo(x - reach * diagonal, y + reach * diagonal);
    ctx.lineTo(x + reach * diagonal, y - reach * diagonal);
    ctx.stroke();
  }
}

// The three numbers, stacked to the right of the circle and centred on it. They always
// add up to 24h; the wasted one carries its share of the usable day in brackets.
function drawPosterNumbers(ctx, split, ink, tint) {
  const x = 616;
  const right = 1000;
  const numberFont = '900 76px "Archivo Numbers"';
  const labelFont = '600 34px "Archivo"';
  const numberLine = 68;
  const shareLine = 38;
  const labelLine = 37;
  const blocks = [
    { value: formatPosterMinutes(split.used), label: "well used", swatch: "solid" },
    { value: formatPosterMinutes(split.wasted), label: "wasted", swatch: "stripes", share: `(${split.share})` },
    { value: formatPosterMinutes(split.sleep), label: "sleep", swatch: "tint" }
  ];

  blocks.forEach((block) => {
    setPosterFont(ctx, numberFont, -2.28);
    block.numberWidth = ctx.measureText(block.value).width;
    if (block.share) {
      setPosterFont(ctx, labelFont);
      block.wrap = x + block.numberWidth + 12 + ctx.measureText(block.share).width > right;
    }
    block.height = numberLine + (block.wrap ? shareLine : 0) + 8 + labelLine;
  });

  let top = POSTER_CIRCLE.cy - (blocks.reduce((sum, block) => sum + block.height, 0) + 40 * (blocks.length - 1)) / 2;
  blocks.forEach((block) => {
    const baseline = top + 60;
    ctx.fillStyle = ink;
    setPosterFont(ctx, numberFont, -2.28);
    ctx.fillText(block.value, x, baseline);

    let labelTop = top + numberLine + 8;
    if (block.share) {
      setPosterFont(ctx, labelFont);
      if (block.wrap) {
        ctx.fillText(block.share, x, baseline + 41);
        labelTop += shareLine;
      } else {
        ctx.fillText(block.share, x + block.numberWidth + 12, baseline);
      }
    }

    drawPosterSwatch(ctx, x + 14, labelTop + labelLine / 2, block.swatch, ink, tint);
    ctx.fillStyle = ink;
    setPosterFont(ctx, labelFont);
    ctx.fillText(block.label, x + 40, labelTop + 30);
    top += block.height + 40;
  });
}

function drawPosterSwatch(ctx, cx, cy, kind, ink, tint) {
  const radius = 14;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  if (kind === "solid" || kind === "tint") {
    ctx.fillStyle = kind === "solid" ? ink : tint;
    ctx.fill();
  } else {
    ctx.save();
    ctx.clip();
    drawPosterStripes(ctx, cx, cy, radius + 6, 3, 8, ink);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 1.5, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = ink;
  ctx.stroke();
  ctx.restore();
}

function drawRoundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function downloadReceipt() {
  const model = getPosterModel(getDayStats(new Date()));
  const link = document.createElement("a");
  link.download = posterFile ? posterFile.name : `dayline-${model ? model.fileDate : new Date().toISOString().slice(0, 10)}.png`;
  link.href = els.receiptCanvas.toDataURL("image/png");
  link.click();
  trackEvent("receipt_saved");
  showToast("Recap poster saved.");
}

async function copyTestReport() {
  const report = buildTestReport();
  try {
    await navigator.clipboard.writeText(report);
    trackEvent("test_report_copied");
    showToast("Test report copied.");
  } catch {
    showToast("Copy failed in this browser.");
  }
}

function buildTestReport() {
  const stats = getDayStats(new Date());
  const counts = state.metrics.counts;
  const latestEvents = state.metrics.events.slice(-8).map((event) => {
    return `- ${event.name} at ${new Date(event.at).toLocaleString()}`;
  });

  return [
    "DAYLINE MVP TEST REPORT",
    `Generated: ${new Date().toLocaleString()}`,
    `Day used: ${Math.round(stats.percent)}%`,
    `Time left: ${stats.remainingShort}`,
    `Recaps completed: ${counts.recap_completed || 0}`,
    `Journals saved: ${counts.journal_saved || 0}`,
    `Recaps saved/shared: ${(counts.receipt_saved || 0) + (counts.poster_shared || 0)}`,
    `Last scrolling input: ${isRecapLogged(state.lastRecap) ? formatScrollTax(state.lastRecap) : "not logged"}`,
    "",
    "Recent events:",
    latestEvents.length ? latestEvents.join("\n") : "- none yet"
  ].join("\n");
}

function getDayStats(now) {
  const { wakeTime, bedTime } = state.settings;
  const active = getActiveCycle(now, wakeTime, bedTime);
  // Someone still up after bedtime is still in the day that just ended. Without
  // this they are told their day "has not started yet" and the recap re-locks.
  const ended = now < active.start ? getEndedCycle(now, wakeTime, bedTime, active) : null;
  const cycle = ended || active;
  const totalMs = cycle.end - cycle.start;
  const elapsedMs = clamp(now - cycle.start, 0, totalMs);
  const remainingMs = clamp(cycle.end - now, 0, totalMs);
  const startsInMs = Math.max(cycle.start - now, 0);
  const timeUntilBedMs = Math.max(cycle.end - now, 0);
  const percent = totalMs ? clamp((elapsedMs / totalMs) * 100, 0, 100) : 0;

  return {
    percent,
    cycleStart: cycle.start,
    dayStarted: now >= cycle.start && now <= cycle.end,
    pastBedtime: Boolean(ended),
    overtimeMs: ended ? Math.max(0, now - ended.end) : 0,
    overtimeLong: ended ? formatDuration(now - ended.end, "long") : "",
    remainingMs,
    elapsedLong: formatDuration(elapsedMs, "long"),
    remainingLong: formatDuration(remainingMs, "long"),
    remainingShort: formatDuration(remainingMs, "short"),
    startsInLong: formatDuration(startsInMs, "long"),
    timeUntilBedLong: formatDuration(timeUntilBedMs, "long"),
    countdownShort: formatDuration(remainingMs, "clock")
  };
}

function getActiveCycle(now, wakeTime, bedTime) {
  const cycles = [-1, 0, 1, 2].map((offset) => buildCycle(now, wakeTime, bedTime, offset));
  const active = cycles.find((cycle) => now >= cycle.start && now <= cycle.end);
  if (active) {
    return active;
  }

  const next = cycles.find((cycle) => cycle.start > now);
  if (next) {
    return next;
  }

  return cycles[cycles.length - 1];
}

// The usable day that ended before `now`, while `now` is in the first half of the
// night after it. The second half of the night belongs to the next day, so an
// early riser still sees "starts in", not "past bedtime".
function getEndedCycle(now, wakeTime, bedTime, nextCycle) {
  const ended = [-1, 0]
    .map((offset) => buildCycle(now, wakeTime, bedTime, offset))
    .filter((cycle) => cycle.end < now)
    .pop();

  if (!ended) {
    return null;
  }

  const nightMidpoint = ended.end.getTime() + (nextCycle.start - ended.end) / 2;
  return now.getTime() < nightMidpoint ? ended : null;
}

function getCurrentCycleStart(now) {
  const starts = [-1, 0, 1]
    .map((offset) => buildCycle(now, state.settings.wakeTime, state.settings.bedTime, offset).start)
    .filter((start) => start <= now);

  return starts.length ? starts[starts.length - 1] : null;
}

function isRecapLogged(recap) {
  if (!recap) {
    return false;
  }

  return Boolean(recap.date) || Number(recap.scrollingMinutes) > 0;
}

function isRecapCurrent(recap, now) {
  if (!recap || !recap.date) {
    return false;
  }

  const recorded = new Date(recap.date);
  if (Number.isNaN(recorded.getTime())) {
    return false;
  }

  const cycleStart = getCurrentCycleStart(now);
  return !cycleStart || recorded >= cycleStart;
}

function expireStaleRecap(now) {
  if (!isRecapLogged(state.lastRecap) || isRecapCurrent(state.lastRecap, now)) {
    return false;
  }

  state.lastRecap = createEmptyRecap();
  localStorage.removeItem(RECAP_KEY);

  if (els.recapModal.hidden) {
    fillRecapForm();
  }

  return true;
}

function buildCycle(now, wakeTime, bedTime, dayOffset) {
  const start = timeOnDate(now, wakeTime, dayOffset);
  let end = timeOnDate(now, bedTime, dayOffset);
  if (end <= start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }
  return { start, end };
}

function timeOnDate(baseDate, time, dayOffset) {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(baseDate);
  result.setDate(result.getDate() + dayOffset);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function formatDuration(ms, style) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (style === "clock") {
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  if (style === "short") {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatMinutesAsWords(totalMinutes) {
  const minutes = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!minutes) {
    return "";
  }

  if (!hours) {
    return `${remainder} min`;
  }

  if (!remainder) {
    return `${hours}h`;
  }

  return `${hours}h ${remainder}m`;
}

// Whether a check-in was made decides "Not logged", never the number itself:
// a logged zero is the best possible answer, not a missing one.
function formatScrollTax(recap) {
  if (!isRecapLogged(recap)) {
    return "Not logged";
  }

  return formatMinutesAsWords(recap.scrollingMinutes) || "0 min";
}

// The poster's five ranks, lowest first. Rename them here; the colour is the poster's
// background for that rank.
const RANKS = [
  { name: "Couch potato", color: "#2E4BFF" },
  { name: "Scroll goblin", color: "#2E4BFF" },
  { name: "Side-quest hero", color: "#FF7A45" },
  { name: "Locked in", color: "#FFD23F" },
  { name: "Final boss", color: "#FFD23F" }
];

// English on purpose, like the rest of the UI: Intl would follow the phone's language.
const POSTER_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const POSTER_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Every 45 minutes of scrolling costs a point, up to 6, so a scroll-free day with no goal
// work still ranks low and a heavy-scroll day can still climb with real work.
function getRank(goalScore, wastedMinutes) {
  const score = goalScore - Math.min(6, Math.floor(wastedMinutes / 45));
  const tier = score <= 0 ? 1 : score <= 3 ? 2 : score <= 5 ? 3 : score <= 7 ? 4 : 5;
  const { name, color } = RANKS[tier - 1];
  const space = name.indexOf(" ");
  const lines = space === -1 ? [name] : [name.slice(0, space), name.slice(space + 1)];
  return { score, tier, name, lines, color, ink: getInk(color) };
}

// Black or white text, whichever reads better on the colour.
function getInk(hex) {
  const value = parseInt(hex.replace("#", ""), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255 > 0.5 ? "#000000" : "#FFFFFF";
}

// Wake-up to bedtime in minutes, crossing midnight when bedtime is earlier on the clock.
// Settings never allow equal times; if they did, buildCycle would make it a 24-hour day.
function getUsableMinutes(wakeTime, bedTime) {
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  return (toMinutes(bedTime) - toMinutes(wakeTime) + 1440) % 1440 || 1440;
}

// The whole 24 hours in three parts that always add up to 1440: well used, wasted
// (the logged scroll time, never more than the usable day) and sleep (bedtime to wake-up).
function getDaySplit(scrollingMinutes, wakeTime, bedTime) {
  const usable = getUsableMinutes(wakeTime, bedTime);
  const sleep = 1440 - usable;
  const wasted = clamp(Math.round(Number(scrollingMinutes) || 0), 0, usable);
  const used = usable - wasted;
  const percent = Math.round((wasted / usable) * 100);
  const share = wasted > 0 && percent === 0 ? "<1%" : `${percent}%`;
  return { usable, sleep, wasted, used, share };
}

function formatClock(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatPosterDate(date) {
  return `${POSTER_DAY_NAMES[date.getDay()]} ${date.getDate()} ${POSTER_MONTH_NAMES[date.getMonth()]}`;
}

function formatPosterMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!hours) {
    return `${remainder} min`;
  }

  return remainder ? `${hours}h ${String(remainder).padStart(2, "0")}m` : `${hours}h`;
}

// Archivo (Open Font License) ships with the app as one variable font. Each family pins
// one width, so the canvas gets that width from a plain font string. A browser that
// ignores the pinned width draws at normal width, which the design allows.
const POSTER_FONT_URL = "fonts/archivo.woff2";
const POSTER_FONTS = [
  { family: "Archivo", stretch: "62% 125%" },
  { family: "Archivo Display", stretch: "116%" },
  { family: "Archivo Numbers", stretch: "96%" },
  { family: "Archivo Wordmark", stretch: "68%" }
];
let posterFontsLoading = null;
let posterFontsReady = false;

// Loads the poster fonts once. Resolves false instead of rejecting, so the poster still
// draws with the fallback fonts; a failed load is tried again next time.
function loadPosterFonts() {
  if (!posterFontsLoading) {
    posterFontsLoading = (async () => {
      try {
        const faces = POSTER_FONTS.map(({ family, stretch }) => new FontFace(family, `url("${POSTER_FONT_URL}") format("woff2")`, { weight: "100 900", stretch }));
        const loaded = await Promise.all(faces.map((face) => face.load()));
        loaded.forEach((face) => document.fonts.add(face));
        posterFontsReady = true;
        return true;
      } catch {
        posterFontsLoading = null;
        return false;
      }
    })();
  }

  return posterFontsLoading;
}

function loadSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return defaultSettings;
  }
}

function loadJournals() {
  try {
    const parsed = JSON.parse(localStorage.getItem(JOURNAL_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createEmptyRecap() {
  return { date: null, scrollingMinutes: 0, goalWorkScore: 5, progressFeeling: "light" };
}

function loadRecap() {
  try {
    return JSON.parse(localStorage.getItem(RECAP_KEY)) || createEmptyRecap();
  } catch {
    return createEmptyRecap();
  }
}

function loadMetrics() {
  const fallback = { counts: {}, events: [] };
  try {
    const parsed = JSON.parse(localStorage.getItem(METRICS_KEY));
    return parsed && parsed.counts && Array.isArray(parsed.events) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function trackEvent(name, details = {}) {
  const event = {
    name,
    details,
    at: new Date().toISOString()
  };
  state.metrics.counts[name] = (state.metrics.counts[name] || 0) + 1;
  state.metrics.events = [...state.metrics.events, event].slice(-60);
  localStorage.setItem(METRICS_KEY, JSON.stringify(state.metrics));
  renderMetrics();
}

function renderMetrics() {
  els.metricRecaps.textContent = String(state.metrics.counts.recap_completed || 0);
  els.metricJournals.textContent = String(state.metrics.counts.journal_saved || 0);
  els.metricReceipts.textContent = String((state.metrics.counts.receipt_saved || 0) + (state.metrics.counts.poster_shared || 0));
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 2600);
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") {
    return;
  }

  navigator.serviceWorker.register("service-worker.js").catch(() => {
    // The POC still works if the browser blocks service workers locally.
  });
}
