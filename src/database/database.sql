create database PayMetrics;
use PayMetrics;

create table empresa (
id_empresa int auto_increment primary key,
razão_social varchar(200) not null);

create table contato (
id_contato int auto_increment,
nome_contato varchar(100),
telefone varchar(20),
email_contato varchar(200),
fk_empresa int,
primary key (id_contato),
foreign key (fk_empresa)
references empresa(id_empresa) 
);


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
    sistema_operacional VARCHAR(100) NOT NULL,
    mac_address VARCHAR(50) NOT NULL,
    fk_empresa INT NOT NULL,
    PRIMARY KEY (id_servidor),
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id_empresa) 
);



create table componente(
id_componente int not null auto_increment,
nome varchar(200) not null,
unidade_medida varchar(50),
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
alerta_min int,
primary key (id_parametro, fk_componente),
foreign key (fk_componente) references componente(id_componente));


insert into empresa (razão_social)
values
('Amazon.com Inc.'),
('Amazon Brasil Ltda.'),
('Amazon Deutschland GmbH'),
('Amazon France SAS'),
('Amazon Canada ULC'), 
('Amazon Spain Services SL'); 

insert into contato (nome_contato, telefone, email_contato, fk_empresa)
values
('Andy Jassy', '+1-206-555-0100', 'andy.jassy@amazon.com', 1),
('Mariana Roth', '+55-11-5555-0101', 'mariana.roth@amazon.com.br', 2),
('Ralf Kleber', '+49-89-5555-0102', 'ralf.kleber@amazon.de', 3),
('Frédéric Duval', '+33-1-5555-0103', 'frederic.duval@amazon.fr', 4),
('Jesse Dougherty', '+1-604-555-0104', 'jesse.dougherty@amazon.ca', 5),
('Mariangela Marseglia', '+34-91-5555-0105', 'mariangela.marseglia@amazon.es', 6);

select * from usuarios;

insert into usuarios (nome, email, senha, administrador, fk_empresa)values
('Gabriele', 'gabi@gmail.com', 'Gabi@007', TRUE, 1),
('Samuel', 'samu@gmail.com', 'Gabi@007', FALSE, 1);