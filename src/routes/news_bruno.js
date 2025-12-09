var express = require("express");
var router = express.Router();

var newsController = require('../controllers/newsController')

router.get("/obter", (req, res) => {
    newsController.getNewsFromBucket(req, res);
})

module.exports = router;