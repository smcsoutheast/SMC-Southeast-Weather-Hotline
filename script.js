const ADMIN_PASSWORD = "southeast2026";
const STORAGE_KEY = "smcSoutheastWeatherHotlinePhase1";

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
  venues: [
    { id: safeUUID(), name: "Premier Sports Campus", state: "Florida", event: "Florida Extreme Cup", status: "green", note: "Normal operations.", map: "" },
    { id: safeUUID(), name: "Wiregrass Ranch Sports Campus", state: "Florida", event: "Gulf Coast Invitational", status: "green", note: "Normal operations.", map: "" },
    { id: safeUUID(), name: "Wesley Chapel District Park", state: "Florida", event: "Gulf Coast Invitational", status: "green", note: "Normal operations.", map: "" },
    { id: safeUUID(), name: "Florence Soccer Complex", state: "South Carolina", event: "Florence Cup", status: "green", note: "Normal operations.", map: "" },
    { id: safeUUID(), name: "Jack Allen Recreation Complex", state: "Alabama", event: "Alabama Super Cup", status: "green", note: "Normal operations.", map: "" }
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
const globalStatusSelect = document.getElementById("globalStatusSelect");
const globalTemplateSelect = document.getElementById("globalTemplateSelect");
const globalNoteInput = document.getElementById("globalNoteInput");
const venueForm = document.getElementById("venueForm");
const adminVenueList = document.getElementById("adminVenueList");

function safeUUID() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return clone(defaultData);
  try {
    const parsed = JSON.parse(saved);
    return migrateData(parsed);
  } catch {
    return clone(defaultData);
  }
}

function migrateData(saved) {
  const merged = { ...clone(defaultData), ...saved };
  merged.venues = (saved.venues || defaultData.venues).map(venue => ({
    event: "General",
    map: "",
    note: "Normal operations.",
    status: "green",
    ...venue,
    id: venue.id || safeUUID()
  }));
  merged.history = saved.history || [];
  return merged;
}

function saveData() {
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

function updateEventFilterOptions() {
  const currentValue = eventFilter.value;
  const events = [...new Set(data.venues.map(v => v.event || "General"))].sort();
  eventFilter.innerHTML = `<option value="all">All Events</option>` + events.map(event => `<option value="${escapeAttr(event)}">${escapeHtml(event)}</option>`).join("");
  eventFilter.value = events.includes(currentValue) ? currentValue : "all";
}

function render() {
  updateEventFilterOptions();

  const statusText = `${data.globalStatus.toUpperCase()} STATUS`;
  globalStatus.className = `global-status ${data.globalStatus}`;
  globalStatus.textContent = statusText;
  stickyStatus.className = `sticky-status ${data.globalStatus}`;
  stickyStatusText.textContent = statusText;
  stickyUpdateText.textContent = data.lastUpdated ? `Last updated: ${data.lastUpdated}` : "Last updated: Not yet updated";
  globalNote.textContent = data.globalNote;
  lastUpdated.textContent = data.lastUpdated ? `Last updated: ${data.lastUpdated}` : "Last updated: Not yet updated";

  const selectedState = stateFilter.value;
  const selectedEvent = eventFilter.value;
  const venues = data.venues.filter(venue => {
    const regionMatch = selectedState === "all" || venue.state === selectedState;
    const eventMatch = selectedEvent === "all" || venue.event === selectedEvent;
    return regionMatch && eventMatch;
  });

  venueGrid.innerHTML = venues.length ? venues.map(venue => `
    <article class="venue-card ${venue.status}-border">
      <h2>${escapeHtml(venue.name)}</h2>
      <p class="venue-meta">${escapeHtml(venue.state)} | ${escapeHtml(venue.event || "General")}</p>
      <div class="global-status ${venue.status}">${venue.status.toUpperCase()}</div>
      <p class="venue-note">${escapeHtml(venue.note || "No current note.")}</p>
      ${venue.map ? `<a class="map-link" href="${escapeAttr(venue.map)}" target="_blank" rel="noopener">Open Map</a>` : ""}
    </article>
  `).join("") : `<article class="venue-card"><h2>No venues found</h2><p class="venue-note">Adjust the filters or add a venue in the command center.</p></article>`;

  const activeHistory = data.history.filter(item => within72Hours(item.time)).slice(0, 50);
  historyList.innerHTML = activeHistory.length ? activeHistory.map(item => `
    <div class="history-item">
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.note)}</p>
      <span>${escapeHtml(item.time)}</span>
    </div>
  `).join("") : `<p class="muted">No updates posted yet.</p>`;

  globalStatusSelect.value = data.globalStatus;
  globalNoteInput.value = data.globalNote;
  renderAdminVenues();
}

function within72Hours(timeText) {
  const parsed = Date.parse(timeText);
  if (Number.isNaN(parsed)) return true;
  return Date.now() - parsed <= 72 * 60 * 60 * 1000;
}

function renderAdminVenues() {
  adminVenueList.innerHTML = data.venues.map(venue => `
    <div class="admin-venue-card">
      <h3>${escapeHtml(venue.name)}</h3>
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
      <label>Event</label>
      <input type="text" data-action="event" data-id="${venue.id}" value="${escapeAttr(venue.event || "General")}" />
      <label>Map link</label>
      <input type="url" data-action="map" data-id="${venue.id}" value="${escapeAttr(venue.map || "")}" />
      <div class="admin-actions">
        <button data-action="saveVenue" data-id="${venue.id}" type="button">Save Venue</button>
        <button class="secondary" data-action="deleteVenue" data-id="${venue.id}" type="button">Delete</button>
      </div>
    </div>
  `).join("");
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
  if (passwordInput.value === ADMIN_PASSWORD) {
    unlockAdmin();
  } else {
    alert("Incorrect password.");
  }
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
  const oldStatus = data.globalStatus;
  data.globalStatus = globalStatusSelect.value;
  data.globalNote = globalNoteInput.value.trim() || "No current note.";
  data.lastUpdated = nowStamp();
  addHistory(`Global status changed to ${titleCaseStatus(data.globalStatus)}`, data.globalNote);
  if (data.globalStatus === "red" && oldStatus !== "red") playAlertTone();
  saveData();
  render();
});

venueForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("newVenueName").value.trim();
  const state = document.getElementById("newVenueState").value;
  const eventName = document.getElementById("newVenueEvent").value.trim() || "General";
  const map = document.getElementById("newVenueMap").value.trim();
  if (!name) return alert("Enter a venue name.");
  data.venues.push({ id: safeUUID(), name, state, event: eventName, status: "green", note: "Normal operations.", map });
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
    venue.status = card.querySelector('[data-action="status"]').value;
    venue.note = card.querySelector('[data-action="note"]').value.trim() || "No current note.";
    venue.event = card.querySelector('[data-action="event"]').value.trim() || "General";
    venue.map = card.querySelector('[data-action="map"]').value.trim();
    data.lastUpdated = nowStamp();
    addHistory(`${venue.name} changed to ${titleCaseStatus(venue.status)}`, venue.note);
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
  data.globalStatus = status;
  data.venues = data.venues.map(venue => ({ ...venue, status }));
  data.lastUpdated = nowStamp();
  data.globalNote = status === "green" ? templates.allClear : status === "yellow" ? templates.monitoring : templates.lightningDelay;
  addHistory(`All venues changed to ${titleCaseStatus(status)}`, data.globalNote);
  if (status === "red" && oldStatus !== "red") playAlertTone();
  saveData();
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
