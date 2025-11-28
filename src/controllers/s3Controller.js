const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

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

// async function trustedCSVBucket(req, res) {
//     const s3Client = new S3Client({
//         region: process.env.AWS_REGION,
//         credentials: {
//             accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//             secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//             sessionToken: process.env.AWS_SESSION_TOKEN
//         }
//     });

//     const csvTrusted = req.body.csvTrusted;
//     const csvName = req.body.csvName;

//     const params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: csvName,
//         Body: csvTrusted,
//         ContentType: "text/csv"
//     }

//     try {
//         const command = new GetObjectCommand(params);
//         const data = await s3Client.send(command);
//         const streamToString = (stream) =>
//             new Promise((resolve, reject) => {
//                 const chunks = [];
//                 stream.on('data', (chunk) => chunks.push(chunk));
//                 stream.on('error', reject);
//                 stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
//             });

//         parse(csvString, {
//             columns: true,
//             skip_empty_lines: true,
//         }, (err, records) => {
//             if (err) {
//                 console.error("Erro ao converter CSV:", err);
//                 return res.status(500).json({ error: "Erro ao converter CSV" });
//             }
//             return res.status(200).json({ data: records });
//         });

//         const csvData = await streamToString(data.Body);
//         return csvData;
//     } catch (err) {
//         console.error("Erro ao obter CSV:", err);
//     }

// }
async function trustedCSVBucket(req, res) {
    const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });

    const csvName = req.body.csvName;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: csvName
    };

    try {
        const command = new GetObjectCommand(params);
        const data = await s3Client.send(command);

        const streamToString = (stream) =>
            new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', chunk => chunks.push(chunk));
                stream.on('error', reject);
                stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
            });

        const csvData = await streamToString(data.Body);

        parse(csvData, {
            columns: true,
            skip_empty_lines: true,
        }, (err, records) => {
            if (err) {
                console.error("Erro ao converter CSV:", err);
                return res.status(500).json({ error: "Erro ao converter CSV" });
            }
            return res.status(200).json({ data: records });
        });

    } catch (err) {
        console.error("Erro ao obter CSV:", err);
        return res.status(500).json({ error: "Erro ao obter arquivo CSV" });
    }
}

// async function clientJSONBucket(req, res) {
//     const s3Client = new S3Client({
//         region: process.env.AWS_REGION,
//         credentials: {
//             accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//             secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//             sessionToken: process.env.AWS_SESSION_TOKEN
//         }
//     });

//         const jsonName = req.body.jsonName;

//         const params = {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: jsonName
//         };

//         try {
//             const command = new GetObjectCommand(params);
//             const data = await s3Client.send(command);

//             const streamToString = (stream) =>
//                 new Promise((resolve, reject) => {
//                     const chunks = [];
//                     stream.on('data', chunk => chunks.push(chunk));
//                     stream.on('error', reject);
//                     stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
//                 });

//             const jsonDataString = await streamToString(data.Body);
//             const jsonObj = JSON.parse(jsonDataString);

//             return res.status(200).json({ data: jsonObj });
//         } catch (err) {
//             console.error("Erro ao obter JSON:", err);
//             return res.status(500).json({ error: "Erro ao obter arquivo JSON" });
//         }
//     }

module.exports = {
    novoCSVBucket,
    trustedCSVBucket
}