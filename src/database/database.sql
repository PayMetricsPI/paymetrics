create database PayMetrics;
use PayMetrics;


create table endereco (
id_endereco int auto_increment,
logradouro varchar(200) not null,
numero varchar(40) not null,
cidade varchar(100) not null,
sigla_estado char(2) not null,
sigla_pais char(2) not null,
cartao_postal varchar(40) not null,
primary key (id_endereco)
);

create table contato (
id_contato int auto_increment,
nome_contato varchar(100),
telefone varchar(15),
email_contato varchar(200),
fk_empresa int,
primary key (id_contato),
foreign key (fk_empresa)
references empresa(id_empresa) 
);


create table empresa (
id_empresa int auto_increment,
razão_social varchar(200) not null,
fk_endereco int, 
primary key (id_empresa),
foreign key (fk_endereco)
references endereco(id_endereco)
);

create table usuarios (
id_usuario int not null auto_increment,
nome varchar(200) not null,
senha varchar(200) not null,
email varchar(200) not null,
administrador boolean default false,
fk_empresa int not null,
primary key (id_usuario),
foreign key (fk_empresa) references empresa(id_empresa),
unique (email)
);

update usuarios set senha = '${NovaSenha}' where id_usuario = '${ID_USUARIO}';