function login(event) {
    event.preventDefault();

    var emailVar = ipt_email.value;
    var senhaVar = ipt_senha.value;

    if (emailVar == "" || senhaVar == "") {
        respostaLogin.innerHTML = "Preencha todos os campos.";
        return false;
    }


    fetch("/usuarios/autenticar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            emailServer: emailVar,
            senhaServer: senhaVar
        })
    }).then(function (resposta) {
        console.log("ESTOU NO THEN DO entrar()!")

        if (resposta.ok) {
            console.log(resposta);

            resposta.json().then(json => {
                console.log(json);
                console.log("JSON recebido:", json);
                console.log("Primeiro elemento:", json[0]);

                let usuario = json;

                sessionStorage.EMAIL_USUARIO = usuario.email;
                sessionStorage.NOME_USUARIO = usuario.nome;
                sessionStorage.ID_USUARIO = usuario.id_usuario;
                sessionStorage.CARGO = usuario.cargo;
                sessionStorage.EMPRESA = usuario.fk_empresa;
                sessionStorage.NOME_EMPRESA = usuario.razao_social;
                sessionStorage.setItem("id", usuario.fk_empresa);

                if(usuario.cargo == "Analista"){
                    window.location.href = "DashPessoaEstrategia.html"
                }else if(usuario.cargo == "RH"){
                    window.location.href = "deletarUsuario.html"
                }else {
                    window.location.href = "embreve.html"
                }
            });

        } else {
            resposta.text().then(texto => {
                console.error(texto);
            });
        }

    }).catch(function (erro) {
        console.log(erro);
    })

    return false;
}