var servidorModel = require("../models/servidor");

function criarServidor (req, res){
    var nome = req.params.nome;
    var sistema_operacional = req.params.sistema_operacional;
    var fk_empresa = req.body.fk_empresa;


    servidorModel.criarServidor(nome, sistema_operacional,fk_empresa).then(function(resultado){
        res.json(resultado);
    }).catch(function (erro){
        console.log(erro);
        console.log("Houve um erro ao criar o servidor: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function deletarServidor (req, res){
    var id_servidor = req.params.id_servidor;
    var fk_empresa = req.body.fk_empresa;

    servidorModel.deletarServidor(id_servidor, fk_empresa).then(function(resultado){
        res.json(resultado);
    }).catch(function (erro){
        console.log(erro);
        console.log("Houve um erro ao buscar o servidor: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}
module.exports={
    deletarServidor,
    criarServidor
};