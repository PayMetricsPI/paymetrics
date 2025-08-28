var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)
    var instrucaoSql = `
        SELECT id_usuario, email FROM usuarios WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrar(nome, email, senha, administrador, fk_empresa) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, senha, email, administrador, fk_empresa);
    var instrucaoSql = `
        INSERT INTO usuarios (nome, email, senha, administrador, fk_empresa) VALUES ('${nome}', '${email}', '${senha}', '${administrador}', '${fk_empresa}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function renovar(IdUsuario, senha, novaSenha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function renovar():",IdUsuario, novaSenha, senha);
    var instrucaoSql = `
       UPDATE usuarios SET senha = ${novaSenha} WHERE id_usuario = ${id_usuario};`;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listar(IdEmpresa){
    console.log("ACESSEI O USUARIO MODEL \n \n \t\t >> se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco \n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar():", IdEmpresa);
    var instrucaoSql = ``;
    console .log("Executando a instrução SQL \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletar(IdUsuario){
    console.log("ACESSEI O USUARIO MODEL \n \n \t\t >> se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco \n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function deletar():", IdUsuario);
    var instrucaoSql = `delete from usuario where id = ${IdUsuario}`;
    console.log("Executei a instrução SQL \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


module.exports = {
    autenticar,
    cadastrar,
    renovar,
    listar,
    deletar
};