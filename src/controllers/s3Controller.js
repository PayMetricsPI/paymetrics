const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function novoCSVBucket(req, res) {

    const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });

    const csvRaw = req.body.csvRaw;
    const csvName = req.body.csvName;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: csvName,
        Body: csvRaw,
        ContentType: "text/csv"
    }

    try {
        const command = new PutObjectCommand(params);
        const data = await s3Client.send(command);
        console.log("Upload feito:", data);
        return res.status(200).json(data);
    } catch (err) {
        console.log("Erro ao fazer o upload:", err);
    }

}


async function clientJSONBucket(req, res) {
    const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });

    const paramsList = {
        Bucket: process.env.AWS_BUCKET_NAME_CLIENT,
        Prefix: '',
    };

    try {
        const listResp = await s3Client.send(new ListObjectsV2Command(paramsList));
        const objetos = listResp.Contents || [];

        const keys = objetos
            .map(o => o.Key)

            .filter(k => k !== 'output/');


        const streamToString = (stream) =>
            new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', chunk => chunks.push(chunk));
                stream.on('error', reject);
                stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
            });

        const resultados = [];

        for (const key of keys) {
            const getResp = await s3Client.send(new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME_CLIENT,
                Key: key,
            }));
            const jsonString = await streamToString(getResp.Body);
            const jsonObj = JSON.parse(jsonString);
            resultados.push(jsonObj);
        }

        console.log('RESULTADOS LENGTH:', resultados.length);
        console.log('PRIMEIRO OBJ:', resultados[0]);

        return res.status(200).json({ data: resultados });
    } catch (err) {
        console.error('Erro ao listar/ler pasta:', err.name, err.code, err.message, err.stack);
        return res.status(500).json({ error: 'err.message' });
    }
}

module.exports = {
    novoCSVBucket,
    clientJSONBucket
}