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
        .then(resultado => {
           const insertId = resultado && resultado.insertId ? resultado.insertId : null; 
            return res.status(201).json({
                message: "Servidores criados com sucesso",
                insertedCount: resultado.affectedRows,
                    insertId 
            }); 

        })
        .catch(erro => {
            console.error("Erro ao criar servidores:", erro.sqlMessage || erro);
            res.status(500).json({ error: "Houve um erro ao criar os servidores", details: erro.sqlMessage });
        });
}

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
    const { nome,pais, estado, mac_address, tipo_cpu, ram, disco,ipEc2 } = req.body;

    if (!id_servidor || !nome || !mac_address || !ipEc2 || !pais || !estado || !tipo_cpu || !ram || !disco) {
        return res.status(400).json({ error: "Dados incompletos para atualizar servidor" });
    }

    servidorModel.atualizarServidor(id_servidor, nome,pais, estado, mac_address,ipEc2, tipo_cpu, ram, disco,)
        .then(resultado => res.status(200).json({ message: "Servidor atualizado com sucesso", resultado }))
        .catch(erro => {
            console.error("Erro ao atualizar o servidor:", erro.sqlMessage || erro);
            res.status(500).json({ error: "Houve um erro ao atualizar o servidor", details: erro.sqlMessage });
        });
}

function mapaGlobal(req, res) {
    const fk_empresa = req.params.fk_empresa;

    servidorModel.mapaGlobal(fk_empresa)
        .then(resultado => res.json(resultado))
        .catch(erro => res.status(500).json(erro));
}

function mapaEstados(req, res) {
    const fk_empresa = req.params.fk_empresa;
    const pais = req.params.pais;

    servidorModel.mapaEstados(fk_empresa, pais)
        .then(resultado => res.json(resultado))
        .catch(erro => res.status(500).json(erro));
}



module.exports = {
    atualizarServidor,
    listarServidores,
    criarServidores,
    deletarServidor,
    mapaGlobal,
    mapaEstados

};
