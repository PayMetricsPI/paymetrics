const aws = require('aws-sdk');

const S3_BUCKET = 'bucket-guigo-client';

const s3 = new aws.S3({
    region: 'us-east-1',
    accessKeyId: "",
    secretAccessKey: "",
    sessionToken: ""
});

const getS3Object = async (objectKey) => {
    try {
        const params = { Bucket: S3_BUCKET, Key: objectKey };
        const data = await s3.getObject(params).promise();
        const jsonContent = JSON.parse(data.Body.toString('utf-8'));

        if (jsonContent.timeseries) {
            console.log("Timeseries:", jsonContent.timeseries.length);
        }

        if (jsonContent.calendar) {
            console.log("Calendar:", jsonContent.calendar.length);
        }

        if (Array.isArray(jsonContent)) {
            console.log("Insights", jsonContent.length);
        }

        return jsonContent;

    } catch (e) {
        throw new Error(`Erro na leitura do JSON: ${e.message}`);
    }
};

module.exports = { getS3Object };
