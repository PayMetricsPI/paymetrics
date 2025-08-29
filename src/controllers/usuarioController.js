var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else {

        usuarioModel.autenticar(email, senha)
            .then(
                function (resultadoAutenticar) {
                    console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);
                    console.log(`Resultados: ${JSON.stringify(resultadoAutenticar)}`);

                    if (resultadoAutenticar.length == 1) {
                    console.log(resultadoAutenticar);

                    res.json(resultadoAutenticar[0]);

                    } else if (resultadoAutenticar.length == 0) {
                        res.status(403).send("Email e/ou senha inválido(s)");
                    } else {
                        res.status(403).send("Mais de um usuário com o mesmo login e senha!");
                    }
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }

}

function cadastrar(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var emailC = req.body.emailCServer;
    var senha = req.body.senhaServer;
    var senhaC = req.body.senhaCServer;
    var fk_empresa = req.body.fk_empresaServer;
    var administrador = req.body.administradorServer;
    

    // Faça as validações dos valores
    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (emailC == undefined) {
        res.status(400).send("Sua data de nascimento está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else if (senhaC == undefined) {
        res.status(400).send("Sua senha está undefined!");
    }else if (administrador == undefined) {
        res.status(400).send("O adm está undefined!");
     }else {

        // Passe os valores como parâmetro e vá para o arquivo usuarioModel.js
        usuarioModel.cadastrar(nome, email, senha, administrador, fk_empresa)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

function renovar(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html

    var senha = req.body.senhaServer;
    var novaSenha = req.body.novaSenhaServer;
    var IdUsuario = req.body.IdUsuario;

    // Faça as validações dos valores
    if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    }else {

        // Passe os valores como parâmetro e vá para o arquivo usuarioModel.js
        usuarioModel.renovar(novaSenha, senha, IdUsuario)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log("Erro no controller")
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar a atualização da senha! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

    function listar(req, res ){
        var IdEmpresa = req.params.IdEmpresa;

        usuarioModel.listar(IdEmpresa).then(function(resultado){
            if (resultado.length > 0){
                res.status(200).json(resultado);
            }else {
                res.status(204).send("Nenhum resultado encontrado")
            }
        }).catch(function(erro){
            console.log(erro);
            console.log("Houve um erro ao buscar os usuários: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
            
        })
    };

    function deletar (res, req){
        var IdUsuario = req.body.IdUsuario;

        usuarioModel.deletar(IdUsuario).then(function(resultado){
            res.json(resultado);
        }).catch(function (erro){
           console.log(erro);
           console.log("Houve um erroo ao buscar os usários: ", erro.sqlMessage);
           res.status(500).json(erro.sqlMessage);
    });
    }

    function redefinirSenha (req, res) {
        
    console.log(req.params.idUsuario)
        var id_usuario = req.params.idUsuario;
        console.log(id_usuario)
        console.log("AAAAAAAAAAAAAAAAAAAAAA")
        const senhaAntiga = req.body.senhaAntiga;
        const novaSenha = req.body.novaSenha;

        

        if (!id_usuario || !senhaAntiga || !novaSenha) {
            return res.status(400).send("Dados insuficientes.");
        }

        usuarioModel.verificarSenha(id_usuario, senhaAntiga)
        .then(resultado => {
            if(resultado.length === 0) {
                return res.status(401).send("Senha antiga incorreta.")
            }
            return usuarioModel.renovar(id_usuario, novaSenha)
                .then(() => res.status(200).send("Senha alterada com sucesso!"))
        })
        .catch(erro => {
            console.log(erro);
            res.status(500).send("Erro ao redefinir senha.");
        })
    }

module.exports = {
    autenticar,
    cadastrar,
    renovar,
    listar,
    deletar,
    redefinirSenha
}