// ✅ Firebase Config
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

// 🔹 Helper functions
function getTime() {
  return new Date().toLocaleString();
}

function getDateOnly() {
  return new Date().toISOString().split('T')[0];
}

// 🔹 Time In / Out functions
function timeIn() {
  const name = document.getElementById('name').value.trim();
  if (!name) return alert('Please enter your name');
  const time = getTime();
  const date = getDateOnly();
  db.ref('attendance').push({ name, action: 'IN', time, date });
  alert(`${name} has timed IN successfully.`);
}

function timeOut() {
  const name = document.getElementById('name').value.trim();
  if (!name) return alert('Please enter your name');
  const time = getTime();
  const date = getDateOnly();
  db.ref('attendance').push({ name, action: 'OUT', time, date });
  alert(`${name} has timed OUT successfully.`);
}

// 🔹 Display Logs
function displayLogs(filterDate = null) {
  const log = document.getElementById('log');
  log.innerHTML = '<p>Loading records...</p>';

  db.ref('attendance').once('value').then(snapshot => {
    log.innerHTML = '';

    if (!snapshot.exists()) {
      log.innerHTML = '<p>No records found.</p>';
      return;
    }

    const records = [];
    snapshot.forEach(child => {
      records.push({ id: child.key, ...child.val() });
    });

    // Filter by date if needed
    const filtered = filterDate
      ? records.filter(r => r.date === filterDate)
      : records;

    if (filtered.length === 0) {
      log.innerHTML = `<p>No records found for ${filterDate || 'this date'}.</p>`;
      return;
    }

    // Sort records by time
    filtered.sort((a, b) => new Date(a.time) - new Date(b.time));

    // Build table
    let table = `
      <table>
        <tr>
          <th>Date</th>
          <th>Name</th>
          <th>Action</th>
          <th>Time</th>
        </tr>
    `;

    filtered.forEach(r => {
      table += `
        <tr>
          <td>${r.date}</td>
          <td>${r.name}</td>
          <td>${r.action}</td>
          <td>${r.time}</td>
        </tr>
      `;
    });

    table += '</table>';
    log.innerHTML = table;
  });
}

// 🔹 Event Listeners
document.getElementById('btnIn').addEventListener('click', timeIn);
document.getElementById('btnOut').addEventListener('click', timeOut);
document.getElementById('btnView').addEventListener('click', () => {
  const selectedDate = document.getElementById('datePicker').value;
  if (!selectedDate) return alert('Please select a date');
  displayLogs(selectedDate);
});

// 🔹 Delete Records (with Modal)
const modal = document.getElementById('deleteModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');
let dateToDelete = null;

document.getElementById('btnDelete').addEventListener('click', () => {
  const selectedDate = document.getElementById('datePicker').value;
  if (!selectedDate) return alert('Please select a date first.');
  dateToDelete = selectedDate;
  modal.style.display = 'flex';
});

cancelDelete.addEventListener('click', () => {
  modal.style.display = 'none';
});

confirmDelete.addEventListener('click', () => {
  if (!dateToDelete) return;

  db.ref('attendance').once('value').then(snapshot => {
    snapshot.forEach(child => {
      const record = child.val();
      if (record.date === dateToDelete) {
        db.ref('attendance').child(child.key).remove();
      }
    });

    modal.style.display = 'none';
    alert(`✅ All records for ${dateToDelete} have been deleted.`);
    displayLogs(dateToDelete);
  });
});

window.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});

// 🔹 Load all logs on startup
window.onload = () => displayLogs();
