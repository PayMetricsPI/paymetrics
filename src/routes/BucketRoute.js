var express = require("express");
var router = express.Router();

let BucketController = require('../controllers/BucketController')

router.post("/getS3Object", async function(req, res){
    try {
        const objectKey = req.body.key;
        const data = await BucketController.getS3Object(objectKey);

        res.json({ 
            success: true, 
            content: data
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
