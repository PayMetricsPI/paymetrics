const edit_user_button_locals = document.getElementsByClassName('edit_user_button');
const out_edit_user = document.getElementById('out_edit_user');
const edit_user_modal = document.getElementById('edit_user_modal');
const close_edit_user_button = document.getElementById('close_edit_user_button');
const cancel_button_edit_user = document.getElementById('cancel_button_edit_user');
const view_password_new_edit = document.getElementById('view_password_new_edit');
const submit_button_edit_user = document.getElementById('submit_button_edit_user');

const open_modal_edit_user = (userID) => {
    out_edit_user.style.visibility = 'visible';
    edit_user_modal.style.visibility = 'visible';
    out_edit_user.style.pointerEvents = 'auto';
    edit_user_modal.style.pointerEvents = 'auto';
    out_edit_user.style.opacity = 1;
    edit_user_modal.style.opacity = 1;
    edit_user_modal.setAttribute('idUser', userID)
}

const close_modal_edit_user = () => {
    out_edit_user.style.visibility = 'hidden';
    edit_user_modal.style.visibility = 'hidden';
    out_edit_user.style.pointerEvents = 'none';
    edit_user_modal.style.pointerEvents = 'none';
    out_edit_user.style.opacity = 0;
    edit_user_modal.style.opacity = 0;
}


const onclickEdit = (e) => {
    const userLocal = e.parentElement.parentElement;
    const userIdEdited = userLocal.getAttribute('idUser');

    const name_input = edit_user_modal.querySelector('.edit_field input.name_input');
    const email_input = edit_user_modal.querySelector('.edit_field input.email_input');

    try {
        name_input.value = userLocal.querySelector('.photo_info .user_info p').innerHTML;
        email_input.value = userLocal.querySelector('.user_email').innerHTML;

        open_modal_edit_user(userIdEdited)
    } catch (err) {
        console.log(err)
    }
}

const sendEditInfo = () => {
    const name = edit_user_modal.querySelector('.edit_field input.name_input').value;
    const email = edit_user_modal.querySelector('.edit_field input.email_input').value;
    const password = edit_user_modal.querySelector('.edit_field input.password_input').value;
    const userID = edit_user_modal.getAttribute('idUser');
    const empresaID = sessionStorage.getItem('id');

    fetch('/empresas/atualizar/usuario', {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "idUsuario": userID,
            "idEmpresa": empresaID,
            "nome": name,
            "email": email,
            "senha": password
        }),
    }).then(response => {
        if(response.status == 200){
            window.location.reload()
        }
    })
}

view_password_new_edit.addEventListener('click', () => {
    view_password(view_password_new_edit)
})

close_edit_user_button.addEventListener('click', close_modal_edit_user);
out_edit_user.addEventListener('click', close_modal_edit_user);
cancel_button_edit_user.addEventListener('click', close_modal_edit_user);
submit_button_edit_user.addEventListener('click', sendEditInfo);