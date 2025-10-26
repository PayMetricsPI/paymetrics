// sessão
function validarSessao() {
    var email = sessionStorage.EMAIL_USUARIO;
    var nome = sessionStorage.NOME_USUARIO;
    const empresaId = sessionStorage.getItem("id"); 

    var usuario = document.getElementById("usuario");

    if (email != null && nome != null && empresaId != null) {
        usuario.innerHTML = nome;
    } else {
        window.location = "./login.html";
    }
}

function validarAdmin() {
    if (sessionStorage.FK_CARGO == 1) {
        ul = document.getElementById("ul_links")
        ul.innerHTML += `<li>
                    <a class="nav-link py-3 d-flex mx-1 align-items-center" data-bs-placemnet="right" href="deletarUsuario.html">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><path fill="#fff" d="M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575zm-2 2v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM19 6.4L17.6 5zm-3.525 2.125l-.7-.725L16.2 9.225z"/></svg>
                        <span class="user">Administrador</span>
                    </a>
                </li>`
    }
}

function limparSessao() {
    sessionStorage.clear();
    window.location = "../login.html";
}

function aguardar() {
    var divAguardar = document.getElementById("div_aguardar");
    divAguardar.style.display = "flex";
}

function finalizarAguardar(texto) {
    var divAguardar = document.getElementById("div_aguardar");
    divAguardar.style.display = "none";

    var divErrosLogin = document.getElementById("div_erros_login");
    if (texto) {
        divErrosLogin.style.display = "flex";
        divErrosLogin.innerHTML = texto;
    }
}



