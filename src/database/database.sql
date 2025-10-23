create database payMetrics;
use PayMetrics;

create table empresa (
id_empresa int auto_increment primary key,
razao_social varchar(200) not null);

create table cargo(
id int not null auto_increment primary key,
nome varchar(200) not null);

create table usuarios (
id_usuario int auto_increment,
fk_empresa int not null,
nome varchar(200) not null,
email varchar(200) not null,
senha varchar(200) not null,
fk_cargo int not null,
primary key (id_usuario, fk_empresa),
foreign key (fk_empresa) references empresa(id_empresa),
foreign key (fk_cargo) references cargo(id),
unique (email)
);

create table servidor (
id_servidor int not null auto_increment,
fk_empresa int not null,
nome varchar(200),
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
alerta_max int not null,
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

select *from empresa;

select * from usuarios;

insert into usuarios (nome, email, senha, administrador, fk_empresa)values
('Gabriele', 'gabi@gmail.com', 'Gabi@007', TRUE, 1),
('Samuel', 'samu@gmail.com', 'Gabi@007', FALSE, 1);

insert into servidor (nome, mac_address, tipo_cpu,ram,disco,fk_empresa)
values("Alfa","00:19:B9:FB:E2:58","Xeon silver 8 core",64,4,1),
	  ("Beta","00:0C:6E:3C:D1:6D","Xeon gold 8 core",50,5,1),
      ("Omega","00:00:5E:00:53:AF","Xeon® Platinum 8450H",40,6,1);
