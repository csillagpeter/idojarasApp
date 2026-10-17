let contentBox = document.getElementById("content");

// Amikor a böngésző teljesen betöltötte az oldalt:
document.addEventListener('DOMContentLoaded', () => {
    
    // Meghívjuk az ellenőrzést. Ha van belépett user, átváltja a menüt 'user'-re vagy 'admin'-ra,
    // ha nincs, akkor meghagyja az alap (baseMenu) állapotot és a loginra dob.
    loginCheck(); 

});


document.addEventListener('DOMContentLoaded', () => {
    const lightModeBtn = document.querySelector('#lightModeBtn');
    const darkModeBtn = document.querySelector('#darkModeBtn');
    const body = document.body;

    // 1. Betöltéskor ellenőrizzük, mit mentettünk el legutóbb
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        lightModeBtn.classList.add('hide');
        darkModeBtn.classList.remove('hide');
    }

    // 2. Világos módra váltás (Nap ikonra kattintva)
    lightModeBtn.addEventListener('click', () => {
        body.classList.add('light-mode');
        lightModeBtn.classList.add('hide');
        darkModeBtn.classList.remove('hide');
        localStorage.setItem('theme', 'light'); // Elmentjük, hogy frissítés után is így maradjon
    });

    // 3. Sötét módra váltás (Hold ikonra kattintva)
    darkModeBtn.addEventListener('click', () => {
        body.classList.remove('light-mode');
        darkModeBtn.classList.add('hide');
        lightModeBtn.classList.remove('hide');
        localStorage.setItem('theme', 'dark');
    });
});


async function navigate(page) {
    // Beolvassuk a HTML tartalmát
    contentBox.innerHTML = await (await fetch(`view/${page}.html`)).text();

    // Itt a felesleges { törölve lett:
    switch (page) {
        case 'users/profile': {
            getUserData();
            break;
        }
        // Ha a forecast oldal betöltésekor is akarsz futtatni függvényt, ide jöhet:
        /* case 'forecast': {
            getWeatherData();
            break;
        } */
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
