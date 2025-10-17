// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGS5r_ZgLKxoqzQR1XiZac1sMFyjJVBCM",
  authDomain: "employeetrac-d54e0.firebaseapp.com",
  databaseURL: "https://employeetrac-d54e0-default-rtdb.firebaseio.com",
  projectId: "employeetrac-d54e0",
  storageBucket: "employeetrac-d54e0.firebasestorage.app",
  messagingSenderId: "188113067539",
  appId: "1:188113067539:web:44146b8e0c31c300b969e6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// =======================
// 📅 Helper functions
// =======================
function getTime() {
  return new Date().toLocaleString();
}

function getDateOnly() {
  return new Date().toISOString().split("T")[0];
}

// =======================
// 🕒 Time In / Time Out
// =======================
function timeIn() {
  const name = document.getElementById("name").value.trim();
  if (!name) return alert("Please enter your name");
  const time = getTime();
  const date = getDateOnly();
  saveToFirebase(name, "IN", time, date);
}

function timeOut() {
  const name = document.getElementById("name").value.trim();
  if (!name) return alert("Please enter your name");
  const time = getTime();
  const date = getDateOnly();
  saveToFirebase(name, "OUT", time, date);
}

// =======================
// 💾 Save to Firebase
// =======================
function saveToFirebase(name, action, time, date) {
  db.ref("attendance")
    .push({ name, action, time, date })
    .then(() => {
      alert(`${action} recorded for ${name}`);
    })
    .catch((error) => console.error("Error:", error));
}

// =======================
// 📋 Display Logs
// =======================
function displayLogs(filterDate = null) {
  const log = document.getElementById("log");
  log.innerHTML = "<p>Loading...</p>";

  db.ref("attendance").on("value", (snapshot) => {
    log.innerHTML = "";

    if (!snapshot.exists()) {
      log.innerHTML = "<p>No records found.</p>";
      return;
    }

    const records = [];
    snapshot.forEach((child) => {
      records.push(child.val());
    });

    // Filter by date if selected
    const filtered = filterDate
      ? records.filter((r) => r.date === filterDate)
      : records;

    if (filtered.length === 0) {
      log.innerHTML = "<p>No records found for this date.</p>";
      return;
    }

    // ✅ Sort properly by date + time
    filtered.sort(
      (a, b) =>
        new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
    );

    // ✅ Build one complete table
    let table = `
      <table border="1" cellpadding="8" cellspacing="0" style="margin-top:10px;width:100%;border-collapse:collapse;">
        <thead style="background:#007bff;color:white;">
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Action</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
    `;

    filtered.forEach((r) => {
      table += `
        <tr>
          <td>${r.date}</td>
          <td>${r.name}</td>
          <td>${r.action}</td>
          <td>${r.time}</td>
        </tr>
      `;
    });

    table += `</tbody></table>`;
    log.innerHTML = table;
  });
}

// =======================
// ⚙️ Event listeners
// =======================
document.getElementById("btnIn").addEventListener("click", timeIn);
document.getElementById("btnOut").addEventListener("click", timeOut);
document.getElementById("btnView").addEventListener("click", () => {
  const selectedDate = document.getElementById("datePicker").value;
  if (!selectedDate) return alert("Please select a date");
  displayLogs(selectedDate);
});

// =======================
// 🚀 Load all logs on start
// =======================
window.onload = () => displayLogs();
