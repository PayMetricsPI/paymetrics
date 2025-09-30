var database = require("../database/config")

function criarServidor(nome, sistema_operacional, fk_empresa) {
    console.log("ACESSO AO SERVIDOR MODEL");
    var instrucaoSql = `INSERT INTO servidor (nome, sistema_operacional, fk_empresa) VALUES ${nome}, ${sistema_operacional}, ${fk_empresa};`;
    console.log("Executando a instrução SQL:\n" + instrucaoSql);

    return database.executar(instrucaoSql);
}

function deletarServidor (id_servidor, fk_empresa){
    console.log("ACESSO AO SERIVIDOR MODEL")
    var instrucaoSql = `delete from servidor where id_servidor = ${id_servidor} and fk_empresa = ${fk_empresa}`;
    console.log("Executando a instrução SQL \n: " + instrucaoSql);
    return database.executar(instrucaoSql);
}
 function atualizarServidor (id_servidor, fk_empresa, nome, sistema_operacional){
     console.log("ACESSO AO SERVIDOR MODEL")
     var instrucaoSql = `update servidor set sistema_operacional =  ${sistema_operacional}, nome = ${nome}  where id_servidor = ${id_servidor} and fk_empresa = ${fk_empresa}`;
     console.log("Executando a instrução SQL \n" + instrucaoSql);
     return database.executar(instrucaoSql);
}

module.exports={
    deletarServidor,
    criarServidor,
    atualizarServidor
};