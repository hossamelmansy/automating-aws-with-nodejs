/**
 * Class representing a Bucket.
 *
 * @class BucketManager
 * @description used to manage all API calls to S3 bucket
 * @author Hossam ELMansy <hossamelmansy.developer@gmail.com>
 */

const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const path = require("path");
const mime = require("mime");

class BucketManager {
  /**
   * @constructor
   * @param {string} bucket - The name of the bucket.
   */
  constructor(bucket = "") {
    this.s3 = new S3({ apiVersion: "latest" });
    this.bucket = bucket;
  }

  /**
   * Set bucket name.
   * @function setBucket
   * @param {string} bucket - The name of the bucket.
   */
  setBucket(bucket = "") {
    this.bucket = bucket;
  }

  /**
   * Get all buckets.
   * @function getAllBuckets
   * @returns {Array<string>} buckets - List of buckets.
   */
  async getAllBuckets() {
    const { Buckets } = await this.s3.listBuckets().promise();

    return Buckets.map(bucket => bucket.Name);
  }

  /**
   * Get all objects in the bucket.
   * @function getObjects
   * @returns {Array<object>} objects - List of objects in the bucket.
   */
  async getObjects() {
    const { Contents } = await this.s3
      .listObjectsV2({ Bucket: this.bucket })
      .promise();

    return Contents;
  }

  /**
   * Initialize and create the bucket if it doesn't exist.
   * @function init()
   */
  async init() {
    await this.s3.createBucket({ Bucket: this.bucket }).promise();
  }

  /**
   * Disable bucket Block Public Access.
   * @function disableBlockPublicAccess
   */
  async disableBlockPublicAccess() {
    await this.s3.deletePublicAccessBlock({ Bucket: this.bucket }).promise();
  }

  /**
   * Update the bucket policy.
   * @function updatePolicy
   * @param {string} policy - AWS Policy Document.
   */
  async updatePolicy(policy = "") {
    await this.s3
      .putBucketPolicy({ Bucket: this.bucket, Policy: policy })
      .promise();
  }

  /**
   * Enable and configure website hosting for the bucket.
   * @function configureWebsite
   * @param {string} index - Index Document.
   * @param {string} error - Error Document.
   */
  async configureWebsite(index = "index.html", error = "error.html") {
    await this.s3
      .putBucketWebsite({
        Bucket: this.bucket,
        WebsiteConfiguration: {
          IndexDocument: { Suffix: index },
          ErrorDocument: { Key: error },
        },
      })
      .promise();
  }

  /**
   * Upload a file to the bucket.
   * @function uploadFile
   * @param {string} filePath - Actual file path.
   * @param {string} key - File key when uploading to the bucket.
   */
  async uploadFile(filePath, key) {
    const fileContent = fs.readFileSync(filePath);
    const contentType = mime.getType(key) || "text/plain";

    await this.s3
      .upload({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
        Body: fileContent,
      })
      .promise();
  }

  /**
   * Sync an entire directory to the bucket.
   * @function sync
   * @param {string} pathName - Actual path of the directory.
   */
  async sync(pathName) {
    pathName = !path.isAbsolute(pathName) ? path.resolve(pathName) : pathName;

    let files = readDir(pathName).map(filePath => ({
      path: filePath,
      key: path.relative(pathName, filePath),
    }));

    files.forEach(async file => await this.uploadFile(file.path, file.key));
    // ################################################
    function readDir(dir) {
      return fs
        .readdirSync(dir)
        .reduce(
          (files, file) =>
            fs.statSync(path.join(dir, file)).isDirectory()
              ? files.concat(readDir(path.join(dir, file)))
              : files.concat(path.join(dir, file)),
          [],
        );
    }
  }
}

module.exports = BucketManager;
