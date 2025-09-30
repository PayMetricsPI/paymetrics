var express = require ("express");
var router = express.Router();

var servidorController = require("../controllers/servidorController");

router.delete("/deletarServidor/:id_servidor", function (req, res) {
    servidorController.deletarServidor(req, res);
});

router.post("/criarServidor", function (req, res) {
    servidorController.criarServidor(req, res);
});

router.put("/atualizarServidor", function(req, res){
    servidorController.atualizarServidor(req, res)
})

module.exports = router;