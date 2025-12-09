CREATE DATABASE IF NOT EXISTS paymetrics;
USE paymetrics;

CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    razao_social VARCHAR(200) NOT NULL
);

CREATE TABLE cargo (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL
);

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT,
    fk_empresa INT NOT NULL,
    fk_cargo INT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    senha VARCHAR(200) NOT NULL,
    PRIMARY KEY (id_usuario, fk_empresa, fk_cargo),
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id_empresa),
    FOREIGN KEY (fk_cargo) REFERENCES cargo(id),
    UNIQUE (email)
);

CREATE TABLE servidor (
    id_servidor INT NOT NULL AUTO_INCREMENT,
    fk_empresa INT NOT NULL,
    nome VARCHAR(200),
    ip VARCHAR(200),
    pais VARCHAR(200),
    estado VARCHAR(200),
    mac_address VARCHAR(50) NOT NULL,
    tipo_cpu VARCHAR(100) NOT NULL,
    ram INT NOT NULL,
    disco INT NOT NULL,
    PRIMARY KEY (id_servidor, fk_empresa),
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE componente (
    id_componente INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    unidade_medida VARCHAR(50),
    peso INT
);

CREATE TABLE parametro (
    id_parametro INT NOT NULL AUTO_INCREMENT,
    fk_servidor INT NOT NULL,
    fk_empresa INT NOT NULL,
    fk_componente INT NOT NULL,
    alerta_critico INT NOT NULL,
    alerta_normal INT NOT NULL,
    PRIMARY KEY (id_parametro, fk_servidor, fk_empresa, fk_componente),
    FOREIGN KEY (fk_servidor, fk_empresa) REFERENCES servidor(id_servidor, fk_empresa),
    FOREIGN KEY (fk_componente) REFERENCES componente(id_componente)
);

INSERT INTO empresa (razao_social) VALUES
('Amazon.com Inc.'),
('Amazon Brasil Ltda.'),
('Amazon Deutschland GmbH'),
('Amazon France SAS'),
('Amazon Canada ULC'),
('Amazon Spain Services SL');

INSERT INTO cargo (nome) VALUES
('RH'),
('Técnico'),
('Analista');

INSERT INTO usuarios (fk_empresa, fk_cargo, nome, email, senha) VALUES
(1,1,'Samuel','samuel@gmail.com','Senha@123'),
(1,2,'Guilherme','guigo@gmail.com','Senha@123'),
(1,3,'Bruno','bruninho@gmail.com','Senha@123');

INSERT INTO componente (nome, unidade_medida, peso) VALUES
('CPU', 'Porcentagem', 2),
('RAM', 'Porcentagem', 3),
('Mb Enviados - REDE', 'Bytes', 3),
('Mb Recebidos - REDE', 'Bytes', 3),
('DISCO', 'Porcentagem', 1);
