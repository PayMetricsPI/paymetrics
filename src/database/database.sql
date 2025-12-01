create database payMetrics;
use payMetrics;

create table empresa (
id_empresa int auto_increment primary key,
razao_social varchar(200) not null);

create table cargo(
id int not null auto_increment primary key,
nome varchar(200) not null);

create table usuarios (
id_usuario int auto_increment,
fk_empresa int not null,
fk_cargo int not null,
nome varchar(200) not null,
email varchar(200) not null,
senha varchar(200) not null,
primary key (id_usuario, fk_empresa,fk_cargo),
foreign key (fk_empresa) references empresa(id_empresa),
foreign key (fk_cargo) references cargo(id),
unique (email)
);

create table servidor (
id_servidor int not null auto_increment,
fk_empresa int not null,
ip varchar(200),
pais varchar(200),
estado varchar(200),
mac_address varchar(50) not null,
tipo_cpu varchar(100) not null,
ram int not null,
disco int not null,
primary key (id_servidor, fk_empresa),
foreign key (fk_empresa) references empresa(id_empresa)
);



create table componente(
id_componente int not null auto_increment,
nome varchar(200) not null,
unidade_medida varchar(50),
peso int,
primary key (id_componente));

create table parametro(
id_parametro int not null auto_increment,
fk_servidor int not null,
fk_empresa int not null,
fk_componente int not null,
alerta_critico int not null,
alerta_normal int not null,
primary key (id_parametro,fk_servidor,fk_empresa,fk_componente),
foreign key (fk_servidor, fk_empresa)references servidor(id_servidor, fk_empresa),
foreign key (fk_componente) references componente (id_componente));

insert into empresa (razao_social)
values
('Amazon.com Inc.'),
('Amazon Brasil Ltda.'),
('Amazon Deutschland GmbH'),
('Amazon France SAS'),
('Amazon Canada ULC'),
('Amazon Spain Services SL');

desc usuarios;

insert into cargo (nome) values
('RH'),
('Técnico'),
('Analista');
select *from cargo;

insert into usuarios(fk_empresa, fk_cargo, nome, email, senha) values
(1,1,'Samuel','samuel@gmail.com','Senha@123'),
(1,2,'Guilherme','guigo@gmail.com','Senha@123'),
(1,3,'Bruno','bruninho@gmail.com','Senha@123');

select *from usuarios;

desc componente;
insert into componente(nome, unidade_medida, peso)values
('CPU', 'Porcentagem',2),
('RAM', 'Porcentagem',3),
('Mb Enviados - REDE', 'Bytes',3),
('Mb Recebidos - REDE', 'Bytes',3),
('DISCO', 'Porcentagem',1);

select *from componente


