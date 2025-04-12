const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

// Configure the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file) => {
  try {
    const folder = process.env.AWS_BUCKET_FOLDER ? `${process.env.AWS_BUCKET_FOLDER}/` : '';
    const fileKey = `${folder}profilepictures/photo-${Date.now()}.${file.originalname.split('.').pop()}`;
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      },
    });
    const result = await upload.done();
    console.log('Uploaded to S3:', result.Location);
    return result.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

// Export s3Client and DeleteObjectCommand for use in other files
module.exports = { s3Client, uploadToS3, DeleteObjectCommand };