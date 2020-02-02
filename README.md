# automating-aws-with-nodejs

Examples for automating AWS with NodeJS

## 01-webotron

Webotron is a script that will sync a local directory to an s3 bucket, and optionally configure Route53 and CloudFront as well.

### Features

- List buckets
- List contents of a bucket
- Create and set up a bucket
- Sync directory tree to a bucket
- Set AWS profile with `--profile <profileName>`
- Configure Route53 domain
- Setup CloudFront CDN and SSL

## 02-notifon

Notifon is a project to notify Slack users of changes to your AWS account using CloudWatch Events

### Features

- Send notifications to Slack when CloudWatch events happen

## 03-videolyzer

Videolyzer is a project that doing image recognition and extract data from videos using AWS Rekognition on videos uploaded to an S3 bucket, and save the results in a DynamoDB table.
