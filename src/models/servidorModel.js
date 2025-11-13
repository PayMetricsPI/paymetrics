var database = require("../database/config");

function criarServidores(servidores) {
    let queries = servidores.map(s => {
        return `
            insert into servidor (nome,pais,estado mac_address, tipo_cpu, ram , disco, fk_empresa)
            VALUES ('${s.nome}',${pais}, ${estado},'${s.mac_address}','${s.tipo_cpu}', '${s.ram}', '${s.disco}', '${s.fk_empresa}');
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


function atualizarServidor(id_servidor, nome,pais, estado, mac_address, tipo_cpu, ram, disco) {
    var instrucaoSql = `
        update servidor
        set nome = '${nome}', pais = ${pais}, estado = ${estado}, mac_address = '${mac_address}', tipo_cpu = '${tipo_cpu}',
        disco = ${disco}, ram = ${ram}
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
