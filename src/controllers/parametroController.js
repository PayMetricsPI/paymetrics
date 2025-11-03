var parametroModel = require("../models/parametroModel");

function criarParametro(req, res) {
    const parametros = req.body.parametros;

    parametroModel.criarParametro(parametros)
        .then(result => {
            res.status(201).json({
                message: "Parâmetros criados com sucesso",
                insertId: result.insertId
            });
        })
        .catch(erro => {
            console.error("Erro ao criar parâmetros:", erro);
            res.status(500).json({ error: "Erro interno ao criar parâmetros" });
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
    criarParametro,
    atualizarParametro
};
