const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");
var s3Controller = require('../controllers/s3Controller');

AWS.config.update({
    region: "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
});

const s3 = new AWS.S3();
const bucket = process.env.AWS_BUCKET_NAME_CLIENT;


router.post("/uploadCSV", (req, res) => {
    s3Controller.novoCSVBucket(req, res);
});


router.get("/downloadJSON", (req, res) => {
    s3Controller.clientJSONBucket(req, res);
});


router.get("/ultimodia", async (req, res) => {
    try {
        const dados = await s3.listObjectsV2({
            Bucket: bucket,
            Prefix: "latenciaClient-json/"
        }).promise();

        const lista = (dados.Contents || [])
            .map(obj => obj.Key)
            .filter(k => k.endsWith("-latencia.json"))
            .sort()
            .reverse();

        if (lista.length === 0) {
            return res.status(404).json({ erro: "Nenhum arquivo encontrado" });
        }

        const arquivo = lista[0];

        const obj = await s3.getObject({
            Bucket: bucket,
            Key: arquivo
        }).promise();

        res.json(JSON.parse(obj.Body.toString("utf-8")));

    } catch (e) {
        console.error("Erro rota /s3/ultimodia:", e);
        res.status(500).json({ erro: "Falha ao carregar arquivo mais recente" });
    }
});


router.get("/*", async (req, res) => {
    const key = req.params[0];

    try {
        const data = await s3.getObject({
            Bucket: bucket,
            Key: key
        }).promise();

        res.setHeader("Content-Type", "application/json");
        res.send(data.Body.toString("utf-8"));
    } catch (err) {
        console.error("Erro S3:", err.code, key);
        res.status(404).json({ erro: "Arquivo não encontrado" });
    }
});

module.exports = router;
