const AWS = require("aws-sdk/global");
const S3 = require("aws-sdk/clients/s3");
const program = require("commander");
const fs = require("fs");

program.version("0.0.1");
program.description("Webotron deploys websites to AWS");

// setting AWS credentials, load it from `~/.aws/credentials` file
const credentials = new AWS.SharedIniFileCredentials({
  profile: "javascriptAutomation",
});
AWS.config.credentials = credentials;
AWS.config.update({ region: "us-east-1" });

// TODO: command --profile to select profile
// TODO: command --region to override profile region
const s3 = new S3({ apiVersion: "latest" });

// list-buckets
program
  .command("list-buckets")
  .description("List all S3 buckets")
  .action(listS3Buckets);

// list-bucket-objects
program
  .command("list-bucket-objects <bucketName>")
  .description("List objects in an S3 bucket")
  .action(listS3BucketObjects);

// setup-bucket
program
  .command("setup-bucket <bucketName>")
  .description("Create and configure S3 bucket")
  .action(async function(bucketName) {
    // create S3 bucket
    await s3
      .createBucket({
        Bucket: bucketName,
        CreateBucketConfiguration: { LocationConstraint: AWS.config.region },
      })
      .promise();

    // upload website files
    const fileContent = fs.readFileSync("index.html");
    await s3
      .upload({
        Bucket: bucketName,
        Key: "index.html",
        Body: fileContent,
        ContentType: "text/html",
      })
      .promise();

    // disable S3 bucket Block Public Access
    await s3.deletePublicAccessBlock({ Bucket: bucketName }).promise();

    // update S3 bucket policy to make it public
    await s3
      .putBucketPolicy({
        Bucket: bucketName,
        Policy: `{
                  "Version":"2012-10-17",
                  "Statement":[{
                  "Sid":"PublicReadGetObject",
                        "Effect":"Allow",
                    "Principal": "*",
                      "Action":["s3:GetObject"],
                      "Resource":["arn:aws:s3:::${bucketName}/*"
                      ]
                    }
                  ]
                }`,
      })
      .promise();

    // enable and configure S3 bucket static website hosting
    await s3
      .putBucketWebsite({
        Bucket: bucketName,
        WebsiteConfiguration: {
          IndexDocument: { Suffix: "index.html" },
          ErrorDocument: { Key: "error.html" },
        },
      })
      .promise();

    console.log(
      `Website URL: http://${bucketName}.s3-website-${AWS.config.region}.amazonaws.com`,
    );
  });

// parse arguments
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
