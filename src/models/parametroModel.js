var database = require("../database/config");

function criarParametro(parametros) {
    console.log(parametros)
    parametros.map(p =>{
        database.executar(
            `
            insert into parametro (fk_servidor, fk_empresa, fk_componente, alerta_critico, alerta_normal)
            VALUES (${p.fk_servidor}, ${p.fk_empresa}, ${p.fk_componente}, ${p.alerta_critico}, ${p.alerta_normal});
            `
        );
    });

    return
}

function atualizarParametro(e, fk_servidor) {
    var instrucaoSql = `
        update parametro
        set alerta_${e.tipo} = ${e.valor}
        where fk_servidor = '${fk_servidor}' and fk_componente = '${e.fk_componente}'
        `;
    return database.executar(instrucaoSql);
}

function listarParametro(fk_servidor) {
    var instrucaoSql = `
        select * from parametro 
        inner join componente on parametro.fk_componente = componente.id_componente
        where fk_servidor = ${fk_servidor};
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    criarParametro,
    atualizarParametro,
    listarParametro
};