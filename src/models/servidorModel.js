var database = require("../database/config");

function criarServidores(servidores) {
    let promises = servidores.map(s => {

        let sqlServidor = `
            INSERT INTO servidor 
                (nome, fk_empresa, ipEC2, pais, estado, mac_address, tipo_cpu, ram, disco)
            VALUES 
                ('${s.nome}', ${s.fk_empresa}, '${s.ipEc2}', '${s.pais}', '${s.estado}', '${s.mac_address}',
                 '${s.tipo_cpu}',${s.ram}, ${s.disco});
        `;

        return database.executar(sqlServidor).then(resultado => {
            const fk_servidor = resultado.insertId;

            let sqlParametro = `
                INSERT INTO parametro (fk_servidor, fk_empresa, fk_componente, alerta_critico, alerta_normal)
                VALUES (${fk_servidor}, ${s.fk_empresa}, 5, 0, 0);
            `;

            return database.executar(sqlParametro).then(() => {
                
                return { fk_servidor };
            });
        });
    });


    return Promise.all(promises).then(lista => lista[0]);
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


function atualizarServidor(id_servidor, nome, pais,ipEc2, estado, mac_address, tipo_cpu, ram, disco) {
    var instrucaoSql = `
        update servidor
        set 
            nome = '${nome}',
            pais = '${pais}',
            estado = '${estado}',
            mac_address = '${mac_address}',
            ipEc2 = '${ipEc2}',
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
    criarServidores,
    deletarServidor,
    listarServidores,
    atualizarServidor,
    mapaGlobal,
    mapaEstados
};
