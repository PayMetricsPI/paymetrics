var express = require("express");
var router = express.Router();

var servidorController = require("../controllers/servidorController");

// ROTAS MAIS ESPECÍFICAS PRIMEIRO
router.get("/mapa/:fk_empresa/:pais", servidorController.mapaEstados);
router.get("/mapa/:fk_empresa", servidorController.mapaGlobal);

// SÓ DEPOIS A GENÉRICA
router.get("/:fk_empresa", servidorController.listarServidores);

// CRUD
router.post("/criarServidor", servidorController.criarServidores);
router.put("/atualizarServidor/:id_servidor", servidorController.atualizarServidor);
router.post("/deletarServidor/:id_servidor", servidorController.deletarServidor);

module.exports = router;
