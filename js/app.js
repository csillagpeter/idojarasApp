let contentBox = document.getElementById("content");


document.addEventListener('DOMContentLoaded', () => {
    
    
    loginCheck(); 

});


document.addEventListener('DOMContentLoaded', () => {
    const lightModeBtn = document.querySelector('#lightModeBtn');
    const darkModeBtn = document.querySelector('#darkModeBtn');
    const body = document.body;

   
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        lightModeBtn.classList.add('hide');
        darkModeBtn.classList.remove('hide');
    }

    
    lightModeBtn.addEventListener('click', () => {
        body.classList.add('light-mode');
        lightModeBtn.classList.add('hide');
        darkModeBtn.classList.remove('hide');
        localStorage.setItem('theme', 'light'); 
    });

    
    darkModeBtn.addEventListener('click', () => {
        body.classList.remove('light-mode');
        darkModeBtn.classList.add('hide');
        lightModeBtn.classList.remove('hide');
        localStorage.setItem('theme', 'dark');
    });
});


async function navigate(page) {
    
    contentBox.innerHTML = await (await fetch(`view/${page}.html`)).text();

    
    switch (page) {
        case 'admin/dashboard': {
    getStatistics();
    loadAdminForecasts(); 
    break;
    }

    case 'admin/users' : {
    getAllUsers();
    break;
    }
    case 'users/profile': {
    getUserData();
    break;
    }
        
       case 'users/forecast': {

        loadForecast('Budapest');

        // Keresőgomb 
        setTimeout(() => {
            const searchBtn = document.querySelector('#citySearchBtn');
            const searchInput = document.querySelector('#citySearchInput');
            
            if (searchBtn && searchInput) {
                searchBtn.addEventListener('click', () => {
                    if (searchInput.value.trim() !== '') {
                        loadForecast(searchInput.value.trim());
                    }
                });
                
                
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                        loadForecast(searchInput.value.trim());
                    }
                });
            }
        }, 100);
        break;
    }
    }
}
lightModeBtn.addEventListener('click', ()=>{
    theme = 'light';
    setTheme(theme);
});

darkModeBtn.addEventListener('click', ()=>{
    theme = 'dark';
    setTheme(theme);
});

function setTheme(theme){
    document.documentElement.setAttribute('data-bs-theme', theme);
    saveTheme(theme);
    setThemeBtnState();
}

function setThemeBtnState(){
    lightModeBtn.classList.toggle('hide');
    darkModeBtn.classList.toggle('hide');
}

function saveTheme(theme){
    localStorage.setItem('SCT', theme);
}

function loadTheme(){
    theme = 'light';
    if (localStorage.getItem('SCT')){
        theme = localStorage.getItem('SCT');
        if (theme == 'dark'){
            setThemeBtnState();
        }
    }
    setTheme(theme);
}
loadTheme();
// forecast oldal betöltés

function getWeatherIcon(type) {
    const t = type.toLowerCase();
    if (t.includes('nap') || t.includes('derült') || t.includes('sunny')) return 'bi-sun text-warning';
    if (t.includes('eső') || t.includes('zápor') || t.includes('rain')) return 'bi-cloud-rain-fill text-info';
    if (t.includes('vihar') || t.includes('lightning')) return 'bi-cloud-lightning-rain-fill text-danger';
    if (t.includes('felhő') || t.includes('borult') || t.includes('cloudy')) return 'bi-cloud-sun text-light';
    return 'bi-cloud text-white';
}


function getDayName(dateString) {
    const days = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    const d = new Date(dateString);
    return days[d.getDay()];
}


async function loadForecast(cityName = 'Budapest') {
    try {
        const response = await fetch(`http://localhost:3000/api/forecast?location=${encodeURIComponent(cityName)}`);
        
        if (response.status !== 200) {
            const err = await response.json();
            alert(err.message || "Nem található adat.");
            return;
        }

        const data = await response.json();
        
       
        const cardsContainer = document.querySelector('#forecastCardsContainer');
        cardsContainer.innerHTML = '';

        // Legenerálás adatbazis
        data.forEach((day, index) => {
            const cardHtml = `
                <div class="col-6 col-md-3" style="cursor: pointer;" onclick="loadDetailedForecast(${day.ID})">
                    <div class="card glass-card border-0 shadow text-center text-white py-3">
                        <div class="card-body">
                            <span class="text-white-50 d-block small mb-2">${getDayName(day.date)}</span>
                            <i class="bi ${getWeatherIcon(day.weather_type)} display-6 my-2 d-block animate-bounce"></i>
                            <span class="d-block fw-bold fs-5 mt-2">${day.temp_max}°C</span>
                            <span class="text-white-50 small">${day.temp_min}°C</span>
                        </div>
                    </div>
                </div>
            `;
            cardsContainer.innerHTML += cardHtml;
        });

       
        if (data.length > 0) {
            loadDetailedForecast(data[0].ID);
        }

    } catch (error) {
        console.error("Hiba az időjárás betöltésekor:", error);
    }
}

// RÉSZLETES INFÓK FÜGGVÉNY
async function loadDetailedForecast(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/forecast/details/${id}`);
        if (response.status !== 200) return;

        const day = await response.json();

        // MAI KIEMELT  PANEL FRISSÍTÉSE
        const mainContainer = document.querySelector('#mainWeatherContainer');
        const formattedDate = new Date(day.date).toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' });
        
        mainContainer.innerHTML = `
            <div>
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h3 class="fw-bold mb-0">${day.location}</h3>
                        <p class="opacity-75 mb-0">${getDayName(day.date)}, ${formattedDate}.</p>
                    </div>
                    <span class="badge bg-white bg-opacity-25 text-white p-2 px-3 rounded-pill">Adatbázisból</span>
                </div>
                
                <div class="my-5 d-flex align-items-center justify-content-between">
                    <h1 class="display-1 fw-bold mb-0">${day.temp_max}°C</h1>
                    <div class="text-end">
                        <i class="bi ${getWeatherIcon(day.weather_type)} display-2 animate-bounce"></i>
                        <div class="fw-medium mt-2 fs-5">${day.weather_type}</div>
                    </div>
                </div>
            </div>

            <div class="row g-3 pt-3 border-top border-white border-opacity-25 text-center">
                <div class="col-4">
                    <div class="text-white-50 small mb-1"><i class="bi bi-wind me-1"></i> Szél</div>
                    <div class="fw-bold">${day.wind_speed} km/h</div>
                </div>
                <div class="col-4">
                    <div class="text-white-50 small mb-1"><i class="bi bi-droplet me-1"></i> Pára</div>
                    <div class="fw-bold">${day.humidity}%</div>
                </div>
                <div class="col-4">
                    <div class="text-white-50 small mb-1"><i class="bi bi-sun me-1"></i> UV Index</div>
                    <div class="fw-bold">${day.uv_index} / 10</div>
                </div>
            </div>
        `;

        // PANEL FRISSÍTÉSE
        const detailedContainer = document.querySelector('#detailedWeatherContainer');
        detailedContainer.innerHTML = `
            <h5 class="fw-bold mb-4">Részletes adatok – ${day.weather_type}</h5>
            <div class="row g-3">
                <div class="col-sm-6">
                    <div class="p-3 bg-white bg-opacity-10 rounded-3 d-flex align-items-center">
                        <div class="bg-primary bg-opacity-25 p-3 rounded-3 me-3 text-primary-light">
                            <i class="bi bi-thermometer-half fs-3"></i>
                        </div>
                        <div>
                            <span class="text-white-50 small d-block">Minimum hőmérséklet</span>
                            <span class="fs-5 fw-bold">${day.temp_min}°C</span>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="p-3 bg-white bg-opacity-10 rounded-3 d-flex align-items-center">
                        <div class="bg-info bg-opacity-25 p-3 rounded-3 me-3 text-info">
                            <i class="bi bi-compass fs-3"></i>
                        </div>
                        <div>
                            <span class="text-white-50 small d-block">Légnyomás</span>
                            <span class="fs-5 fw-bold">${day.pressure} hPa</span>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="p-3 bg-white bg-opacity-10 rounded-3 d-flex align-items-center">
                        <div class="bg-warning bg-opacity-25 p-3 rounded-3 me-3 text-warning">
                            <i class="bi bi-wind fs-3"></i>
                        </div>
                        <div>
                            <span class="text-white-50 small d-block">Szélirány</span>
                            <span class="fs-5 fw-bold">${day.wind_direction || 'Nincs adat'}</span>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="p-3 bg-white bg-opacity-10 rounded-3 d-flex align-items-center">
                        <div class="bg-danger bg-opacity-25 p-3 rounded-3 me-3 text-danger">
                            <i class="bi bi-cloud-rain fs-3"></i>
                        </div>
                        <div>
                            <span class="text-white-50 small d-block">Csapadék / Esély</span>
                            <span class="fs-5 fw-bold">${day.precipitation} mm (${day.precipitation_probability}%)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Hiba a részletek betöltésekor:", error);
    }
}
