var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)
    var instrucaoSql = `
    select 
    u.id_usuario as id_usuario,  u.nome as nome,
    u.email as email, u.administrador as id_administrador, u.fk_empresa as fk_empresa,
    e.razão_social as razao_social
    from usuarios u
    inner join empresa e on e.id_empresa = u.fk_empresa
    where u.email = '${email}' and u.senha = '${senha}'; 
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

function renovar(id_usuario, novaSenha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function renovar():",id_usuario, novaSenha);
    var instrucaoSql = `
       UPDATE usuarios SET senha = "${novaSenha}" WHERE id_usuario = ${id_usuario};`;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listar(IdEmpresa){
    console.log("ACESSEI O USUARIO MODEL \n \n \t\t >> se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco \n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar():", IdEmpresa);
    var instrucaoSql = `select u.id_usuario as id, u.nome, u.email, e.razão_social as razao_social, u.administrador as adm
        from usuarios u inner join 
        empresa e on e.id_empresa = u.fk_empresa where e.id_empresa = ${IdEmpresa};`;
    console .log("Executando a instrução SQL \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletar(IdUsuario){
    console.log("ACESSEI O USUARIO MODEL \n \n \t\t >> se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco \n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function deletar():", IdUsuario);
    var instrucaoSql = `delete from usuarios where id_usuario = ${IdUsuario}`;
    console.log("Executei a instrução SQL \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function verificarSenha(idUsuario, senhaAntiga) {
    var instrucao = `Select * from usuarios where id_usuario = ${idUsuario} and senha = "${senhaAntiga}"`;
    return database.executar(instrucao);
}

function verificar(IdUsuario) {
    console.log("ACESSEI O USUARIO MODEL \n \n \t\t >> se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco \n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function verificar():", IdUsuario);
    var instrucaoSql = ` select u.nome, u.email, u.fk_empresa as empresa from usuarios u
        inner join empresa e where e.id_empresa = u.fk_empresa and u.id_usuario = ${idUsuario};`
    return database.executar(instrucaoSql)
}


module.exports = {
    autenticar,
    cadastrar,
    renovar,
    listar,
    deletar,
    verificarSenha,
    verificar
};