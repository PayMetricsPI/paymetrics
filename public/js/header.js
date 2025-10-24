var header = document.getElementById("header");
var sidebar = document.getElementById("sidebar");
if (header) {
    header.innerHTML = `<nav class="navbar navbar-expand-sm">
        <div class="container-fluid">
            <a class="navbar-brand" href="index.html"><img src="./assets/icons/logo-paymetrics-sem-fundo 2.png""></img></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link" href="index.html#sobre">Sobre</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="login.html">Login</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>`
} else if (sidebar) {
    sidebar.innerHTML = ` 
        <aside class="sidebar">
        <nav class="navbar-color d-flex flex-column flex-shrink-0">
        <div class="container-fluid d-flex w-100 align-items-center p-1 h-100">
            <ul class="nav nav-pills nav-flush flex-column mb-auto text-center h-100" id="ul_links">
                    <a class="d-flex p-3 link-dark text-decorartion-none" href="index.html">
                        <img class="bi" height="50" style="margin-left: -10px" src="assets/icons/logo-paymetrics-sem-fundo.png"/>
                    </a>
                <li class="nav-item">
                    <a class="nav-link py-3 d-flex mx-1 align-items-center" title data-bs-toggle="tooltip" data-bs-placemnet="right" arial-current="page" data-bs-original-title="Avisos" href="./embreve.html">
                        <img src="assets/icons/alert-icon.png" class="bi mask1" aria-label="Avisos" width="32" height="32" alt="">
                        <span class="alertas">Alertas</span>
                    </a>
                </li>
                <li class="nav-item">
                      <a class="nav-link py-3 d-flex mx-1 align-items-center" data-bs-placemnet="right" href="./embreve.html">
                        <img src="assets/icons/chart-icon.png" class="bi mask2" width="32" height="32" alt="">
                        <span class="dash">Dashboards</span>
                      </a>                    
                </li>
                 <li class="nav-item">
                      <a class="nav-link py-3 d-flex mx-1 align-items-center" data-bs-placemnet="right" href="./servidor.html ">
                        <img src="assets/icons/servidor.png" class="bi mask2" width="32" height="32" alt="">
                        <span class="dash">Servidores</span>
                      </a>                    
                </li>
                <li class="nav-item">
                    <a class="nav-link py-3 d-flex mx-1 align-items-center" data-bs-placemnet="right"href="./dashAlerta.html">
                        <img src="assets/imgs/image_alerta.png" class="bi mask3" width="32" height="32" alt="">
                        <span class="config">Dashboard Alertas</span>
                    </a>
                </li>
                <li>
                    <a class="nav-link py-3 d-flex mx-1 align-items-center" data-bs-placemnet="right" href="./perfil.html">
                        <img role="img" class="bi mask" width="32" height="32" src="assets/icons/account-icon.png" alt="foto_perfil">
                        <span class="user">Usuário</span>
                    </a>
                </li>
                <li class="mt-auto">
                    <a class="nav-link py-3 d-flex mx-1 align-items-center" data-bs-placemnet="right" href="./index.html" onclick="limparSessao()">
                        <img role="img" class="bi mask" width="32" height="32" src="assets/icons/iconesair.png" alt="foto_perfil">
                        <span class="user">Sair</span>
                    </a>
                </li>
            </ul>
        </div>
    </nav>
  </aside>
        `;
}