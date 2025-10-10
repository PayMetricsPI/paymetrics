create database PayMetrics;
use PayMetrics;

create table empresa (
id_empresa int auto_increment primary key,
razao_social varchar(200) not null);

create table usuarios (
id_usuario int auto_increment,
nome varchar(200) not null,
email varchar(200) not null,
senha varchar(200) not null,
administrador boolean default false,
fk_empresa int not null,
primary key (id_usuario, fk_empresa),
foreign key (fk_empresa) references empresa(id_empresa),
unique (email)
);

create table servidor (
id_servidor INT NOT NULL AUTO_INCREMENT,
nome VARCHAR(200),
mac_address VARCHAR(50) NOT NULL,
tipo_cpu varchar(100) not null,
ram INT NOT NULL,
disco INT NOT NULL,
fk_empresa INT NOT NULL,
PRIMARY KEY (id_servidor),
FOREIGN KEY (fk_empresa) REFERENCES empresa(id_empresa)
);

create table componente(
id_componente int not null auto_increment,
nome varchar(200) not null,
unidade_medida varchar(50),
peso int,
primary key (id_componente));

create table servidor_componente(
fk_servidor int not null,
fk_empresa int not null,
fk_componente int not null,
primary key (fk_servidor, fk_empresa, fk_componente),
foreign key (fk_servidor)references servidor(id_servidor),
foreign key (fk_empresa)references empresa(id_empresa),
foreign key (fk_componente) references componente (id_componente));

create table parametro(
id_parametro int not null auto_increment,
fk_componente int not null,
alerta_max int,
primary key (id_parametro, fk_componente),
foreign key (fk_componente) references componente(id_componente));


insert into empresa (razao_social)
values
('Amazon.com Inc.'),
('Amazon Brasil Ltda.'),
('Amazon Deutschland GmbH'),
('Amazon France SAS'),
('Amazon Canada ULC'),
('Amazon Spain Services SL');

select * from usuarios;

insert into usuarios (nome, email, senha, administrador, fk_empresa)values
('Gabriele', 'gabi@gmail.com', 'Gabi@007', TRUE, 1),
('Samuel', 'samu@gmail.com', 'Gabi@007', FALSE, 1);