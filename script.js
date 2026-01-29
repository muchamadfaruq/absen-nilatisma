// Ganti dengan URL API Google Apps Script Anda yang sudah di-deploy
const API_URL = 'https://script.google.com/macros/s/AKfycbx3JeBVAWx44odePj1tWXnbo7_SwSTKD-MCb3DGquSTQx-9sHHlFLIAkUn8f9RBh9eU/exec'; 

// --- Variabel DOM ---
const loginForm = document.getElementById('login-form');
const loginView = document.getElementById('login-view');
const dashboard = document.getElementById('dashboard');
const messageDiv = document.getElementById('message');
const welcomeMessage = document.getElementById('welcome-message');
const userNip = document.getElementById('user-nip');
const userRole = document.getElementById('user-role');
const loginButton = document.getElementById('login-button');
const absenForm = document.getElementById('absen-form');
const absenMessageDiv = document.getElementById('absen-message');
const absenButton = document.getElementById('absen-button');


// --- Fungsi Utilitas ---

function displayMessage(divElement, text, isSuccess) {
    divElement.textContent = text;
    divElement.className = `${isSuccess ? 'success' : 'error'}`;
}

function saveUserData(data) {
    localStorage.setItem('userNIP', data.nip);
    localStorage.setItem('userName', data.nama);
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('token', data.token); 
}

function loadDashboard() {
    const nip = localStorage.getItem('userNIP');
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    if (nip && token) {
        welcomeMessage.textContent = `Selamat Datang, ${name} (${role})!`;
        userNip.textContent = nip;
        userRole.textContent = role;

        loginView.style.display = 'none';
        dashboard.style.display = 'block';
    } else {
        loginView.style.display = 'block';
        dashboard.style.display = 'none';
    }
}

// --- Logika Login (MENGGUNAKAN GET) ---

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nipInput = document.getElementById('nip').value;
    const passwordInput = document.getElementById('password').value;

    loginButton.disabled = true;
    loginButton.textContent = 'Memproses...';
    messageDiv.textContent = ''; 
    
    // Gunakan URL Parameters untuk login (Metode GET)
    const url = `${API_URL}?action=login&nip=${nipInput}&password=${passwordInput}`;

    try {
        const response = await fetch(url, {
            method: 'GET', 
            mode: 'cors',
        });
        
        // Response diproses sebagai TEXT karena CORS header
        const text = await response.text(); 
        const result = JSON.parse(text); 

        if (result.success) {
            displayMessage(messageDiv, result.message, true);
            saveUserData(result.data);
            setTimeout(loadDashboard, 1500); 
        } else {
            displayMessage(messageDiv, result.message, false);
        }

    } catch (error) {
        console.error('Error:', error);
        displayMessage(messageDiv, 'Gagal terhubung ke server API.', false);
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
});

// --- Logika Absensi (MENGGUNAKAN POST) ---

absenForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const kodeAbsensi = document.getElementById('kode-absensi').value;
    const token = localStorage.getItem('token'); 

    if (!token) {
        displayMessage(absenMessageDiv, 'Anda belum login. Silakan login ulang.', false);
        return;
    }

    absenButton.disabled = true;
    absenButton.textContent = 'Mencatat Kehadiran...';
    absenMessageDiv.textContent = ''; 

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'absen',
                token: token, 
                kodeAbsensi: kodeAbsensi,
            }),
        });

        // Response GAS diproses sebagai TEXT karena CORS header
        const text = await response.text(); 
        const result = JSON.parse(text);
        
        displayMessage(absenMessageDiv, result.message, result.success);

    } catch (error) {
        console.error('Error Absensi:', error);
        displayMessage(absenMessageDiv, 'Gagal terhubung saat absensi.', false);
    } finally {
        absenButton.disabled = false;
        absenButton.textContent = 'Absen Sekarang';
        document.getElementById('kode-absensi').value = ''; 
    }
});

// --- Logika Logout ---

function logout() {
    localStorage.clear(); 
    displayMessage(messageDiv, 'Anda berhasil logout.', true);
    setTimeout(loadDashboard, 1000); 
}

window.logout = logout; 
document.addEventListener('DOMContentLoaded', loadDashboard);