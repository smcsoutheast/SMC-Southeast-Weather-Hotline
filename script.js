const ADMIN_PASSWORD = "southeast2026";
const STORAGE_KEY = "smcSoutheastWeatherHotlinePhase2";

const tournamentOptions = [
  "Carolina Patriots Cup (NC)",
  "Florida Extreme Cup (FL)",
  "Florence Cup (SC)",
  "Palm Beach Gardens Classic Fall (FL)",
  "Alabama Super Cup (AL)",
  "Florida Winter Cup Juniors (FL)",
  "Florida Winter Cup & Showcase (FL)",
  "Gulf Coast Invitational (FL)",
  "Alabama President's Day Invitational (AL)",
  "Palm Beach Gardens Classic Spring (FL)",
  "Florida St Paddy's Day Invitational (FL)",
  "Sarasota Cup GIRLS (FL)",
  "Sarasota Cup BOYS (FL)"
];

const templates = {
  allClear: "All venues are currently operating as scheduled. SMC staff will continue to monitor conditions and post updates here as needed.",
  monitoring: "SMC staff are monitoring weather and field conditions. Games remain scheduled unless noted below. Please keep checking this page for updates.",
  lightningDelay: "Lightning has been detected in the area. Games are temporarily suspended. Teams should leave the fields and wait for further instructions from SMC staff.",
  heatAdvisory: "Heat conditions are being monitored. Teams should hydrate, use shade when available, and follow all referee and event staff instructions.",
  fieldClosure: "One or more fields are closed due to weather or facility conditions. SMC staff will post schedule or field updates as soon as they are available.",
  resumePlay: "Play is cleared to resume. Teams should return to their assigned fields and follow referee or field marshal instructions."
};

const defaultData = {
  globalStatus: "green",
  globalNote: templates.allClear,
  lastUpdated: null,
  showCurrentOnly: false,
  currentTournaments: [],
  venues: [
    { id: safeUUID(), name: "Premier Sports Campus", state: "Florida", events: ["Florida Extreme Cup (FL)"], status: "green", note: "Normal operations.", map: "" },
    { id: safeUUID(), name: "Wiregrass Ranch Sports Campus", state: "Florida", events: ["Gulf Coast Invitational (FL)"], status: "green", note: "Normal operations.", map: "" },
    { id: safeUUID(), name: "Wesley Chapel District Park", state: "Florida", events: ["Gulf Coast Invitational (FL)"], status: "green", note: "Normal operations.", map: "" },
    { id: safeUUID(), name: "Florence Soccer Complex", state: "South Carolina", events: ["Florence Cup (SC)"], status: "green", note: "Normal operations.", map: "" },
    { id: safeUUID(), name: "Jack Allen Recreation Complex", state: "Alabama", events: ["Alabama Super Cup (AL)"], status: "green", note: "Normal operations.", map: "" }
  ],
  history: []
};

let data = loadData();
let adminUnlocked = false;

const globalStatus = document.getElementById("globalStatus");
const stickyStatus = document.getElementById("stickyStatus");
const stickyStatusText = document.getElementById("stickyStatusText");
const stickyUpdateText = document.getElementById("stickyUpdateText");
const lastUpdated = document.getElementById("lastUpdated");
const globalNote = document.getElementById("globalNote");
const venueGrid = document.getElementById("venueGrid");
const historyList = document.getElementById("historyList");
const stateFilter = document.getElementById("stateFilter");
const eventFilter = document.getElementById("eventFilter");
const passwordInput = document.getElementById("passwordInput");
const verifyBtn = document.getElementById("verifyBtn");
const loginBox = document.getElementById("loginBox");
const commandCenter = document.getElementById("commandCenter");
const lockBtn = document.getElementById("lockBtn");
const fullScreenBtn = document.getElementById("fullScreenBtn");
const refreshBtn = document.getElementById("refreshBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const globalForm = document.getElementById("globalForm");
const globalTemplateSelect = document.getElementById("globalTemplateSelect");
const globalNoteInput = document.getElementById("globalNoteInput");
const venueForm = document.getElementById("venueForm");
const adminVenueList = document.getElementById("adminVenueList");
const newVenueEvents = document.getElementById("newVenueEvents");
const publicViewForm = document.getElementById("publicViewForm");
const showCurrentOnly = document.getElementById("showCurrentOnly");
const currentTournamentSelect = document.getElementById("currentTournamentSelect");

function safeUUID() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("smcSoutheastWeatherHotlinePhase1");
  if (!saved) return clone(defaultData);
  try {
    return migrateData(JSON.parse(saved));
  } catch {
    return clone(defaultData);
  }
}

function normalizeTournamentName(eventName) {
  const map = {
    "Florida Extreme Cup": "Florida Extreme Cup (FL)",
    "Gulf Coast Invitational": "Gulf Coast Invitational (FL)",
    "Florence Cup": "Florence Cup (SC)",
    "Alabama Super Cup": "Alabama Super Cup (AL)",
    "General": tournamentOptions[0]
  };
  return map[eventName] || eventName || tournamentOptions[0];
}

function normalizeEvents(venue) {
  const rawEvents = Array.isArray(venue.events) ? venue.events : [venue.event];
  const cleanEvents = rawEvents.map(normalizeTournamentName).filter(event => tournamentOptions.includes(event));
  return cleanEvents.length ? [...new Set(cleanEvents)] : [tournamentOptions[0]];
}

function migrateData(saved) {
  const merged = { ...clone(defaultData), ...saved };
  merged.venues = (saved.venues || defaultData.venues).map(venue => ({
    map: "",
    note: "Normal operations.",
    status: "green",
    name: "Unnamed Venue",
    state: "Florida",
    ...venue,
    id: venue.id || safeUUID(),
    events: normalizeEvents(venue)
  }));
  merged.currentTournaments = (saved.currentTournaments || []).filter(event => tournamentOptions.includes(event));
  merged.showCurrentOnly = Boolean(saved.showCurrentOnly);
  merged.history = saved.history || [];
  merged.globalStatus = calculateGlobalStatus(merged.venues);
  return merged;
}

function saveData() {
  data.globalStatus = calculateGlobalStatus(data.venues);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function nowStamp() {
  return new Date().toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function titleCaseStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function calculateGlobalStatus(venues) {
  if (venues.some(venue => venue.status === "red")) return "red";
  if (venues.some(venue => venue.status === "yellow")) return "yellow";
  return "green";
}

function addHistory(title, note) {
  data.history.unshift({ title, note, time: nowStamp() });
  data.history = data.history.slice(0, 75);
}

function playAlertTone() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 720;
    gainNode.gain.value = 0.08;
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 350);
  } catch {
    return;
  }
}

function getSelectedValues(selectElement) {
  return Array.from(selectElement.selectedOptions || []).map(option => option.value);
}

function setSelectedValues(selectElement, values) {
  const selected = new Set(values || []);
  Array.from(selectElement.options).forEach(option => {
    option.selected = selected.has(option.value);
  });
}

function updateTournamentSelect(selectElement, includeAll = false, selectedValues = []) {
  if (!selectElement) return;
  const previous = selectedValues.length ? selectedValues : getSelectedValues(selectElement);
  selectElement.innerHTML = `${includeAll ? '<option value="all">All Tournaments</option>' : ''}${tournamentOptions.map(event => `<option value="${escapeAttr(event)}">${escapeHtml(event)}</option>`).join("")}`;
  if (includeAll && (!previous.length || previous.includes("all"))) {
    selectElement.options[0].selected = true;
  } else {
    setSelectedValues(selectElement, previous.filter(value => value === "all" || tournamentOptions.includes(value)));
  }
}

function render() {
  data.globalStatus = calculateGlobalStatus(data.venues);
  updateTournamentSelect(eventFilter, true);
  updateTournamentSelect(newVenueEvents, false);
  updateTournamentSelect(currentTournamentSelect, false, data.currentTournaments);
  showCurrentOnly.checked = data.showCurrentOnly;

  const statusText = `${data.globalStatus.toUpperCase()} STATUS`;
  globalStatus.className = `global-status ${data.globalStatus}`;
  globalStatus.textContent = statusText;
  stickyStatus.className = `sticky-status ${data.globalStatus}`;
  stickyStatusText.textContent = statusText;
  stickyUpdateText.textContent = data.lastUpdated ? `Last updated: ${data.lastUpdated}` : "Last updated: Not yet updated";
  globalNote.textContent = data.globalNote;
  lastUpdated.textContent = data.lastUpdated ? `Last updated: ${data.lastUpdated}` : "Last updated: Not yet updated";

  const venues = getPublicVenues();
  venueGrid.innerHTML = venues.length ? venues.map(venue => `
    <article class="venue-card ${venue.status}-card">
      <h2>${escapeHtml(venue.name)}</h2>
      <p class="venue-meta">${escapeHtml(venue.state)} | ${escapeHtml(venue.events.join(", "))}</p>
      <div class="global-status ${venue.status}">${venue.status.toUpperCase()}</div>
      <p class="venue-note">${escapeHtml(venue.note || "No current note.")}</p>
      ${venue.map ? `<a class="map-link" href="${escapeAttr(venue.map)}" target="_blank" rel="noopener">Open Map</a>` : ""}
    </article>
  `).join("") : `<article class="venue-card"><h2>No venues are currently posted</h2><p class="venue-note">Please check back for tournament updates.</p></article>`;

  const activeHistory = data.history.filter(item => within72Hours(item.time)).slice(0, 50);
  historyList.innerHTML = activeHistory.length ? activeHistory.map(item => `
    <div class="history-item">
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.note)}</p>
      <span>${escapeHtml(item.time)}</span>
    </div>
  `).join("") : `<p class="muted">No updates posted yet.</p>`;

  globalNoteInput.value = data.globalNote;
  renderAdminVenues();
}

function getPublicVenues() {
  if (!data.showCurrentOnly || !data.currentTournaments.length) return data.venues;
  return data.venues.filter(venue => venue.events.some(event => data.currentTournaments.includes(event)));
}

function getCommandVenues() {
  const selectedState = stateFilter.value;
  const selectedEvents = getSelectedValues(eventFilter);
  const showAllEvents = !selectedEvents.length || selectedEvents.includes("all");
  return data.venues.filter(venue => {
    const regionMatch = selectedState === "all" || venue.state === selectedState;
    const eventMatch = showAllEvents || venue.events.some(event => selectedEvents.includes(event));
    return regionMatch && eventMatch;
  });
}

function within72Hours(timeText) {
  const parsed = Date.parse(timeText);
  if (Number.isNaN(parsed)) return true;
  return Date.now() - parsed <= 72 * 60 * 60 * 1000;
}

function renderAdminVenues() {
  const venues = getCommandVenues();
  adminVenueList.innerHTML = venues.length ? venues.map(venue => `
    <div class="admin-venue-card ${venue.status}-admin-card">
      <h3>${escapeHtml(venue.name)}</h3>
      <label>Venue name</label>
      <input type="text" data-action="name" data-id="${venue.id}" value="${escapeAttr(venue.name)}" />
      <label>Region</label>
      <select data-action="state" data-id="${venue.id}">
        ${["Florida", "South Carolina", "Alabama", "Georgia", "North Carolina"].map(state => `<option value="${escapeAttr(state)}" ${venue.state === state ? "selected" : ""}>${escapeHtml(state)}</option>`).join("")}
      </select>
      <label>Status</label>
      <select data-action="status" data-id="${venue.id}">
        <option value="green" ${venue.status === "green" ? "selected" : ""}>Green</option>
        <option value="yellow" ${venue.status === "yellow" ? "selected" : ""}>Yellow</option>
        <option value="red" ${venue.status === "red" ? "selected" : ""}>Red</option>
      </select>
      <label>Template</label>
      <select data-action="template" data-id="${venue.id}">
        <option value="">Select a template</option>
        <option value="allClear">All clear</option>
        <option value="monitoring">Weather monitoring</option>
        <option value="lightningDelay">Lightning delay</option>
        <option value="heatAdvisory">Heat advisory</option>
        <option value="fieldClosure">Field closure</option>
        <option value="resumePlay">Resume play</option>
      </select>
      <label>Public note</label>
      <textarea rows="3" data-action="note" data-id="${venue.id}">${escapeHtml(venue.note || "")}</textarea>
      <label>Tournaments</label>
      <select multiple size="8" data-action="events" data-id="${venue.id}">
        ${tournamentOptions.map(event => `<option value="${escapeAttr(event)}" ${venue.events.includes(event) ? "selected" : ""}>${escapeHtml(event)}</option>`).join("")}
      </select>
      <label>Map link</label>
      <input type="url" data-action="map" data-id="${venue.id}" value="${escapeAttr(venue.map || "")}" />
      <div class="admin-actions">
        <button data-action="saveVenue" data-id="${venue.id}" type="button">Save Venue</button>
        <button class="secondary" data-action="deleteVenue" data-id="${venue.id}" type="button">Delete</button>
      </div>
    </div>
  `).join("") : `<p class="muted">No venues match the command center filters.</p>`;
}

function unlockAdmin() {
  adminUnlocked = true;
  loginBox.classList.add("hidden");
  commandCenter.classList.remove("hidden");
  document.querySelectorAll(".admin-only").forEach(item => item.classList.remove("hidden"));
}

function lockAdmin() {
  adminUnlocked = false;
  commandCenter.classList.add("hidden");
  loginBox.classList.remove("hidden");
  passwordInput.value = "";
  document.body.classList.remove("command-mode");
  document.querySelectorAll(".admin-only").forEach(item => item.classList.add("hidden"));
}

verifyBtn.addEventListener("click", () => {
  if (passwordInput.value === ADMIN_PASSWORD) unlockAdmin();
  else alert("Incorrect password.");
});

passwordInput.addEventListener("keydown", event => {
  if (event.key === "Enter") verifyBtn.click();
});

lockBtn.addEventListener("click", lockAdmin);
stateFilter.addEventListener("change", render);
eventFilter.addEventListener("change", render);
refreshBtn.addEventListener("click", render);

fullScreenBtn.addEventListener("click", () => {
  document.body.classList.toggle("command-mode");
  fullScreenBtn.textContent = document.body.classList.contains("command-mode") ? "Exit Full Screen" : "Full Screen";
});

globalTemplateSelect.addEventListener("change", () => {
  const value = globalTemplateSelect.value;
  if (value && templates[value]) globalNoteInput.value = templates[value];
});

globalForm.addEventListener("submit", event => {
  event.preventDefault();
  data.globalNote = globalNoteInput.value.trim() || "No current note.";
  data.lastUpdated = nowStamp();
  addHistory("Global note updated", data.globalNote);
  saveData();
  render();
});

publicViewForm.addEventListener("submit", event => {
  event.preventDefault();
  data.showCurrentOnly = showCurrentOnly.checked;
  data.currentTournaments = getSelectedValues(currentTournamentSelect).filter(value => tournamentOptions.includes(value));
  data.lastUpdated = nowStamp();
  addHistory("Public tournament view updated", data.showCurrentOnly ? `Showing current tournaments: ${data.currentTournaments.join(", ") || "None selected"}` : "Showing all venue tournaments.");
  saveData();
  render();
});

venueForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("newVenueName").value.trim();
  const state = document.getElementById("newVenueState").value;
  const events = getSelectedValues(newVenueEvents).filter(value => tournamentOptions.includes(value));
  const map = document.getElementById("newVenueMap").value.trim();
  if (!name) return alert("Enter a venue name.");
  if (!events.length) return alert("Select at least one tournament.");
  data.venues.push({ id: safeUUID(), name, state, events, status: "green", note: "Normal operations.", map });
  data.lastUpdated = nowStamp();
  addHistory(`Venue added: ${name}`, "Venue added to the Southeast hotline.");
  saveData();
  venueForm.reset();
  render();
});

adminVenueList.addEventListener("change", event => {
  if (event.target.dataset.action !== "template") return;
  const card = event.target.closest(".admin-venue-card");
  const template = templates[event.target.value];
  if (template) card.querySelector('[data-action="note"]').value = template;
});

adminVenueList.addEventListener("click", event => {
  if (event.target.tagName !== "BUTTON") return;
  event.preventDefault();
  const id = event.target.dataset.id;
  const action = event.target.dataset.action;
  const venue = data.venues.find(v => v.id === id);
  if (!venue) return;

  if (action === "deleteVenue") {
    if (!confirm(`Delete ${venue.name}?`)) return;
    data.venues = data.venues.filter(v => v.id !== id);
    data.lastUpdated = nowStamp();
    addHistory(`Venue deleted: ${venue.name}`, "Venue removed from the hotline.");
  }

  if (action === "saveVenue") {
    const card = event.target.closest(".admin-venue-card");
    const oldStatus = venue.status;
    const oldName = venue.name;
    venue.name = card.querySelector('[data-action="name"]').value.trim() || "Unnamed Venue";
    venue.state = card.querySelector('[data-action="state"]').value;
    venue.status = card.querySelector('[data-action="status"]').value;
    venue.note = card.querySelector('[data-action="note"]').value.trim() || "No current note.";
    venue.events = getSelectedValues(card.querySelector('[data-action="events"]')).filter(value => tournamentOptions.includes(value));
    if (!venue.events.length) venue.events = [tournamentOptions[0]];
    venue.map = card.querySelector('[data-action="map"]').value.trim();
    data.lastUpdated = nowStamp();
    addHistory(`${venue.name} saved`, `${oldName !== venue.name ? `Renamed from ${oldName}. ` : ""}Status: ${titleCaseStatus(venue.status)}. ${venue.note}`);
    if (venue.status === "red" && oldStatus !== "red") playAlertTone();
  }

  saveData();
  render();
});

document.getElementById("allGreenBtn").addEventListener("click", () => setAllStatuses("green"));
document.getElementById("allYellowBtn").addEventListener("click", () => setAllStatuses("yellow"));
document.getElementById("allRedBtn").addEventListener("click", () => setAllStatuses("red"));
document.getElementById("seedBtn").addEventListener("click", () => {
  if (!confirm("Reset all hotline data to defaults?")) return;
  data = clone(defaultData);
  data.lastUpdated = nowStamp();
  addHistory("Database reset", "Default Southeast venues restored.");
  saveData();
  render();
});

clearHistoryBtn.addEventListener("click", () => {
  if (!adminUnlocked) return;
  if (!confirm("Clear status history?")) return;
  data.history = [];
  saveData();
  render();
});

function setAllStatuses(status) {
  const oldStatus = data.globalStatus;
  data.venues = data.venues.map(venue => ({ ...venue, status }));
  data.lastUpdated = nowStamp();
  data.globalNote = status === "green" ? templates.allClear : status === "yellow" ? templates.monitoring : templates.lightningDelay;
  addHistory(`All venues changed to ${titleCaseStatus(status)}`, data.globalNote);
  saveData();
  if (status === "red" && oldStatus !== "red") playAlertTone();
  render();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value);
}

render();
