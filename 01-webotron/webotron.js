const AWS = require("aws-sdk/global");
const S3 = require("aws-sdk/clients/s3");
const program = require("commander");

program.version("0.0.1");
program.description("Webotron deploys websites to AWS");

// setting AWS credentials, load it from `~/.aws/credentials` file
const credentials = new AWS.SharedIniFileCredentials({
  profile: "javascriptAutomation",
});
AWS.config.credentials = credentials;
AWS.config.update({ region: "us-east-1" });

const s3 = new S3({ apiVersion: "latest" });

program
  .command("list-buckets")
  .description("List all S3 buckets")
  .action(listS3Buckets);

program
  .command("list-bucket-objects <bucketName>")
  .description("List objects in an S3 bucket")
  .action(listS3BucketObjects);

(async function() {
  await program.parseAsync(process.argv);
})();

// ##########################################################################################
// ##########################################################################################

async function listS3Buckets() {
  const result = await s3.listBuckets().promise();

  result.Buckets.forEach(function(bucket) {
    console.log(bucket.Name);
  });
}

async function listS3BucketObjects(bucketName) {
  const result = await s3.listObjectsV2({ Bucket: bucketName }).promise();

  result.Contents.forEach(function(object) {
    console.log(object.Key);
  });
}
