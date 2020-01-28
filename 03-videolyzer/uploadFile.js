#!/usr/bin/env node

const AWS = require("aws-sdk/global");
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const path = require("path");
const program = require("commander");

program
  .version("0.0.1")
  .description("Upload file to S3 bucket.")
  .requiredOption("--profile <profile>", "Specify AWS profile.")
  .requiredOption("--pathname <pathname>", "Specify File path.")
  .requiredOption("--bucket <bucket>", "Specify S3 bucket.", "us-east-1");

(async function() {
  await program.parseAsync(process.argv);
})();

AWS.config.credentials = new AWS.SharedIniFileCredentials({
  profile: program.profile,
});

(async function uploadFile() {
  const { bucket, pathname } = program;
  const filePath = !path.isAbsolute(pathname)
    ? path.resolve(pathname)
    : pathname;
  const fileKey = path.basename(filePath);
  const fileContent = fs.readFileSync(program.pathname);
  const s3 = new S3({ apiVersion: "latest" });

  await s3
    .upload({
      Bucket: bucket,
      Key: fileKey,
      Body: fileContent,
    })
    .promise();
})();
