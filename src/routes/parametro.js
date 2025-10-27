var express = require("express");
var router = express.Router();

var parametroController= require("../controllers/parametroController");

// router.get("/:fk_empresa", function(req, res) {
//     parametroController.listarServidores(req, res);
// });


router.post("/criarParametro", function(req, res) {
    parametroController.criarParametro(req, res);
});

router.put("/atualizarParametro/:id_servidor", function(req, res) {
    parametroController.atualizarParametro(req, res);
});


// router.post("/deletarServidor/:id_servidor", function(req, res) {
//     parametroController.deletarServidor(req, res);
// });


module.exports = router;