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
    const parametros = req.body;

    parametroModel.atualizarParametroLista(parametros)
        .then(() => res.status(200).json({ message: "Parâmetros atualizados com sucesso" }))
        .catch(erro => {
            console.error("Erro ao atualizar parâmetros:", erro);
            res.status(500).json({ error: erro });
        });
}



module.exports = {
    atualizarParametro,
    listarParametro,
    criarParametro,
};
