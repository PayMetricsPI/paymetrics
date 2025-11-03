const express = require("express");
const router = express.Router();
const parametroController = require("../controllers/parametroController");

router.post('/criarParametro', (req, res) => {
    parametroController.criarParametro(req, res);
});

router.put("/atualizarParametro/:id_servidor", function (req, res) {
    parametroController.atualizarParametro(req, res);
});


module.exports = router;