var database = require("../database/config");

function criarParametro(servidores) {
    let queries = servidores.map(s => {
        return `
            insert into parametro (fk_servidor,fk_empresa,fk_componente,alerta_critico, alerta_normal)
            VALUES ('${s.fk_servidor}','${s.fk_empresa}'),'${s.fk_componente}','${s.alerta_critico}', '${s.alerta_normal}';
        `;
    }).join("\n");

    return database.executar(queries);
}

// function deletarParametro(id_servidor, fk_empresa) {

//      if (id_servidor == null || fk_empresa == null) {
//         console.error("Erro: id_servidor ou fk_empresa indefinidos!");
//         return Promise.reject("id_servidor ou fk_empresa indefinidos");
//     }
    
//     var instrucaoSql = `
//         delete from servidor 
//         where id_servidor = ${id_servidor} AND fk_empresa = ${fk_empresa};
//     `;
//     console.log("Executando a instrução SQL:\n" + instrucaoSql);
//     return database.executar(instrucaoSql);
// }

function atualizarParametro(fk_servidor,fk_empresa,fk_componente,alerta_critico, alerta_normal) {
    var instrucaoSql = `
        update paramtro
        set fk_servidor = '${fk_servidor}', fk_empresa = '${fk_empresa}', fk_componente = '${fk_componente}',
        alerta_critico = ${alerta_critico}, alerta_normal = ${alerta_normal}
        where id_paramtro = ${id_paramtro};
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
    // deletarParametro,
    atualizarParametro,
    listarParametro
};