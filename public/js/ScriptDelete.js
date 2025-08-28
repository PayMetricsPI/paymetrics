var adm = sessionStorage.ADMINISTRADOR 
console.log(adm);

if(adm != "Funcionario"){
    window.location.href = "../embreve.html";
}