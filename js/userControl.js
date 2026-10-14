async function updatePasswd(){
    let oldpass = document.querySelector('#oldpass');
    let newpass = document.querySelector('#newpass');
    let confirm = document.querySelector('#confirm');

    let data = {
        oldpass: oldpass.value,
        newpass: newpass.value,
        confirm: confirm.value
    }

    let uid = loadUser() ? loadUser().ID : 0;

    const response = await fetch(`http://localhost:3333/users/${uid}/passmod`, {
        method: 'POST',
        headers: {
            "Content-Type" : "Application/json"
        },
        body: JSON.stringify(data)
    });

    let res = await response.json();

    if (response.status != 200){
        showMessage('danger', 'ERROR', res.error);
    } else {
        showMessage('success', 'OK', res.message);
        oldpass.value = '';
        newpass.value = '';
        confirm.value = '';
    }

}

function loadUser() {
    let user = sessionStorage.getItem('SCU');

    if (!user || user === 'undefined') {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        console.error('Hibás felhasználói adat:', error);
        return null;
    }
}

async function updateProfile(){
    let name = document.querySelector('#name');
    let email = document.querySelector('#email');

    let loggedUser = loadUser();

    let data = {
        username: name.value,
        email: email.value,
        luid: loggedUser.ID
    }

    const response = await fetch(`http://localhost:3333/users/${loggedUser.ID}`, {
        method: 'PATCH',
        headers: {
            "Content-Type" : "Application/json"
        },
        body: JSON.stringify(data)
    });

    let res = await response.json();

    if (response.status != 200){
        showMessage('danger', 'ERROR', res.error);
    } else {
        showMessage('success', 'OK', res.message);
        let user = {
            ID: loggedUser.ID,
            name: name.value,
            email: email.value,
            role: loggedUser.role
        }
        storeUser(user);
    }

}

function loadUser() {
    let user = sessionStorage.getItem('SCU');

    if (!user || user === 'undefined') {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        console.error('Hibás felhasználói adat:', error);
        return null;
    }
}

function storeUser(user) {
    if (!user) {
        console.error('Nincs elmenthető felhasználó!');
        return;
    }

    sessionStorage.setItem('SCU', JSON.stringify(user));
}

function loginCheck() {
    const user = loadUser();

    if (user) {
        if (user.role === 'admin') {
            setMenuItems('admin');
            navigate('admin/dashboard');
        } else {
            setMenuItems('user');
            navigate('users/steps');
        }
    } else {
        setMenuItems('');
        navigate('users/login');
    }
}

async function updateProfile() {
    const name = document.querySelector('#name');
    const email = document.querySelector('#email');

    const loggedUser = loadUser();

    if (!loggedUser) {
        alert('Nincs bejelentkezett felhasználó!');
        return;
    }

    const data = {
        username: name.value,
        email: email.value,
        luid: loggedUser.ID
    };

    try {
        const response = await fetch(
            `http://localhost:3333/users/${loggedUser.ID}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
        );

        const res = await response.json();

        if (!response.ok) {
            alert(res.error || 'Hiba történt a profil frissítésekor!');
            return;
        }

        alert(res.message || 'Profil sikeresen frissítve!');

        const user = {
            ...loggedUser,
            ID: loggedUser.ID,
            name: name.value,
            email: email.value
        };

        storeUser(user);

    } catch (error) {
        console.error('Szerverhiba:', error);
        alert('Nem sikerült kapcsolódni a szerverhez!');
    }
}
function setMenuItems(param){
    
    let baseMenu = document.querySelector('#baseMenu');
    let adminMenu = document.querySelector('#adminMenu');
    let userMenu = document.querySelector('#userMenu');

    switch(param){
        case 'admin' : {
            baseMenu.classList.add('hide');
            userMenu.classList.add('hide'); 
            adminMenu.classList.remove('hide'); 
            break;
        }
        case 'user' : {
            baseMenu.classList.add('hide');
            adminMenu.classList.add('hide');
            userMenu.classList.remove('hide'); 
            break;
        }
        default : {
            userMenu.classList.add('hide');
            adminMenu.classList.add('hide');
            baseMenu.classList.remove('hide'); 
            break;
        }
    }
}