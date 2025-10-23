var express = require("express");
var router = express.Router();

var metricaController = require('../controllers/metricaController')

router.post("/set", function(req, res){
    metricaController.novaMedicao(req, res)
})

router.get("/obterPorEmpresa/:empresa", function(req, res){
    metricaController.obterMedicoesPorEmpresa(req, res)
})

router.get("/obterPorMAC/:mac", function(req, res){
    metricaController.obterMedicoesPorMAC(req, res)
})

router.get("/obterUltimaPorMAC/:mac", function(req, res){
    metricaController.obterUltimaMedicaoPorMAC(req, res)
})


module.exports = router;