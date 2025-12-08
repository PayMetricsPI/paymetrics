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
    const parametros = req.body.parametros;
    const fk_servidor = req.params.fk_servidor;

    parametros.forEach(element => {
        parametroModel.atualizarParametro(element, fk_servidor)
    });

    res.status(200).json({ message: "Parâmetro atualizado com sucesso" })

}



module.exports = {
    atualizarParametro,
    listarParametro,
    criarParametro,
};
