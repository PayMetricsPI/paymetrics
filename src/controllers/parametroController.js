var parametroModel = require("../models/parametroModel");

function listarParametro(req, res) {
    const fk_servidor = req.params.fk_servidor;

    parametroModel.listarParametro(fk_servidor)
        .then(resultado => res.json(resultado))
        .catch(erro => {
            console.error("Erro ao listar parametros:", erro.sqlMessage || erro);
            res.status(500).json({ error: erro.sqlMessage || erro });
    });
}

async function criarParametro(req, res) {
    const parametros = req.body.parametros;

    await parametroModel.criarParametro(parametros);
    return res.status(201).json({
        message: "Parâmetros criados com sucesso"
    });
}

function atualizarParametro(req, res) {
    const id_parametro = req.params.id_parametro;
    const {alerta_critico, alerta_normal} = req.body;

    if (!id_parametro || !alerta_critico || !alerta_normal) {
        return res.status(400).json({ error: "Dados incompletos para atualizar parametro" });
    }

    parametroModel.atualizarParametro(id_parametro, alerta_critico, alerta_normal,)
        .then(resultado => res.status(200).json({ message: "Servidor atualizado com sucesso", resultado }))
        .catch(erro => {
            console.error("Erro ao atualizar o servidor:", erro.sqlMessage || erro);
            res.status(500).json({ error: "Houve um erro ao atualizar o servidor", details: erro.sqlMessage });
        });
}


module.exports = {
    atualizarParametro,
    listarParametro,
    criarParametro,
    atualizarParametro
};
