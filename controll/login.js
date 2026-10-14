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
        showMessage('danger', 'ERROR', res.error);
    } else {
        showMessage('success', 'OK', res.message);
        storeUser(res.loggedUser);
        loginCheck();
      
    }
}