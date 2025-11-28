var express = require("express");
var router = express.Router();

var s3Controller = require('../controllers/s3Controller')

router.post("/uploadCSV", function (req, res) {
    s3Controller.novoCSVBucket(req, res)
})

router.get("/downloadJSON", function (req, res) {
    s3Controller.clientJSONBucket(req, res)
})


module.exports = router;