var express = require("express");
var router = express.Router();

var metricaController = require('../controllers/metricaController')

router.post("/set", function(req, res){
    metricaController.novaMedicao(req, res)
})

router.get("/get/:empresa", function(req, res){
    metricaController.obterMedicoesPorEmpresa(req, res)
})


module.exports = router;