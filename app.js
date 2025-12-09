var ambiente_processo = 'desenvolvimento';
// var ambiente_processo = 'producao';

var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
// Acima, temos o uso do operador ternário para definir o caminho do arquivo .env
// A sintaxe do operador ternário é: condição ? valor_se_verdadeiro : valor_se_falso

require("dotenv").config({ path: caminho_env });

var express = require("express");
var cors = require("cors");
var path = require("path");
var PORTA_APP = process.env.APP_PORT;
var HOST_APP = process.env.APP_HOST;

var app = express();

var indexRouter = require("./src/routes/index");
var servidorRouter = require("./src/routes/servidor");
var redefinirSenhaRouter = require("./src/routes/usuario");
var deletarusuarioRouter = require("./src/routes/usuario");
var listarRouter = require("./src/routes/usuario");
var metricaRouter = require("./src/routes/metrica");

var s3Router = require("./src/routes/s3");
var usuariosRouter = require("./src/routes/usuario");
var parametrosRouter = require("./src/routes/parametro");
var newsRouter = require("./src/routes/news_bruno");
var jiraRouter = require("./src/routes/jira");

var BucketRouter = require("./src/routes/BucketRoute")

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/usuarios", usuariosRouter);
app.use("/servidores", servidorRouter);
app.use("/redefinirSenha", redefinirSenhaRouter);
app.use("/deletar", deletarusuarioRouter);
app.use("/listar", listarRouter);
app.use("/metrica", metricaRouter);
app.use("/s3", s3Router);
app.use("/news", newsRouter);
app.use("/parametro", parametrosRouter);
app.use("/jira", jiraRouter);
app.use("/BucketRoute", BucketRouter);

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use("/s3", s3Router);


app.listen(PORTA_APP, function () {
    console.log(`

    ##   ##  ######   #####             ####       ##     ######     ##              ##  ##    ####    ######  
    ##   ##  ##       ##  ##            ## ##     ####      ##      ####             ##  ##     ##         ##  
    ##   ##  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##        ##   
    ## # ##  ####     #####    ######   ##  ##   ######     ##     ######   ######   ##  ##     ##       ##    
    #######  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##      ##     
    ### ###  ##       ##  ##            ## ##    ##  ##     ##     ##  ##             ####      ##     ##      
    ##   ##  ######   #####             ####     ##  ##     ##     ##  ##              ##      ####    ######  
    \n\n\n                                                                                                 
    Servidor do seu site já está rodando! Acesse o caminho a seguir para visualizar .: http://${HOST_APP}:${PORTA_APP} :. \n\n
    Você está rodando sua aplicação em ambiente de .:${process.env.AMBIENTE_PROCESSO}:. \n\n
    \tSe .:desenvolvimento:. você está se conectando ao banco local. \n
    \tSe .:producao:. você está se conectando ao banco remoto. \n\n
    \t\tPara alterar o ambiente, comente ou descomente as linhas 1 ou 2 no arquivo 'app.js'\n\n`);
});

