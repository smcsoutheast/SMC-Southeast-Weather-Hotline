const ADMIN_USERS = [
  { name: "Justin", role: "Tournament Director", password: "justin2026$" },
  { name: "Ashley", role: "Tournament Operations", password: "ashley2026$" }
];

const STORAGE_KEY = "smcSoutheastWeatherHotlinePhase2Full";
const LEGACY_KEYS = [
  "smcSoutheastWeatherHotlinePhase2",
  "smcSoutheastWeatherHotlinePhase1",
  "smcSoutheastWeatherHotline"
];

const regions = ["Florida", "North Carolina", "South Carolina", "Alabama", "Georgia"];

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
    createVenue("Premier Sports Campus", "Florida", ["Florida Extreme Cup (FL)"], "", "5895 Post Blvd, Lakewood Ranch, FL", "Main athletic trainer tent near tournament headquarters", "Designated shelters and vehicles when instructed by staff", "Follow facility parking signs"),
    createVenue("Wiregrass Ranch Sports Campus", "Florida", ["Gulf Coast Invitational (FL)"], "", "3021 Sports Coast Way, Wesley Chapel, FL", "Athletic trainer station at tournament headquarters", "Designated shelters and vehicles when instructed by staff", "Use posted event parking areas"),
    createVenue("Wesley Chapel District Park", "Florida", ["Gulf Coast Invitational (FL)"], "", "7727 Boyette Rd, Wesley Chapel, FL", "Athletic trainer station near field operations", "Designated shelters and vehicles when instructed by staff", "Use posted event parking areas"),
    createVenue("Florence Soccer Complex", "South Carolina", ["Florence Cup (SC)"], "", "3701 W Palmetto St, Florence, SC", "Athletic trainer station near tournament headquarters", "Designated shelters and vehicles when instructed by staff", "Use posted event parking areas"),
    createVenue("Jack Allen Recreation Complex", "Alabama", ["Alabama Super Cup (AL)", "Alabama President's Day Invitational (AL)"], "", "2616 Modaus Rd SW, Decatur, AL", "Athletic trainer station near tournament headquarters", "Designated shelters and vehicles when instructed by staff", "Use posted event parking areas"),
    createVenue("Carolina Patriots Cup Venue", "North Carolina", ["Carolina Patriots Cup (NC)"], "", "North Carolina", "Athletic trainer station near tournament headquarters", "Designated shelters and vehicles when instructed by staff", "Use posted event parking areas")
  ],
  history: [],
  timeline: [],
  incidents: []
};

let data = loadData();
let adminUnlocked = false;
let currentAdmin = null;

const elements = {
  globalStatus: document.getElementById("globalStatus"),
  stickyStatus: document.getElementById("stickyStatus"),
  stickyStatusText: document.getElementById("stickyStatusText"),
  stickyUpdateText: document.getElementById("stickyUpdateText"),
  lastUpdated: document.getElementById("lastUpdated"),
  globalNote: document.getElementById("globalNote"),
  venueGrid: document.getElementById("venueGrid"),
  timelineList: document.getElementById("timelineList"),
  historyList: document.getElementById("historyList"),
  stateFilter: document.getElementById("stateFilter"),
  eventFilter: document.getElementById("eventFilter"),
  passwordInput: document.getElementById("passwordInput"),
  verifyBtn: document.getElementById("verifyBtn"),
  loginBox: document.getElementById("loginBox"),
  commandCenter: document.getElementById("commandCenter"),
  lockBtn: document.getElementById("lockBtn"),
  fullScreenBtn: document.getElementById("fullScreenBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  globalForm: document.getElementById("globalForm"),
  globalTemplateSelect: document.getElementById("globalTemplateSelect"),
  globalNoteInput: document.getElementById("globalNoteInput"),
  venueForm: document.getElementById("venueForm"),
  adminVenueList: document.getElementById("adminVenueList"),
  newVenueEvents: document.getElementById("newVenueEvents"),
  publicViewForm: document.getElementById("publicViewForm"),
  showCurrentOnly: document.getElementById("showCurrentOnly"),
  currentTournamentSelect: document.getElementById("currentTournamentSelect"),
  adminShieldBtn: document.getElementById("adminShieldBtn"),
  adminDrawer: document.getElementById("adminDrawer"),
  minimizeAdminBtn: document.getElementById("minimizeAdminBtn"),
  adminSessionText: document.getElementById("adminSessionText"),
  timelineForm: document.getElementById("timelineForm"),
  timelineTitleInput: document.getElementById("timelineTitleInput"),
  timelineBodyInput: document.getElementById("timelineBodyInput"),
  incidentForm: document.getElementById("incidentForm"),
  incidentVenueSelect: document.getElementById("incidentVenueSelect"),
  incidentTypeSelect: document.getElementById("incidentTypeSelect"),
  incidentNoteInput: document.getElementById("incidentNoteInput"),
  incidentFileInput: document.getElementById("incidentFileInput"),
  incidentList: document.getElementById("incidentList"),
  clearIncidentsBtn: document.getElementById("clearIncidentsBtn")
};

function safeUUID() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createVenue(name, state, events, map = "", address = "", medical = "", shelter = "", parking = "") {
  return {
    id: safeUUID(),
    name,
    state,
    events,
    status: "green",
    note: "Normal operations.",
    map,
    address,
    medical,
    shelter,
    parking,
    fieldCondition: "Open"
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY) || LEGACY_KEYS.map(key => localStorage.getItem(key)).find(Boolean);
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
    id: venue.id || safeUUID(),
    name: venue.name || "Unnamed Venue",
    state: regions.includes(venue.state) ? venue.state : "Florida",
    events: normalizeEvents(venue),
    status: ["green", "yellow", "red"].includes(venue.status) ? venue.status : "green",
    note: venue.note || "Normal operations.",
    map: venue.map || "",
    address: venue.address || "",
    medical: venue.medical || "",
    shelter: venue.shelter || "",
    parking: venue.parking || "",
    fieldCondition: venue.fieldCondition || "Open"
  }));
  merged.currentTournaments = (saved.currentTournaments || []).filter(event => tournamentOptions.includes(event));
  merged.showCurrentOnly = Boolean(saved.showCurrentOnly);
  merged.history = Array.isArray(saved.history) ? saved.history : [];
  merged.timeline = Array.isArray(saved.timeline) ? saved.timeline : [];
  merged.incidents = Array.isArray(saved.incidents) ? saved.incidents : [];
  merged.globalStatus = calculateGlobalStatus(merged.venues);
  merged.globalNote = saved.globalNote || templates.allClear;
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
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function adminLabel() {
  if (!currentAdmin) return "System";
  return `${currentAdmin.name}, ${currentAdmin.role}`;
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
  data.history.unshift({ title, note, time: nowStamp(), admin: adminLabel() });
  data.history = data.history.slice(0, 75);
}

function addTimeline(title, note) {
  data.timeline.unshift({ title, note, time: nowStamp(), admin: adminLabel() });
  data.timeline = data.timeline.slice(0, 75);
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

function updateIncidentVenueSelect() {
  elements.incidentVenueSelect.innerHTML = data.venues.map(venue => `<option value="${escapeAttr(venue.id)}">${escapeHtml(venue.name)}</option>`).join("");
}

function render() {
  data.globalStatus = calculateGlobalStatus(data.venues);
  updateTournamentSelect(elements.eventFilter, true);
  updateTournamentSelect(elements.newVenueEvents, false);
  updateTournamentSelect(elements.currentTournamentSelect, false, data.currentTournaments);
  updateIncidentVenueSelect();

  elements.showCurrentOnly.checked = data.showCurrentOnly;
  const statusText = `${data.globalStatus.toUpperCase()} STATUS`;
  elements.globalStatus.className = `global-status ${data.globalStatus}`;
  elements.globalStatus.textContent = statusText;
  elements.stickyStatus.className = `sticky-status ${data.globalStatus}`;
  elements.stickyStatusText.textContent = statusText;
  elements.stickyUpdateText.textContent = data.lastUpdated ? `Last updated: ${data.lastUpdated}` : "Last updated: Not yet updated";
  elements.globalNote.textContent = data.globalNote;
  elements.globalNoteInput.value = data.globalNote;
  elements.lastUpdated.textContent = data.lastUpdated ? `Last updated: ${data.lastUpdated}` : "Last updated: Not yet updated";

  renderPublicVenues();
  renderTimeline();
  renderHistory();
  renderAdminVenues();
  renderIncidents();
  updateSessionText();
}

function getPublicVenues() {
  if (!data.showCurrentOnly || !data.currentTournaments.length) return data.venues;
  return data.venues.filter(venue => venue.events.some(event => data.currentTournaments.includes(event)));
}

function getCommandVenues() {
  const selectedState = elements.stateFilter.value;
  const selectedEvents = getSelectedValues(elements.eventFilter);
  const showAllEvents = !selectedEvents.length || selectedEvents.includes("all");
  return data.venues.filter(venue => {
    const regionMatch = selectedState === "all" || venue.state === selectedState;
    const eventMatch = showAllEvents || venue.events.some(event => selectedEvents.includes(event));
    return regionMatch && eventMatch;
  });
}

function renderPublicVenues() {
  const venues = getPublicVenues();
  elements.venueGrid.innerHTML = venues.length ? venues.map(venue => `
    <article class="venue-card ${venue.status}-card">
      <h2>${escapeHtml(venue.name.toUpperCase())}</h2>
      <div class="venue-status-pill ${venue.status}">${venue.status.toUpperCase()}</div>
      <p class="venue-note">${escapeHtml(venue.note || "No current note.")}</p>
    </article>
  `).join("") : `<article class="venue-card empty-card"><h2>NO CURRENT PUBLIC VENUES</h2><p class="venue-note">The command center is set to show current tournaments only, but no venue matches the selected tournaments.</p></article>`;
}

function renderTimeline() {
  elements.timelineList.innerHTML = data.timeline.length ? data.timeline.slice(0, 12).map(item => `
    <div class="history-item">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.time || "Time not recorded")}</span>
      <p>${escapeHtml(item.note || "No details provided.")}</p>
    </div>
  `).join("") : `<p class="muted">No timeline updates yet.</p>`;
}

function renderHistory() {
  elements.historyList.innerHTML = data.history.length ? data.history.slice(0, 18).map(item => `
    <div class="history-item">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.time || "Time not recorded")} | ${escapeHtml(item.admin || "System")}</span>
      <p>${escapeHtml(item.note || "No details provided.")}</p>
    </div>
  `).join("") : `<p class="muted">No status updates have been posted yet.</p>`;
}

function renderAdminVenues() {
  const venues = getCommandVenues();
  elements.adminVenueList.innerHTML = venues.length ? venues.map(venue => `
    <div class="admin-venue-card ${venue.status}-admin-card">
      <h3>${escapeHtml(venue.name)}</h3>
      <label>Venue name</label>
      <input type="text" data-action="name" data-id="${escapeAttr(venue.id)}" value="${escapeAttr(venue.name)}" />
      <label>Region</label>
      <select data-action="state" data-id="${escapeAttr(venue.id)}">
        ${regions.map(state => `<option value="${escapeAttr(state)}" ${venue.state === state ? "selected" : ""}>${escapeHtml(state)}</option>`).join("")}
      </select>
      <label>Status</label>
      <select data-action="status" data-id="${escapeAttr(venue.id)}">
        <option value="green" ${venue.status === "green" ? "selected" : ""}>Green</option>
        <option value="yellow" ${venue.status === "yellow" ? "selected" : ""}>Yellow</option>
        <option value="red" ${venue.status === "red" ? "selected" : ""}>Red</option>
      </select>
      <label>Template</label>
      <select data-action="template" data-id="${escapeAttr(venue.id)}">
        <option value="">Select a template</option>
        <option value="allClear">All clear</option>
        <option value="monitoring">Weather monitoring</option>
        <option value="lightningDelay">Lightning delay</option>
        <option value="heatAdvisory">Heat advisory</option>
        <option value="fieldClosure">Field closure</option>
        <option value="resumePlay">Resume play</option>
      </select>
      <label>Public note</label>
      <textarea rows="3" data-action="note" data-id="${escapeAttr(venue.id)}">${escapeHtml(venue.note || "")}</textarea>
      <label>Tournaments</label>
      <select multiple size="8" data-action="events" data-id="${escapeAttr(venue.id)}">
        ${tournamentOptions.map(event => `<option value="${escapeAttr(event)}" ${venue.events.includes(event) ? "selected" : ""}>${escapeHtml(event)}</option>`).join("")}
      </select>
      <label>Venue address or details</label>
      <input type="text" data-action="address" data-id="${escapeAttr(venue.id)}" value="${escapeAttr(venue.address || "")}" />
      <label>Field condition</label>
      <input type="text" data-action="fieldCondition" data-id="${escapeAttr(venue.id)}" value="${escapeAttr(venue.fieldCondition || "")}" />
      <label>Medical location</label>
      <input type="text" data-action="medical" data-id="${escapeAttr(venue.id)}" value="${escapeAttr(venue.medical || "")}" />
      <label>Shelter instructions</label>
      <input type="text" data-action="shelter" data-id="${escapeAttr(venue.id)}" value="${escapeAttr(venue.shelter || "")}" />
      <label>Parking details</label>
      <input type="text" data-action="parking" data-id="${escapeAttr(venue.id)}" value="${escapeAttr(venue.parking || "")}" />
      <label>Map link</label>
      <input type="url" data-action="map" data-id="${escapeAttr(venue.id)}" value="${escapeAttr(venue.map || "")}" />
      <div class="admin-actions">
        <button data-action="saveVenue" data-id="${escapeAttr(venue.id)}" type="button">Save Venue</button>
        <button class="secondary" data-action="deleteVenue" data-id="${escapeAttr(venue.id)}" type="button">Delete</button>
      </div>
    </div>
  `).join("") : `<p class="muted">No venues match the command center filters.</p>`;
}

function renderIncidents() {
  elements.incidentList.innerHTML = data.incidents.length ? data.incidents.map(incident => `
    <div class="incident-item">
      <strong>${escapeHtml(incident.type)} | ${escapeHtml(incident.venueName)}</strong>
      <span>${escapeHtml(incident.time)} | ${escapeHtml(incident.admin || "System")}</span>
      <p>${escapeHtml(incident.note || "No note entered.")}</p>
      ${incident.files && incident.files.length ? `<ul class="file-list">${incident.files.map(file => `<li><a class="file-link" href="${escapeAttr(file.dataUrl)}" download="${escapeAttr(file.name)}">${escapeHtml(file.name)}</a> <span>(${escapeHtml(formatBytes(file.size))})</span></li>`).join("")}</ul>` : ""}
    </div>
  `).join("") : `<p class="muted">No incidents recorded yet.</p>`;
}

function updateSessionText() {
  elements.adminSessionText.textContent = currentAdmin ? `${currentAdmin.name} | ${currentAdmin.role}` : "Protected command center";
}

function unlockAdmin(user) {
  currentAdmin = user;
  adminUnlocked = true;
  elements.loginBox.classList.add("hidden");
  elements.commandCenter.classList.remove("hidden");
  document.querySelectorAll(".admin-only").forEach(item => item.classList.remove("hidden"));
  addHistory("Admin session opened", `${adminLabel()} unlocked the command center.`);
  saveData();
  render();
}

function lockAdmin() {
  adminUnlocked = false;
  currentAdmin = null;
  elements.commandCenter.classList.add("hidden");
  elements.loginBox.classList.remove("hidden");
  elements.passwordInput.value = "";
  document.body.classList.remove("command-mode");
  elements.fullScreenBtn.textContent = "Full Screen";
  document.querySelectorAll(".admin-only").forEach(item => item.classList.add("hidden"));
  render();
}

function openAdminDrawer() {
  elements.adminDrawer.classList.remove("hidden");
  setTimeout(() => elements.passwordInput.focus(), 50);
}

function minimizeAdminDrawer() {
  elements.adminDrawer.classList.add("hidden");
  document.body.classList.remove("command-mode");
  elements.fullScreenBtn.textContent = "Full Screen";
}

function verifyPassword() {
  const password = elements.passwordInput.value;
  const user = ADMIN_USERS.find(admin => admin.password === password);
  if (!user) {
    alert("Incorrect password.");
    return;
  }
  unlockAdmin({ name: user.name, role: user.role });
}

async function filesToDataUrls(fileList) {
  const files = Array.from(fileList || []);
  return Promise.all(files.map(file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  })));
}

function setAllStatuses(status) {
  const oldStatus = data.globalStatus;
  data.venues = data.venues.map(venue => ({ ...venue, status }));
  data.lastUpdated = nowStamp();
  data.globalNote = status === "green" ? templates.allClear : status === "yellow" ? templates.monitoring : templates.lightningDelay;
  addHistory(`All venues changed to ${titleCaseStatus(status)}`, data.globalNote);
  addTimeline(`All venues ${titleCaseStatus(status)}`, data.globalNote);
  saveData();
  if (status === "red" && oldStatus !== "red") playAlertTone();
  render();
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value = value / 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
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

elements.adminShieldBtn.addEventListener("click", openAdminDrawer);
elements.minimizeAdminBtn.addEventListener("click", minimizeAdminDrawer);
elements.verifyBtn.addEventListener("click", verifyPassword);
elements.passwordInput.addEventListener("keydown", event => {
  if (event.key === "Enter") verifyPassword();
});
elements.lockBtn.addEventListener("click", lockAdmin);
elements.stateFilter.addEventListener("change", render);
elements.eventFilter.addEventListener("change", render);
elements.refreshBtn.addEventListener("click", render);

elements.fullScreenBtn.addEventListener("click", () => {
  document.body.classList.toggle("command-mode");
  elements.fullScreenBtn.textContent = document.body.classList.contains("command-mode") ? "Exit Full Screen" : "Full Screen";
});

elements.globalTemplateSelect.addEventListener("change", () => {
  const value = elements.globalTemplateSelect.value;
  if (value && templates[value]) elements.globalNoteInput.value = templates[value];
});

elements.globalForm.addEventListener("submit", event => {
  event.preventDefault();
  data.globalNote = elements.globalNoteInput.value.trim() || "No current note.";
  data.lastUpdated = nowStamp();
  addHistory("Global note updated", data.globalNote);
  addTimeline("Global note updated", data.globalNote);
  saveData();
  render();
});

elements.timelineForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = elements.timelineTitleInput.value.trim() || "Operations update";
  const note = elements.timelineBodyInput.value.trim();
  if (!note) return alert("Enter a timeline note.");
  data.lastUpdated = nowStamp();
  addTimeline(title, note);
  addHistory(title, note);
  saveData();
  elements.timelineForm.reset();
  render();
});

elements.publicViewForm.addEventListener("submit", event => {
  event.preventDefault();
  data.showCurrentOnly = elements.showCurrentOnly.checked;
  data.currentTournaments = getSelectedValues(elements.currentTournamentSelect).filter(value => tournamentOptions.includes(value));
  data.lastUpdated = nowStamp();
  const note = data.showCurrentOnly ? `Showing current tournaments: ${data.currentTournaments.join(", ") || "None selected"}` : "Showing all venue tournaments.";
  addHistory("Public tournament view updated", note);
  saveData();
  render();
});

elements.venueForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("newVenueName").value.trim();
  const state = document.getElementById("newVenueState").value;
  const events = getSelectedValues(elements.newVenueEvents).filter(value => tournamentOptions.includes(value));
  const address = document.getElementById("newVenueAddress").value.trim();
  const map = document.getElementById("newVenueMap").value.trim();
  if (!name) return alert("Enter a venue name.");
  if (!events.length) return alert("Select at least one tournament.");
  data.venues.push(createVenue(name, state, events, map, address));
  data.lastUpdated = nowStamp();
  addHistory(`Venue added: ${name}`, "Venue added to the Southeast hotline.");
  saveData();
  elements.venueForm.reset();
  render();
});

elements.adminVenueList.addEventListener("change", event => {
  if (event.target.dataset.action !== "template") return;
  const card = event.target.closest(".admin-venue-card");
  const template = templates[event.target.value];
  if (template) card.querySelector('[data-action="note"]').value = template;
});

elements.adminVenueList.addEventListener("click", event => {
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
    venue.address = card.querySelector('[data-action="address"]').value.trim();
    venue.fieldCondition = card.querySelector('[data-action="fieldCondition"]').value.trim();
    venue.medical = card.querySelector('[data-action="medical"]').value.trim();
    venue.shelter = card.querySelector('[data-action="shelter"]').value.trim();
    venue.parking = card.querySelector('[data-action="parking"]').value.trim();
    venue.map = card.querySelector('[data-action="map"]').value.trim();
    data.lastUpdated = nowStamp();
    const note = `${oldName !== venue.name ? `Renamed from ${oldName}. ` : ""}Status: ${titleCaseStatus(venue.status)}. ${venue.note}`;
    addHistory(`${venue.name} saved`, note);
    addTimeline(`${venue.name} ${titleCaseStatus(venue.status)}`, venue.note);
    if (venue.status === "red" && oldStatus !== "red") playAlertTone();
  }

  saveData();
  render();
});

elements.incidentForm.addEventListener("submit", async event => {
  event.preventDefault();
  const venue = data.venues.find(item => item.id === elements.incidentVenueSelect.value);
  const note = elements.incidentNoteInput.value.trim();
  if (!venue) return alert("Select a venue.");
  if (!note) return alert("Enter an incident note.");
  const files = await filesToDataUrls(elements.incidentFileInput.files);
  data.incidents.unshift({
    id: safeUUID(),
    venueId: venue.id,
    venueName: venue.name,
    type: elements.incidentTypeSelect.value,
    note,
    files,
    time: nowStamp(),
    admin: adminLabel()
  });
  data.incidents = data.incidents.slice(0, 75);
  addHistory(`Incident logged: ${venue.name}`, `${elements.incidentTypeSelect.value} incident logged by ${adminLabel()}.`);
  saveData();
  elements.incidentForm.reset();
  render();
});

elements.clearIncidentsBtn.addEventListener("click", () => {
  if (!adminUnlocked) return;
  if (!confirm("Clear incident records from this browser?")) return;
  data.incidents = [];
  addHistory("Incident records cleared", `${adminLabel()} cleared incident records.`);
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

elements.clearHistoryBtn.addEventListener("click", () => {
  if (!adminUnlocked) return;
  if (!confirm("Clear status history?")) return;
  data.history = [];
  saveData();
  render();
});

render();
