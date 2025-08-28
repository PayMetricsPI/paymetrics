var adm = sessionStorage.ADMINISTRADOR 
console.log(adm);

if(adm != "1"){
    window.location.href = "../embreve.html";
}

function listarUsuario(){
    
    fetch(`/usuarios/listar/${a}`)
}