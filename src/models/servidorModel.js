var database = require("../database/config");

function criarServidor(nome, fk_empresa, pais, estado, mac_address, ip, tipo_cpu, ram, disco) {

    let sqlServidor = `
        INSERT INTO servidor 
            (nome, fk_empresa, ip, pais, estado, mac_address, tipo_cpu, ram, disco)
        VALUES 
            ('${nome}', ${fk_empresa}, '${ip}', '${pais}', '${estado}', '${mac_address}',
                '${tipo_cpu}',${ram}, ${disco});
    `;

    return database.executar(sqlServidor);
}



function deletarServidor(id_servidor, fk_empresa) {

    if (id_servidor == null || fk_empresa == null) {
        console.error("Erro: id_servidor ou fk_empresa indefinidos!");
        return Promise.reject("id_servidor ou fk_empresa indefinidos");
    }

    const sqlDeleteParametro = `
        delete from parametro
        where fk_servidor = ${id_servidor}
          and fk_empresa = ${fk_empresa};
    `;

    const sqlDeleteServidor = `
        delete from servidor 
        where id_servidor = ${id_servidor}
          and fk_empresa = ${fk_empresa};
    `;

    return database.executar(sqlDeleteParametro)
        .then(() => database.executar(sqlDeleteServidor));
}


function listarServidores(fk_empresa) {
    var instrucaoSql = `
        SELECT * FROM servidor 
        WHERE fk_empresa = ${fk_empresa};
    `;
    return database.executar(instrucaoSql);
}


function atualizarServidor(id_servidor, nome, pais, ip, estado, mac_address, tipo_cpu, ram, disco) {
    var instrucaoSql = `
        update servidor
        set 
            nome = '${nome}',
            pais = '${pais}',
            estado = '${estado}',
            mac_address = '${mac_address}',
            ip = '${ip}',
            tipo_cpu = '${tipo_cpu}',
            disco = '${disco}',
            ram = '${ram}'
        WHERE id_servidor = ${id_servidor};
    `;
    return database.executar(instrucaoSql);
}

function mapaGlobal(fk_empresa) {
    var instrucaoSql = `
        select      pais, COUNT(*) AS quantidade
        FROM servidor
        WHERE fk_empresa = ${fk_empresa}
        GROUP BY pais;
    `;
    return database.executar(instrucaoSql);
}

function mapaEstados(fk_empresa, pais) {
    const sql = `
        select estado, COUNT(*) AS quantidade
        from servidor
        where fk_empresa = ${fk_empresa} AND pais = '${pais}'
        GROUP BY estado;
    `;
    return database.executar(sql);
}


module.exports = {
    criarServidor,
    deletarServidor,
    listarServidores,
    atualizarServidor,
    mapaGlobal,
    mapaEstados
};
