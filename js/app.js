let contentBox = document.getElementById("content");

let lightModeBtn = document.querySelector('#lightModeBtn');
let darkModeBtn = document.querySelector('#darkModeBtn');


async function navigate(page){
    contentBox.innerHTML = await (await fetch(`view/${page}.html`)).text();
    {
         switch (page){
        
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
