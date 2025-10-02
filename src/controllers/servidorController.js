var servidorModel = require("../models/servidorModel");

function listarServidores(req, res) {
    const fk_empresa = req.params.fk_empresa;

    servidorModel.listarServidores(fk_empresa)
        .then(resultado => res.json(resultado))
        .catch(erro => {
            console.error("Erro ao listar servidores:", erro.sqlMessage || erro);
            res.status(500).json({ error: erro.sqlMessage || erro });
        });
}


function criarServidores(req, res) {
    const servidores = req.body.servidores;

    if (!servidores || !Array.isArray(servidores) || servidores.length === 0) {
        return res.status(400).json({ error: "Dados inválidos" });
    }

    servidorModel.criarServidores(servidores)
        .then(resultado => res.status(201).json({ message: "Servidores criados com sucesso", insertedCount: resultado.affectedRows }))
        .catch(erro => {
            console.error("Erro ao criar servidores:", erro.sqlMessage || erro);
            res.status(500).json({ error: "Houve um erro ao criar os servidores", details: erro.sqlMessage });
        });
}

<<<<<<< HEAD
function atualizarServidor (req, res){
    var nome = req.body.nome;
    var sistema_operacional = req.body.sistema_operacional;
    var fk_empresa = req.body.fk_empresa

    servidorModel.atualizarServidor(nome,sistema_operacional,fk_empresa).then(function(resultado){
        res.json(resultado);
    }).catch(function (erro){
        console.log(erro);
        console.log("Houve um erro ao buscar o servidor: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}


module.exports={
    deletarServidor,
    criarServidor,
    atualizarServidor
};
=======

function deletarServidor(req, res) {
    const id_servidor = req.params.id_servidor;
    const { fk_empresa } = req.body;

    if (!id_servidor || !fk_empresa) {
        return res.status(400).json({ error: "Dados incompletos" });
    }

    servidorModel.deletarServidor(id_servidor, fk_empresa)
        .then(resultado => res.status(200).json({ message: "Servidor deletado com sucesso", resultado }))
        .catch(erro => {
            console.error("Erro ao deletar o servidor:", erro.sqlMessage || erro);
            res.status(500).json({ error: "Houve um erro ao deletar o servidor", details: erro.sqlMessage });
        });
}

function atualizarServidor(req, res) {
    const id_servidor = req.params.id_servidor;
    const { nome, sistema_operacional, mac_address } = req.body;

    if (!id_servidor || !nome || !sistema_operacional || !mac_address) {
        return res.status(400).json({ error: "Dados incompletos para atualizar servidor" });
    }

    servidorModel.atualizarServidor(id_servidor, nome, sistema_operacional, mac_address)
        .then(resultado => res.status(200).json({ message: "Servidor atualizado com sucesso", resultado }))
        .catch(erro => {
            console.error("Erro ao atualizar o servidor:", erro.sqlMessage || erro);
            res.status(500).json({ error: "Houve um erro ao atualizar o servidor", details: erro.sqlMessage });
        });
}


module.exports = {
    atualizarServidor,
    listarServidores,
    criarServidores,
    deletarServidor
};
>>>>>>> 64cb4b8 (refactor: Mudanças na parte do back end)
