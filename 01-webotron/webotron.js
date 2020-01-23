#!/usr/bin/env node

/**
 * Webotron: Deploy websites to AWS.
 *
 * @description automates the process of deploying static websites to AWS.
 * @author Hossam ELMansy <hossamelmansy.developer@gmail.com>
 *
 * - Configure AWS S3 buckets
 *    - Create them
 *    - Set them up for static website hosting
 *    - Deploy local files to them
 * - Configure DNS with AWS Route53
 * - Configure a Content Delivery Network and SSL with AWS CloudFront
 */

const AWS = require("aws-sdk/global");
const program = require("commander");

const BucketManager = require("./bucketManager");

program
  .version("0.0.1")
  .description("Webotron deploys websites to AWS.")
  .option("--profile <profileName>", "Use a given AWS profile.", "default")
  .option("--region <regionName>", "Specify AWS region.", "us-east-1")
  .parseOptions(process.argv);

// setting AWS credentials, load it from `~/.aws/credentials` file
AWS.config.credentials = new AWS.SharedIniFileCredentials({
  profile: program.profile,
});
AWS.config.update({ region: program.region }); // update aws-sdk region

const bucketManager = new BucketManager(); // BucketManager

// list-buckets
program
  .command("list-buckets")
  .description("List all S3 buckets.")
  .action(async function() {
    const buckets = await bucketManager.getAllBuckets(); // get all buckets

    buckets.forEach(bucket => console.log(bucket)); // print buckets
  });

// list-bucket-objects
program
  .command("list-bucket-objects <bucket>")
  .description("List objects in an S3 bucket.")
  .action(async function(bucket) {
    bucketManager.setBucket(bucket); // set bucket
    const objects = await bucketManager.getObjects(); // get all bucket objects

    objects.forEach(object => console.log(object.Key)); // print objects
  });

// setup-bucket
program
  .command("setup-bucket <bucket>")
  .description("Create and configure S3 bucket.")
  .action(async function(bucket) {
    bucketManager.setBucket(bucket); // set bucket

    await bucketManager.init(); // create new S3 bucket
    await bucketManager.disableBlockPublicAccess(); // disable S3 bucket Block Public Access
    // update S3 bucket policy
    await bucketManager.updatePolicy(`{
      "Version":"2012-10-17",
      "Statement":[{
      "Sid":"PublicReadGetObject",
            "Effect":"Allow",
        "Principal": "*",
          "Action":["s3:GetObject"],
          "Resource":["arn:aws:s3:::${bucket}/*"
          ]
        }
      ]
    }`);
    await bucketManager.configureWebsite("index.html", "error.html"); // enable and configure S3 bucket for website hosting

    // print website URL
    console.log(
      `Website URL: http://${bucket}.s3-website-${AWS.config.region}.amazonaws.com`,
    );
  });

// sync
program
  .command("sync <pathName> <bucket>")
  .description("Sync contents of PATHNAME to BUCKET.")
  .action(async function(pathName, bucket) {
    bucketManager.setBucket(bucket); // set bucket

    await bucketManager.sync(pathName); // sync all files and folders to the bucket
  });

// parse arguments
(async function() {
  await program.parseAsync(process.argv);
})();
