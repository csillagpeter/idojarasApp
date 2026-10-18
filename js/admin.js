async function getAllUsers() {
    let luid = loadUser() ? loadUser().ID : 0;

    
    let usersList = document.querySelector('#usersList');
    if (usersList) usersList.innerHTML = '';

    const response = await fetch(`http://localhost:3000/admin/users`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ luid }),
    });

    if (response.status != 200){
        const res = await response.json();
       
        showMessage('danger', 'ERROR', res.message || res.error);
    } else {
        const users = await response.json();   
        drawTable(users);
    }
}

function drawTable(users) {
    let usersCount = document.querySelector('#usersCount');
    if (usersCount) {
        usersCount.innerHTML = users.length;
    }

    users.forEach((user, index) => {
        addTableRow(user, index);
    });
}

function addTableRow(user, index) {
    let usersList = document.querySelector('#usersList');
    if (!usersList) return;

    let tr = document.createElement('tr');

    
    let tdId = document.createElement('td');
    let tdName = document.createElement('td');
    let tdEmail = document.createElement('td');
    let tdRole = document.createElement('td');
    let tdReg = document.createElement('td');
    let tdLast = document.createElement('td');
    let tdLoginCount = document.createElement('td');
    let tdStatus = document.createElement('td');

    
    tdId.innerHTML = user.ID;
    tdId.classList.add('fw-bold', 'text-info');

    
    tdName.innerHTML = user.name;
    tdEmail.innerHTML = user.email;

    
    tdRole.innerHTML = user.role === 'admin' 
        ? '<span class="badge bg-danger">Admin</span>' 
        : '<span class="badge bg-secondary">User</span>';

       
    tdReg.innerHTML = user.reg ? new Date(user.reg).toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Nincs adat';
    tdReg.classList.add('small', 'text-white-50');

    //  Utolsó belépés dátuma 
    tdLast.innerHTML = user.last ? new Date(user.last).toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Soha';
    tdLast.classList.add('small', 'text-white-50');

    //  Belépések száma
    tdLoginCount.innerHTML = user.loginCount;
    tdLoginCount.classList.add('text-center', 'fw-bold');

    //  Státusz (Tiltás/Aktiválás switch - a te meződ: user.status)
    // Ha a status értéke 1, akkor aktív (checked), ha 0, akkor tiltott
    let isActive = user.status == 1 ? 'checked' : '';
    tdStatus.innerHTML = `
        <div class="form-check form-switch d-flex justify-content-center">
            <input class="form-check-input" type="checkbox" role="switch" 
                   id="status_${user.ID}" ${isActive} onchange="toggleUserStatus(${user.ID}, this.checked)">
        </div>
    `;

    
    tr.appendChild(tdId);
    tr.appendChild(tdName);
    tr.appendChild(tdEmail);
    tr.appendChild(tdRole);
    tr.appendChild(tdReg);
    tr.appendChild(tdLast);
    tr.appendChild(tdLoginCount);
    tr.appendChild(tdStatus);

   
    usersList.appendChild(tr);
}
function drawDashboard(results) {
    let totalUsers = document.querySelector('#totalUsers');
    let totalLogins = document.querySelector('#totalLogins');
    let topUsers = document.querySelector('#topUsers');

    
    if (totalUsers) totalUsers.innerHTML = results.totalUsers || 0;
    if (totalLogins) totalLogins.innerHTML = results.totalLogins || 0;

    // 3 legtöbbször belépett felhasználót
    if (topUsers) {
        topUsers.innerHTML = ''; // Kiürítjük a korábbi listát
        
       
        results.topUsers.forEach((user, index) => {
            topUsers.innerHTML += `
            <tr>
                <td class="fw-bold">${index + 1}.</td>
                <td class="text-start">
                    <span class="fw-medium">${user.name}</span><br>
                    <small class="text-muted">${user.email}</small>
                </td>
                <td class="text-end fw-bold text-success">
                    ${user.loginCount} <i class="bi bi-box-arrow-in-right small"></i>
                </td>
            </tr>`;
        });
    }
}
async function getStatistics(){

    let luid = loadUser() ? loadUser().ID : 0;

    const response = await fetch(`http://localhost:3000/admin/statistics`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ luid }),
    });

    if (response.status != 200){
        const res = await response.json();
        showMessage('danger', 'ERROR', res.error);
    } else {
        const results = await response.json();   
        drawDashboard(results);
    }

}
// adatok betöltése 
async function loadAdminForecasts() {
    let luid = loadUser() ? loadUser().ID : 0;
    const response = await fetch('http://localhost:3000/api/admin/forecasts', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ luid })
    });

    if (response.status === 200) {
        const forecasts = await response.json();
        const tbody = document.querySelector('#adminForecastsTableBody');
        if(!tbody) return;
        tbody.innerHTML = '';

        forecasts.forEach(f => {
            const fDate = new Date(f.date).toLocaleDateString('hu-HU');
            tbody.innerHTML += `
                <tr id="forecast_row_${f.ID}">
                    <td><strong>${fDate}</strong></td>
                    <td><span class="badge bg-secondary">${f.location}</span></td>
                    <td>${f.weather_type}</td>
                    <td><span class="text-primary">${f.temp_min}°C</span> / <span class="text-danger">${f.temp_max}°C</span></td>
                    <td>${f.humidity}% / ${f.pressure} hPa</td>
                    <td>${f.wind_speed} km/h (${f.wind_direction})</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-warning me-1" onclick="editForecast(${JSON.stringify(f).replace(/"/g, '&quot;')})"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteForecast(${f.ID})"><i class="bi bi-trash-fill"></i></button>
                    </td>
                </tr>`;
        });
    }
}

// mentes (Új és Módosítás )
async function saveForecast(event) {
    event.preventDefault();
    let luid = loadUser() ? loadUser().ID : 0;
    const id = document.querySelector('#forecastId').value;

    const data = {
        luid,
        date: document.querySelector('#fDate').value,
        location: document.querySelector('#fLocation').value,
        weather_type: document.querySelector('#fType').value,
        uv_index: document.querySelector('#fUv').value,
        temp_min: document.querySelector('#fMin').value,
        temp_max: document.querySelector('#fMax').value,
        wind_speed: document.querySelector('#fWindS').value,
        wind_direction: document.querySelector('#fWindD').value,
        humidity: document.querySelector('#fHum').value,
        pressure: document.querySelector('#fPress').value,
        precipitation: document.querySelector('#fPrecipM').value,
        precipitation_probability: document.querySelector('#fPrecipP').value,
    };

    const url = id 
        ? `http://localhost:3000/api/admin/forecasts/update/${id}`
        : 'http://localhost:3000/api/admin/forecasts/add';
    
    const response = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const res = await response.json();
    alert(res.message);
    if (response.status === 200 || response.status === 201) {
        resetForecastForm();
        loadAdminForecasts();
    }
}

// Betöltés szerkesztésre
function editForecast(f) {
    document.querySelector('#formTitle').innerHTML = "Előrejelzés módosítása (ID: " + f.ID + ")";
    document.querySelector('#forecastId').value = f.ID;
    
    // String vágás az input[type=date] kompatibilitáshoz (YYYY-MM-DD)
    document.querySelector('#fDate').value = f.date.split('T')[0];
    document.querySelector('#fLocation').value = f.location;
    document.querySelector('#fType').value = f.weather_type;
    document.querySelector('#fUv').value = f.uv_index;
    document.querySelector('#fMin').value = f.temp_min;
    document.querySelector('#fMax').value = f.temp_max;
    document.querySelector('#fWindS').value = f.wind_speed;
    document.querySelector('#fWindD').value = f.wind_direction;
    document.querySelector('#fHum').value = f.humidity;
    document.querySelector('#fPress').value = f.pressure;
    document.querySelector('#fPrecipM').value = f.precipitation;
    document.querySelector('#fPrecipP').value = f.precipitation_probability;

    document.querySelector('#cancelEditBtn').classList.remove('hide');
    document.querySelector('#submitForecastBtn').className = "btn btn-warning px-4";
    document.querySelector('#submitForecastBtn').innerHTML = "Módosítások mentése";
}

//  visszaállítása alaphelyzet
function resetForecastForm() {
    document.querySelector('#forecastForm').reset();
    document.querySelector('#forecastId').value = '';
    document.querySelector('#formTitle').innerHTML = "Új előrejelzés felvétele";
    document.querySelector('#cancelEditBtn').classList.add('hide');
    document.querySelector('#submitForecastBtn').className = "btn btn-success px-4";
    document.querySelector('#submitForecastBtn').innerHTML = "Mentés";
}
// Törlés 
async function deleteForecast(id) {
    if (!confirm("Biztosan törölni szeretnéd ezt az előrejelzést?")) return;
    let luid = loadUser() ? loadUser().ID : 0;

    const response = await fetch(`http://localhost:3000/api/admin/forecasts/delete/${id}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ luid })
    });

    const res = await response.json();
    if (response.status === 200) {
        loadAdminForecasts();
    } else {
        alert(res.message);
    }
}
