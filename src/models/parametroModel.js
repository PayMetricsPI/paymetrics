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

function atualizarParametro(fk_servidor, fk_componente, id_parametro, alerta_critico, alerta_normal) {
    var instrucaoSql = `
        update parametro
        set alerta_critico = ${alerta_critico}, alerta_normal = ${alerta_normal}
        where id_parametro = ${id_parametro} and fk_servidor = '${fk_servidor}' and fk_componente = '${fk_componente}';
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    criarParametro,
    atualizarParametro
};