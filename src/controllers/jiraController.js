const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

async function getjira(req, res){
    const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });

    const input = {
        Bucket: process.env.AWS_CLIENT_JIRA,
        Key: "jira/data.json"
    }

    const command = new GetObjectCommand(input);
    const response = await s3Client.send(command);
    const bytes = await response.Body.transformToByteArray();

    const jsonString = Buffer.from(bytes).toString("utf-8");
    const data = JSON.parse(jsonString);

    console.log(data)
    return res.status(200).json(data)
}

module.exports = {
    getjira
}