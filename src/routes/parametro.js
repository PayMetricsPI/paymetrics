const express = require("express");
const router = express.Router();
const parametroController = require("../controllers/parametroController");

router.post("/criarParametro/", function(req, res) {
    parametroController.criarParametro(req, res);
});

router.put("/atualizarParametros/:fk_servidor", function (req, res) {
    parametroController.atualizarParametro(req, res);
});
router.put("/editar", function(req, res) {
    parametroController.atualizarParametro(req, res);
});

router.get("/:fk_servidor", function(req, res) { 
    parametroController.listarParametro(req, res);
});

module.exports = router;