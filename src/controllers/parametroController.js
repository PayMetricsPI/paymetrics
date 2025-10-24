var parametroModel = require("../models/parametroModel");

// function listarParametro(req, res) {
//     const fk_empresa = req.params.fk_empresa;

//     parametroModel.listarParametros(fk_empresa)
//         .then(resultado => res.json(resultado))
//         .catch(erro => {
//             console.error("Erro ao listar parametros:", erro.sqlMessage || erro);
//             res.status(500).json({ error: erro.sqlMessage || erro });
//         });

// }


function criarParametro(req, res) {
    const parametros = req.body.parametros;

    if (!parametros || !Array.isArray(parametros) || parametros.length === 0) {
        return res.status(400).json({ error: "Dados inválidos" });
    }

    parametroModel.criarServidores(parametros)
        .then(resultado => res.status(201).json({ message: "Servidores criados com sucesso", insertedCount: resultado.affectedRows }))
        .catch(erro => {
            console.error("Erro ao criar parametros:", erro.sqlMessage || erro);
            res.status(500).json({ error: "Houve um erro ao criar os parametros", details: erro.sqlMessage });
        });
}

// function deletarParametro(req, res) {
//     const id_servidor = req.params.id_servidor;
//     const { fk_empresa } = req.body;

//     if (!id_servidor || !fk_empresa) {
//         return res.status(400).json({ error: "Dados incompletos" });
//     }

//     parametroModel.deletarParametro(id_servidor, fk_empresa)
//         .then(resultado => res.status(200).json({ message: "Servidor deletado com sucesso", resultado }))
//         .catch(erro => {
//             console.error("Erro ao deletar o servidor:", erro.sqlMessage || erro);
//             res.status(500).json({ error: "Houve um erro ao deletar o servidor", details: erro.sqlMessage });
//         });
// }

function atualizarParametro(req, res) {
    const id_servidor = req.params.id_servidor;
    const { nome, mac_address,tipo_cpu , ram, disco } = req.body;

    if (!id_servidor || !nome  || !mac_address || !tipo_cpu || !ram || !disco) {
        return res.status(400).json({ error: "Dados incompletos para atualizar servidor" });
    }

    parametroModel.atualizarServidor(id_servidor, nome, mac_address, tipo_cpu , ram,disco,)
        .then(resultado => res.status(200).json({ message: "Servidor atualizado com sucesso", resultado }))
        .catch(erro => {
            console.error("Erro ao atualizar o servidor:", erro.sqlMessage || erro);
            res.status(500).json({ error: "Houve um erro ao atualizar o servidor", details: erro.sqlMessage });
        });
}


module.exports = {
    atualizarParametro,
    // listarParametro,
    criarParametro,
    // deletarParametro
};
