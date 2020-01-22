const AWS = require("aws-sdk/global");
const S3 = require("aws-sdk/clients/s3");

// setting AWS credentials, load it from `~/.aws/credentials` file
const credentials = new AWS.SharedIniFileCredentials({ profile: "javascriptAutomation" });
AWS.config.credentials = credentials;
AWS.config.update({ region: "us-east-1" });

const s3 = new S3({ apiVersion: "latest" });


