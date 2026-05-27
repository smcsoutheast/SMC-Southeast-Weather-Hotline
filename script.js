const ADMIN_PASSWORD = "southeast2026";
const STORAGE_KEY = "smcSoutheastWeatherHotline";

const defaultData = {
  globalStatus: "green",
  globalNote: "All clear. Standard operations in effect.",
  lastUpdated: null,
  venues: [
    { id: crypto.randomUUID(), name: "Premier Sports Campus", state: "Florida", status: "green", note: "Normal operations.", map: "" },
    { id: crypto.randomUUID(), name: "Wiregrass Ranch Sports Campus", state: "Florida", status: "green", note: "Normal operations.", map: "" },
    { id: crypto.randomUUID(), name: "Wesley Chapel District Park", state: "Florida", status: "green", note: "Normal operations.", map: "" },
    { id: crypto.randomUUID(), name: "Florence Soccer Complex", state: "South Carolina", status: "green", note: "Normal operations.", map: "" },
    { id: crypto.randomUUID(), name: "Jack Allen Recreation Complex", state: "Alabama", status: "green", note: "Normal operations.", map: "" }
  ],
  history: []
};

let data = loadData();

const globalStatus = document.getElementById("globalStatus");
const lastUpdated = document.getElementById("lastUpdated");
const globalNote = document.getElementById("globalNote");
const venueGrid = document.getElementById("venueGrid");
const historyList = document.getElementById("historyList");
const stateFilter = document.getElementById("stateFilter");
const passwordInput = document.getElementById("passwordInput");
const verifyBtn = document.getElementById("verifyBtn");
const loginBox = document.getElementById("loginBox");
const commandCenter = document.getElementById("commandCenter");
const lockBtn = document.getElementById("lockBtn");
const globalForm = document.getElementById("globalForm");
const globalStatusSelect = document.getElementById("globalStatusSelect");
const globalNoteInput = document.getElementById("globalNoteInput");
const venueForm = document.getElementById("venueForm");
const adminVenueList = document.getElementById("adminVenueList");

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultData);
  try {
    return JSON.parse(saved);
  } catch {
    return structuredClone(defaultData);
  }
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
  data.history = data.history.slice(0, 25);
}

function render() {
  globalStatus.className = `global-status ${data.globalStatus}`;
  globalStatus.textContent = `${data.globalStatus.toUpperCase()} STATUS`;
  globalNote.textContent = data.globalNote;
  lastUpdated.textContent = data.lastUpdated ? `Last updated: ${data.lastUpdated}` : "Last updated: Not yet updated";

  const selectedState = stateFilter.value;
  const venues = selectedState === "all" ? data.venues : data.venues.filter(v => v.state === selectedState);

  venueGrid.innerHTML = venues.map(venue => `
    <article class="venue-card ${venue.status}-border">
      <h2>${venue.name}</h2>
      <p class="venue-meta">${venue.state}</p>
      <div class="global-status ${venue.status}">${venue.status.toUpperCase()}</div>
      <p class="venue-note">${venue.note || "No current note."}</p>
      ${venue.map ? `<a class="map-link" href="${venue.map}" target="_blank" rel="noopener">Open Map</a>` : ""}
    </article>
  `).join("");

  historyList.innerHTML = data.history.length ? data.history.map(item => `
    <div class="history-item">
      <strong>${item.title}</strong>
      <p>${item.note}</p>
      <span>${item.time}</span>
    </div>
  `).join("") : `<p class="muted">No updates posted yet.</p>`;

  globalStatusSelect.value = data.globalStatus;
  globalNoteInput.value = data.globalNote;
  renderAdminVenues();
}

function renderAdminVenues() {
  adminVenueList.innerHTML = data.venues.map(venue => `
    <div class="admin-venue-card">
      <h3>${venue.name}</h3>
      <label>Status</label>
      <select data-action="status" data-id="${venue.id}">
        <option value="green" ${venue.status === "green" ? "selected" : ""}>Green</option>
        <option value="yellow" ${venue.status === "yellow" ? "selected" : ""}>Yellow</option>
        <option value="red" ${venue.status === "red" ? "selected" : ""}>Red</option>
      </select>
      <label>Public note</label>
      <textarea rows="3" data-action="note" data-id="${venue.id}">${venue.note || ""}</textarea>
      <label>Map link</label>
      <input type="url" data-action="map" data-id="${venue.id}" value="${venue.map || ""}" />
      <div class="admin-actions">
        <button data-action="saveVenue" data-id="${venue.id}">Save Venue</button>
        <button class="secondary" data-action="deleteVenue" data-id="${venue.id}">Delete</button>
      </div>
    </div>
  `).join("");
}

verifyBtn.addEventListener("click", () => {
  if (passwordInput.value === ADMIN_PASSWORD) {
    loginBox.classList.add("hidden");
    commandCenter.classList.remove("hidden");
  } else {
    alert("Incorrect password.");
  }
});

lockBtn.addEventListener("click", () => {
  commandCenter.classList.add("hidden");
  loginBox.classList.remove("hidden");
  passwordInput.value = "";
});

stateFilter.addEventListener("change", render);

globalForm.addEventListener("submit", event => {
  event.preventDefault();
  data.globalStatus = globalStatusSelect.value;
  data.globalNote = globalNoteInput.value.trim() || "No current note.";
  data.lastUpdated = nowStamp();
  addHistory(`Global status changed to ${titleCaseStatus(data.globalStatus)}`, data.globalNote);
  saveData();
  render();
});

venueForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("newVenueName").value.trim();
  const state = document.getElementById("newVenueState").value;
  const map = document.getElementById("newVenueMap").value.trim();
  if (!name) return alert("Enter a venue name.");
  data.venues.push({ id: crypto.randomUUID(), name, state, status: "green", note: "Normal operations.", map });
  data.lastUpdated = nowStamp();
  addHistory(`Venue added: ${name}`, "Venue added to the Southeast hotline.");
  saveData();
  venueForm.reset();
  render();
});

adminVenueList.addEventListener("click", event => {
  if (event.target.tagName !== "BUTTON") return;
  event.preventDefault();
  const id = event.target.dataset.id;
  const action = event.target.dataset.action;
  const venue = data.venues.find(v => v.id === id);
  if (!venue) return;

  if (action === "deleteVenue") {
    data.venues = data.venues.filter(v => v.id !== id);
    data.lastUpdated = nowStamp();
    addHistory(`Venue deleted: ${venue.name}`, "Venue removed from the hotline.");
  }

  if (action === "saveVenue") {
    const card = event.target.closest(".admin-venue-card");
    venue.status = card.querySelector('[data-action="status"]').value;
    venue.note = card.querySelector('[data-action="note"]').value.trim() || "No current note.";
    venue.map = card.querySelector('[data-action="map"]').value.trim();
    data.lastUpdated = nowStamp();
    addHistory(`${venue.name} changed to ${titleCaseStatus(venue.status)}`, venue.note);
  }

  saveData();
  render();
});

document.getElementById("allGreenBtn").addEventListener("click", () => setAllStatuses("green"));
document.getElementById("allYellowBtn").addEventListener("click", () => setAllStatuses("yellow"));
document.getElementById("allRedBtn").addEventListener("click", () => setAllStatuses("red"));
document.getElementById("seedBtn").addEventListener("click", () => {
  if (!confirm("Reset all hotline data to defaults?")) return;
  data = structuredClone(defaultData);
  data.lastUpdated = nowStamp();
  addHistory("Database reset", "Default Southeast venues restored.");
  saveData();
  render();
});

function setAllStatuses(status) {
  data.globalStatus = status;
  data.venues = data.venues.map(venue => ({ ...venue, status }));
  data.lastUpdated = nowStamp();
  data.globalNote = status === "green" ? "All clear. Standard operations in effect." : status === "yellow" ? "SMC staff are actively monitoring weather and field conditions." : "Games are delayed, suspended, or cancelled until further notice.";
  addHistory(`All venues changed to ${titleCaseStatus(status)}`, data.globalNote);
  saveData();
  render();
}

render();
