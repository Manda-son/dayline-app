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
  showRecapPoster: document.querySelector("#showRecapPoster"),
  hideRecapPoster: document.querySelector("#hideRecapPoster"),
  recapStoryPercent: document.querySelector("#recapStoryPercent"),
  recapStoryVerdict: document.querySelector("#recapStoryVerdict"),
  recapStoryRoute: document.querySelector("#recapStoryRoute"),
  recapStoryTimeLeft: document.querySelector("#recapStoryTimeLeft"),
  recapStoryPace: document.querySelector("#recapStoryPace"),
  recapStoryScroll: document.querySelector("#recapStoryScroll"),
  recapStoryScrollNote: document.querySelector("#recapStoryScrollNote"),
  recapStoryTaxFill: document.querySelector("#recapStoryTaxFill"),
  recapStoryGoalScore: document.querySelector("#recapStoryGoalScore"),
  recapStoryGoalDescriptor: document.querySelector("#recapStoryGoalDescriptor"),
  recapStoryGoalFill: document.querySelector("#recapStoryGoalFill"),
  recapStoryMessage: document.querySelector("#recapStoryMessage"),
  recapStoryTomorrow: document.querySelector("#recapStoryTomorrow"),
  downloadReceipt: document.querySelector("#downloadReceipt"),
  copyReceipt: document.querySelector("#copyReceipt"),
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
  els.downloadReceipt.addEventListener("click", downloadReceipt);
  els.copyReceipt.addEventListener("click", copyReceiptText);
  els.copyTestReport.addEventListener("click", copyTestReport);
  els.recapPrev.addEventListener("click", () => setActiveRecapSlide(activeRecapSlide - 1));
  els.recapNext.addEventListener("click", () => setActiveRecapSlide(activeRecapSlide + 1));
  els.dayRecapStory.addEventListener("click", handleRecapStoryTap);
  els.dayRecapStory.addEventListener("keydown", handleRecapStoryKeydown);
  els.showRecapPoster.addEventListener("click", showRecapPosterPanel);
  els.hideRecapPoster.addEventListener("click", hideRecapPosterPanel);
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
  document.body.classList.remove("has-modal");
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
  document.body.classList.remove("has-modal");
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

function renderGoalReminder() {
  const goals = getTodayGoalsFromLastNight();

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

function getTodayGoalsFromLastNight() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);
  const todaysGoalsEntry = state.journals.find((entry) => {
    const date = new Date(entry.date);
    return date >= yesterdayStart && date < todayStart && (entry.tomorrowGoals || entry.tomorrowPlan);
  });

  if (!todaysGoalsEntry) {
    return [];
  }

  return splitGoalLines(todaysGoalsEntry.tomorrowGoals || todaysGoalsEntry.tomorrowPlan).slice(0, 4);
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
  document.body.classList.remove("has-modal");
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
  if (!els.recapStoryPercent) {
    return;
  }

  const latest = getDraftJournal();
  const dayPercent = Math.round(stats.percent);
  const logged = isRecapLogged(state.lastRecap);
  const scrollMinutes = state.lastRecap.scrollingMinutes || 0;
  const goalScore = getStoredGoalWorkScore();
  const verdict = getReceiptVerdict(stats, state.lastRecap);
  const scrollText = formatScrollTax(state.lastRecap);
  const scrollFill = Math.min(100, Math.round((scrollMinutes / 360) * 100));
  const pace = stats.pastBedtime
    ? "Past bedtime"
    : dayPercent >= 80 ? "Final stretch" : dayPercent >= 55 ? "Middle heat" : "Early window";
  const message = state.currentMessage || "You still have time. Spend it like it counts.";
  const tomorrow = latest.tomorrowGoals || "Tomorrow is still unclaimed.";

  els.recapStoryPercent.textContent = `${dayPercent}%`;
  els.recapStoryVerdict.textContent = verdict.subtitle;
  els.recapStoryRoute.style.width = `${dayPercent}%`;
  els.recapStoryTimeLeft.textContent = stats.remainingShort;
  els.recapStoryPace.textContent = pace;
  els.recapStoryScroll.textContent = scrollText;
  els.recapStoryScrollNote.textContent = logged
    ? `${scrollMinutes} minutes pulled out of the day.`
    : "Run a reality check to turn the recap into a real score.";
  els.recapStoryTaxFill.style.width = `${scrollFill}%`;
  // No reality check, no score: never present the slider's default as the user's answer.
  els.recapStoryGoalScore.textContent = logged ? String(goalScore) : "\u2013";
  els.recapStoryGoalDescriptor.textContent = logged ? getGoalWorkDescriptor(goalScore) : "No score without a reality check.";
  els.recapStoryGoalFill.style.width = logged ? `${goalScore * 10}%` : "0%";
  els.recapStoryMessage.textContent = message;
  els.recapStoryTomorrow.textContent = tomorrow;
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

function showRecapPosterPanel() {
  renderReceipt(getDayStats(new Date()));
  els.dayRecapStory.hidden = true;
  els.posterSharePanel.hidden = false;
  trackEvent("recap_share_previewed");
}

function hideRecapPosterPanel() {
  els.posterSharePanel.hidden = true;
  els.dayRecapStory.hidden = false;
}

function renderReceipt(stats) {
  const canvas = els.receiptCanvas;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const dayPercent = Math.round(stats.percent);
  const logged = isRecapLogged(state.lastRecap);
  const scrollText = formatScrollTax(state.lastRecap);
  const verdict = getReceiptVerdict(stats, state.lastRecap);
  const productivityScore = getProductivityScore(stats, state.lastRecap);
  const feedback = logged
    ? getPosterFeedback(stats, state.lastRecap, productivityScore)
    : "No reality check yet. Run one to put an honest score on today.";

  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = "left";
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#0f171d");
  bg.addColorStop(0.46, "#183039");
  bg.addColorStop(0.78, "#2b2420");
  bg.addColorStop(1, "#080d12");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.38;
  ctx.strokeStyle = "#f0bc67";
  ctx.lineWidth = 3;
  for (let i = -1; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-120, 260 + i * 240);
    ctx.lineTo(width + 140, -40 + i * 240);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  drawRoundRect(ctx, 64, 64, width - 128, height - 128, 42, "rgba(246, 241, 232, 0.94)");
  drawRoundRect(ctx, 92, 92, width - 184, height - 184, 26, "#101820");

  drawRoundRect(ctx, 130, 130, 250, 58, 29, "rgba(240, 188, 103, 0.16)", "rgba(240, 188, 103, 0.6)");
  ctx.fillStyle = "#f0bc67";
  ctx.font = "900 28px Arial";
  ctx.fillText("DAYLINE", 164, 169);

  ctx.fillStyle = "#b8c2bf";
  ctx.font = "700 28px Arial";
  ctx.textAlign = "right";
  // The day being recapped, not the calendar date: after midnight they differ.
  ctx.fillText(formatDate(stats.cycleStart), width - 130, 169);
  ctx.textAlign = "left";

  ctx.fillStyle = "#f6f1e8";
  ctx.font = "900 66px Arial";
  ctx.fillText(verdict.title, 130, 270);

  ctx.fillStyle = "#b8c2bf";
  ctx.font = "700 30px Arial";
  ctx.fillText(verdict.subtitle, 130, 315);

  ctx.fillStyle = "#f6f1e8";
  ctx.font = "900 210px Arial";
  ctx.fillText(`${dayPercent}%`, 122, 540);

  ctx.fillStyle = "#b8c2bf";
  ctx.font = "900 32px Arial";
  ctx.fillText("OF YOUR USABLE DAY IS GONE", 135, 598);

  drawRoundRect(ctx, 135, 645, 810, 36, 18, "rgba(246, 241, 232, 0.14)");
  const fillWidth = Math.max(24, Math.min(810, (dayPercent / 100) * 810));
  const bar = ctx.createLinearGradient(135, 645, 945, 645);
  bar.addColorStop(0, "#79a7d3");
  bar.addColorStop(0.58, "#f0bc67");
  bar.addColorStop(1, "#ec7357");
  drawRoundRect(ctx, 135, 645, fillWidth, 36, Math.min(18, fillWidth / 2), bar);

  drawReceiptCard(ctx, 130, 730, 390, 155, "SCROLL TAX", scrollText, "#ec7357");
  drawReceiptCard(ctx, 560, 730, 390, 155, "PRODUCTIVITY", logged ? `${productivityScore}/100` : "Not logged", "#b7d67d");

  drawRoundRect(ctx, 130, 930, 820, 245, 24, "rgba(246, 241, 232, 0.08)", "rgba(246, 241, 232, 0.16)");
  ctx.fillStyle = "#f0bc67";
  ctx.font = "900 28px Arial";
  ctx.fillText("HONEST FEEDBACK", 165, 980);
  wrapCanvasText(ctx, feedback, 165, 1038, 745, 43, "#f6f1e8", "850 34px Arial", 4);

  // Keep the footer inside the inner panel. The panel ends at y=1258 and the
  // outer frame at y=1286, so anything drawn near y=1300 lands on the raw
  // background outside the card and reads as clipped.
  ctx.fillStyle = "#b8c2bf";
  ctx.font = "800 25px Arial";
  ctx.fillText("Dayline - Time Awareness", 130, 1218);
  ctx.textAlign = "right";
  ctx.fillStyle = "#f0bc67";
  ctx.fillText("Post the proof.", width - 130, 1218);
  ctx.textAlign = "left";
}

function drawReceiptCard(ctx, x, y, width, height, label, value, color) {
  drawRoundRect(ctx, x, y, width, height, 28, "rgba(246, 241, 232, 0.08)", "rgba(246, 241, 232, 0.18)");
  ctx.fillStyle = color;
  ctx.font = "900 27px Arial";
  ctx.fillText(label, x + 34, y + 52);
  ctx.fillStyle = "#f6f1e8";
  ctx.font = "900 56px Arial";
  ctx.fillText(value, x + 34, y + 118);
}

function getReceiptVerdict(stats, recap) {
  const dayUsed = Math.round(stats.percent);
  const scrollingMinutes = recap.scrollingMinutes || 0;
  const progressFeeling = recap.progressFeeling || "none";

  if (scrollingMinutes >= 360) {
    return {
      title: "Today Got Expensive",
      subtitle: "A public little invoice for the scroll tax."
    };
  }

  if (scrollingMinutes >= 180 || (dayUsed >= 70 && progressFeeling === "none")) {
    return {
      title: "Comeback Window",
      subtitle: "The day is wounded, not dead."
    };
  }

  if (progressFeeling === "solid" && scrollingMinutes < 90) {
    return {
      title: "Day Still Yours",
      subtitle: "Proof that the scroll did not win this round."
    };
  }

  return {
    title: "Day Recap",
    subtitle: "A story of where today went."
  };
}

function getProductivityScore(stats, recap) {
  const goalWorkScore = Number.isFinite(Number.parseInt(recap.goalWorkScore, 10))
    ? Number.parseInt(recap.goalWorkScore, 10)
    : getScoreFromProgressFeeling(recap.progressFeeling || "light");
  const scrollingMinutes = recap.scrollingMinutes || 0;
  const scrollPenalty = Math.min(42, Math.round(scrollingMinutes / 10));
  const lateLowProgressPenalty = stats.percent >= 75 && goalWorkScore <= 3 ? 12 : 0;

  return clamp(Math.round(goalWorkScore * 10 - scrollPenalty - lateLowProgressPenalty), 0, 100);
}

function getPosterFeedback(stats, recap, productivityScore) {
  const dayUsed = Math.round(stats.percent);
  const scrollingMinutes = recap.scrollingMinutes || 0;

  if (productivityScore >= 80) {
    return "Strong day. You protected the important work and kept the scroll from owning the scoreboard.";
  }

  if (productivityScore >= 60) {
    return "Solid day. There was drift, but the important work still got enough oxygen to count.";
  }

  if (productivityScore >= 40) {
    return `${dayUsed}% of the day is gone. Mixed result: some effort showed up, but the scroll took too much space.`;
  }

  if (scrollingMinutes >= 240) {
    return "Hard truth: the scroll got paid first. Tomorrow needs fewer promises and one protected work block.";
  }

  return "This was a low-output day. Do not dramatize it. Make the next block smaller, clearer, and harder to dodge.";
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

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, color, font, maxLines = 4) {
  ctx.font = font;
  ctx.fillStyle = color;
  const words = String(text).split(/\s+/).filter(Boolean);
  let line = "";
  let lineCount = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
      line = word;
      lineCount += 1;
      if (lineCount === maxLines) {
        ctx.fillText("...", x, y + lineCount * lineHeight);
        return;
      }
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, y + lineCount * lineHeight);
  }
}

function getDraftJournal() {
  return {
    longTermGoals: els.longTermGoals.value.trim() || state.journals[0]?.longTermGoals || state.journals[0]?.currentGoals || "",
    dayReflection: els.dayReflection.value.trim() || state.journals[0]?.dayReflection || "",
    tomorrowGoals: els.tomorrowGoals.value.trim() || state.journals[0]?.tomorrowGoals || state.journals[0]?.tomorrowPlan || ""
  };
}

function downloadReceipt() {
  const link = document.createElement("a");
  link.download = `dayline-recap-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = els.receiptCanvas.toDataURL("image/png");
  link.click();
  trackEvent("receipt_saved");
  showToast("Recap poster saved.");
}

async function copyReceiptText() {
  const stats = getDayStats(new Date());
  const logged = isRecapLogged(state.lastRecap);
  const scroll = logged ? formatScrollTax(state.lastRecap) : "not logged";
  const productivity = logged ? `${getProductivityScore(stats, state.lastRecap)}/100` : "not logged";
  const text = [
    `Dayline wrapped my day: ${Math.round(stats.percent)}% of my usable day is gone.`,
    `Scroll tax: ${scroll}. Productivity score: ${productivity}.`,
    "Would you share your day recap?"
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    trackEvent("receipt_text_copied");
    showToast("Recap caption copied.");
  } catch {
    showToast("Copy failed in this browser. The recap poster still works.");
  }
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
    `Recaps saved/copied: ${(counts.receipt_saved || 0) + (counts.receipt_text_copied || 0)}`,
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
  els.metricReceipts.textContent = String((state.metrics.counts.receipt_saved || 0) + (state.metrics.counts.receipt_text_copied || 0));
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
