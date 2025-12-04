var express = require("express");
var router = express.Router();

var jiraController = require("../controllers/jiraController.js");


router.get("/buscaralertas", function(req, res) {
    jiraController.getjira(req, res);
});

module.exports = router;
