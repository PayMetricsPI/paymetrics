var header = document.getElementById("header")
if(sessionStorage.EMAIL_USUARIO) {
    console.log("sessionStorage.EMAIL_USUARIO:", sessionStorage.EMAIL_USUARIO);
    header.innerHTML = ` <nav class="navbar navbar-expand-sm">
        <div class="container-fluid">
            <a class="navbar-brand" href="index.html"><img src="./assets/icons/logo-paymetrics-sem-fundo 2.png""></img></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link" href="sobre.html">Sobre</a>
                    </li>
                    <li class="nav-item">
                            <svg onclick="limparSessao()"  xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><path fill="#000" d="M19.002 3h-14c-1.103 0-2 .897-2 2v4h2V5h14v14h-14v-4h-2v4c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.898-2-2-2"/><path fill="#000" d="m11 16l5-4l-5-4v3.001H3v2h8z"/></svg>
                    </li>
                </ul>
            </div>
        </div>
    </nav>` 
} else {
    header.innerHTML = `<nav class="navbar navbar-expand-sm">
        <div class="container-fluid">
            <a class="navbar-brand" href="index.html"><img src="./assets/icons/logo-paymetrics-sem-fundo 2.png""></img></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link" href="sobre.html">Sobre</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="login.html">Login</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>` 
}