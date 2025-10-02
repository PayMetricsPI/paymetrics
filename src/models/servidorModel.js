var database = require("../database/config");


function criarServidores(servidores) {
    let queries = servidores.map(s => {
        return `
            INSERT INTO servidor (nome, sistema_operacional, mac_address, fk_empresa)
            VALUES ('${s.nome}', '${s.sistema_operacional}', '${s.mac_address}', ${s.fk_empresa});
        `;
    }).join("\n");

    return database.executar(queries);
}

function deletarServidor(id_servidor, fk_empresa) {
    console.log("ACESSO AO SERVIDOR MODEL");
    var instrucaoSql = `
        DELETE FROM servidor 
        WHERE id_servidor = ${id_servidor} AND fk_empresa = ${fk_empresa};
    `;
    console.log("Executando a instrução SQL:\n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


function listarServidores(fk_empresa) {
    var instrucaoSql = `
        SELECT * FROM servidor 
        WHERE fk_empresa = ${fk_empresa};
    `;
    return database.executar(instrucaoSql);
}


function atualizarServidor(id_servidor, nome, sistema_operacional, mac_address) {
    var instrucaoSql = `
        UPDATE servidor
        SET nome = '${nome}', sistema_operacional = '${sistema_operacional}', mac_address = '${mac_address}'
        WHERE id_servidor = ${id_servidor};
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    criarServidores,
    deletarServidor,
    listarServidores,
    atualizarServidor
};
