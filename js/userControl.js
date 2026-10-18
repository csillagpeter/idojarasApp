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

    const response = await fetch(`http://localhost:3000/users/${uid}/passmod`, {
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
async function registration(){
  
    let name = document.querySelector('#name').value;
    let email = document.querySelector('#email').value;
    let passwd = document.querySelector('#passwd').value;
    let confirm = document.querySelector('#confirm').value;

    // meg kell szólítani a servert

    let user = {
        name,   
        email, 
        passwd, 
        confirm
    }

    const response = await fetch(`http://localhost:3000/users/register`, {
        method: 'POST',
        headers: {
            "Content-Type" : "Application/json"
        },
        body: JSON.stringify(user)
    });

    let res = await response.json();

    if (response.status != 201){
        showMessage('danger', 'ERROR', res.error);
    } else {
        showMessage('success', 'OK', res.message);
        navigate('users/login');
    }
}
function loadUser() {
    const userStr = sessionStorage.getItem('SCU');
    
    // Ha üres, vagy véletlenül az "undefined" szöveg ragadt be:
    if (!userStr || userStr === "undefined") {
        return null; 
    }
    
    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error("Hibás JSON a tárolóban:", e);
        return null;
    }
}
function logout(){
    clearUser();
    loginCheck();
   
}
function clearUser(){
    sessionStorage.removeItem('SCU');
}


// async function updateProfile(){
//     let name = document.querySelector('#name');
//     let email = document.querySelector('#email');

//     let loggedUser = loadUser();

//     let data = {
//         username: name.value,
//         email: email.value,
//         luid: loggedUser.ID
//     }

//     const response = await fetch(`http://localhost:3000/users/${loggedUser.ID}`, {
//         method: 'PATCH',
//         headers: {
//             "Content-Type" : "Application/json"
//         },
//         body: JSON.stringify(data)
//     });

//     let res = await response.json();

//     if (response.status != 200){
//         showMessage('danger', 'ERROR', res.error);
//     } else {
//         showMessage('success', 'OK', res.message);
//         let user = {
//             ID: loggedUser.ID,
//             name: name.value,
//             email: email.value,
//             role: loggedUser.role
//         }
//         storeUser(user);
//     }

// }
async function updateProfile(){
    let name = document.querySelector('#name');
    let email = document.querySelector('#email');

    let loggedUser = loadUser();

    if (!loggedUser) {
        showMessage('danger', 'ERROR', 'Nem vagy bejelentkezve!');
        return; 
    }

    
    let data = {
        username: name.value,
        email: email.value,
        luid: Number(loggedUser.ID)
    }

    const response = await fetch(`http://localhost:3000/users/${loggedUser.ID}`, {
        method: 'PATCH',
        headers: {
            
            "Content-Type" : "application/json" 
        },
        body: JSON.stringify(data)
    });

    let res = await response.json();

    if (response.status != 200){
       
        showMessage('danger', 'ERROR', res.message || 'Hiba történt!');
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

function storeUser(user){
    sessionStorage.setItem('SCU', JSON.stringify(user));
}
function loginCheck() {
    const user = loadUser();

    if (user) {
        if (user.role === 'admin') {
            setMenuItems('admin');
            navigate('admin/users');
        } else {
            setMenuItems('user');
            navigate('users/forecast'); 
        }
    } else {
        setMenuItems('');
        navigate('users/login');
    }
}

async function login () {
    let email = document.querySelector('#email').value;
    let password = document.querySelector('#passwd').value;

    let user = {
        email, 
        password
    } 

    const response = await fetch(`http://localhost:3000/users/login`, {
        method: 'POST',
        headers: {
            "Content-Type" : "Application/json"
        },
        body: JSON.stringify(user)
    });

    let res = await response.json();

    if (response.status != 200){
        
        showMessage('danger', 'ERROR', res.message || res.error); 
    } else {
        showMessage('success', 'OK', res.message);
        
        
        const userToSave = res.loggedUser || res.user || res.data || res.role || res;
        
        console.log("Mentésre kerülő felhasználó:", userToSave);
        storeUser(userToSave);
        
       
        loginCheck(); 
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