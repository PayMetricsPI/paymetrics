var database = require("../database/config");


function criarServidores(servidores) {
    let queries = servidores.map(s => {
        return `
            insert into servidor (nome, sistema_operacional, mac_address, fk_empresa)
            VALUES ('${s.nome}', '${s.sistema_operacional}', '${s.mac_address}', ${s.fk_empresa});
        `;
    }).join("\n");

    return database.executar(queries);
}

function deletarServidor(id_servidor, fk_empresa) {

     if (id_servidor == null || fk_empresa == null) {
        console.error("Erro: id_servidor ou fk_empresa indefinidos!");
        return Promise.reject("id_servidor ou fk_empresa indefinidos");
    }
    
    var instrucaoSql = `
        delete from servidor 
        where id_servidor = ${id_servidor} AND fk_empresa = ${fk_empresa};
    `;
    console.log("Executando a instrução SQL:\n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


function listarServidores(fk_empresa) {
    var instrucaoSql = `
        select * from servidor 
        where fk_empresa = ${fk_empresa};
    `;
    return database.executar(instrucaoSql);
}


function atualizarServidor(id_servidor, nome, sistema_operacional, mac_address) {
    var instrucaoSql = `
        update servidor
        set nome = '${nome}', sistema_operacional = '${sistema_operacional}', mac_address = '${mac_address}'
        where id_servidor = ${id_servidor};
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    criarServidores,
    deletarServidor,
    listarServidores,
    atualizarServidor
};
