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

create table empresa (
id_empresa int auto_increment,
razão_social varchar(200) not null,
fk_endereco int, 
primary key (id_empresa),
foreign key (fk_endereco)
references endereco(id_endereco)
);

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
primary key (id_usuario),
foreign key (fk_empresa) references empresa(id_empresa),
unique (email)
);

create table maquina (
id_maquina int auto_increment primary key,
mac_adress varchar(45),
fk_empresa int,
foreign key (fk_empresa) references empresa(id_empresa)
);

create table componente (
id_componente int auto_increment primary key,
nome_componente varchar(45),
unidade_medida decimal(10,2)
);

create table componente_maquina (
fk_maquina int,
fk_componente int,
limite_hardware decimal(10,2),
foreign key (fk_maquina) references maquina(id_maquina),
foreign key (fk_componente) references componente(id_componente),
primary key (fk_maquina, fk_componente)
);

insert into endereco (logradouro, numero, cidade, sigla_estado, sigla_pais, cartao_postal)
values
('7th Avenue', '410 Terry', 'Seattle', 'WA', 'US', '98109'),
('Avenida Juscelino Kubitschek', '2041', 'São Paulo', 'SP', 'BR', '04543-011'),
('Marcel-Breuer-Strasse', '12', 'Munique', 'BY', 'DE', '80807'),
('Rue de l\Héronnière', '67', 'Clichy', 'ID', 'FR', '92110'),
('West Georgia Street', '402', 'Vancouver', 'BC', 'CA', 'V6B 5A1'),
('Calle Ramírez de Prado', '5', 'Madrid', 'MD', 'ES', '28045');

insert into empresa (razão_social, fk_endereco)
values
('Amazon.com Inc.', 1),
('Amazon Brasil Ltda.', 2),
('Amazon Deutschland GmbH', 3),
('Amazon France SAS', 4),
('Amazon Canada ULC', 5), 
('Amazon Spain Services SL', 6); 

insert into contato (nome_contato, telefone, email_contato, fk_empresa)
values
('Andy Jassy', '+1-206-555-0100', 'andy.jassy@amazon.com', 1),
('Mariana Roth', '+55-11-5555-0101', 'mariana.roth@amazon.com.br', 2),
('Ralf Kleber', '+49-89-5555-0102', 'ralf.kleber@amazon.de', 3),
('Frédéric Duval', '+33-1-5555-0103', 'frederic.duval@amazon.fr', 4),
('Jesse Dougherty', '+1-604-555-0104', 'jesse.dougherty@amazon.ca', 5),
('Mariangela Marseglia', '+34-91-5555-0105', 'mariangela.marseglia@amazon.es', 6);

select * from usuarios;
-- update usuarios set senha = {NovaSenha} where id_usuario = {ID_USUARIO};