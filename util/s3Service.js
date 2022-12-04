const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

exports.s3Upload = async (file, fileName) => {
  const REGION = process.env.AWS_BUCKET_REGION;
  const s3 = new S3Client({ region: REGION });

  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
  };
  return s3.send(new PutObjectCommand(param));
};
// exports.s3Delete = async (fileName) => {
//   const REGION = process.env.AWS_BUCKET_REGION;
//   const s3 = new S3Client({ region: REGION });

//   const param = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: fileName,
//   };
//   const data = await s3.send(new DeleteObjectCommand(param));
//   s3.send(new DeleteObjectCommand());
//   console.log(data);
//   return data;
// };
