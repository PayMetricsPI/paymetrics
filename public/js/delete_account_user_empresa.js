const out_delete_user_account = document.getElementById('out_delete_user_account');
const close_delete_user_account_button = document.getElementById('close_delete_user_account_button');
const delete_user_account_modal = document.getElementById('delete_user_account_modal');
const cancel_button_delete_user_account = document.getElementById('cancel_button_delete_user_account');

const delete_user_button = document.getElementsByClassName('delete_user_button');

const confirm_button_delete_user = document.getElementById('confirm_button_delete_user');

const close_modal_delete_user = () => {
    out_delete_user_account.style.visibility = 'hidden';
    delete_user_account_modal.style.visibility = 'hidden';
    out_delete_user_account.style.pointerEvents = 'none';
    delete_user_account_modal.style.pointerEvents = 'none';
    out_delete_user_account.style.opacity = 0;
    delete_user_account_modal.style.opacity = 0;
}

const open_modal_delete_user = (userID) => {
    out_delete_user_account.style.visibility = 'visible';
    delete_user_account_modal.style.visibility = 'visible';
    out_delete_user_account.style.pointerEvents = 'auto';
    delete_user_account_modal.style.pointerEvents = 'auto';
    out_delete_user_account.style.opacity = 1;
    delete_user_account_modal.style.opacity = 1;
    delete_user_account_modal.setAttribute('idUser', userID);
}

const onclickDeleteUser = (e) => {
    const userLocal = e.parentElement.parentElement;
    const userIdDeleted = userLocal.getAttribute('idUser');

    open_modal_delete_user(userIdDeleted)
}

const sendDeleteUser = () => {
    const userID = delete_user_account_modal.getAttribute('idUser');
    const empresaID = sessionStorage.getItem('id');

    fetch('/empresas/deletar/usuario', {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "userID": userID,
            "empresaID": empresaID,
        }),
    }).then(response => {
        if(response.status == 200){
            window.location.reload()
        }
    })
}

out_delete_user_account.addEventListener('click', close_modal_delete_user)
close_delete_user_account_button.addEventListener('click', close_modal_delete_user)
cancel_button_delete_user_account.addEventListener('click', close_modal_delete_user)
confirm_button_delete_user.addEventListener('click', sendDeleteUser)