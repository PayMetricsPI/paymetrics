const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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

module.exports = {
    novoCSVBucket
}