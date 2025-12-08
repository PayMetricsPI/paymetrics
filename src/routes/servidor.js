var express = require("express");
var router = express.Router();

var servidorController = require("../controllers/servidorController");


router.get("/:fk_empresa", function(req, res) {
    servidorController.listarServidores(req, res);
});


router.post("/criarServidor", function(req, res) {
    servidorController.criarServidor(req, res);
});

router.put("/atualizarServidor/:id_servidor", function(req, res) {
    servidorController.atualizarServidor(req, res);
});


router.post("/deletarServidor/:id_servidor", function(req, res) {
    servidorController.deletarServidor(req, res);
});

router.get("/mapa/:fk_empresa/:pais", servidorController.mapaEstados);
router.get("/mapa/:fk_empresa", servidorController.mapaGlobal);

module.exports = router;
