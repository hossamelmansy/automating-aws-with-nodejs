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
const crypto = require("crypto");

const { getRegionEndpoint } = require("./utils");

class BucketManager {
  /**
   * @constructor
   * @param {string} bucket - The name of the bucket.
   */
  constructor(bucket = "") {
    this.s3 = new S3({ apiVersion: "latest" });
    this.manifest = {}; // object containing Key and ETag of objects in the bucket
    this.partSize = 5242880; // default partSize: 5MB
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
      .upload(
        {
          Bucket: this.bucket,
          Key: key,
          ContentType: contentType,
          Body: fileContent,
        },
        { partSize: this.partSize },
      )
      .promise();
  }

  /**
   * Sync an entire directory to the bucket.
   * @function sync
   * @param {string} pathName - Actual path of the directory.
   */
  async sync(pathName) {
    pathName = !path.isAbsolute(pathName) ? path.resolve(pathName) : pathName;

    // Loads S3 bucket  objects' manifest (array of Key and ETag)
    await this.loadManifest();

    // read folder recuersively, get file path and key
    let files = readDir(pathName).map(filePath => ({
      path: filePath,
      key: path.relative(pathName, filePath),
    }));

    // syncing and uploading changed files only
    files.forEach(async file => {
      const fileETag = this.generateFileETag(file.path); // calculate file ETag

      // if ETags matches, don't upload
      if (this.manifest[file.key] == fileETag) {
        console.log(`Skipping ${file.key}, ETags matched.`);
      } else {
        console.log(`Uploading ${file.key}, ETags not matched.`);
        await this.uploadFile(file.path, file.key);
      }
    });

    // TODO: remove files from bucket if it removed locally
    const filesInBucket = Object.keys(this.manifest); // files already in the bucket
    // files to be synced
    const filesToBeSynced = Object.keys(
      files.reduce((obj, file) => ({ ...obj, [file.key]: file.path }), {}),
    );
    // files needs to be removed from the bucket
    const removedFiles = filesInBucket
      .filter(file => !filesToBeSynced.includes(file))
      .concat(filesToBeSynced.filter(file => !filesInBucket.includes(file)));

    // delete objects
    if (removedFiles.length) await this.deleteObjects(removedFiles);

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

  /**
   * Get the bucket's region.
   * @function getRegion
   * @returns {string} - The bucket's region.
   */
  async getRegion() {
    const { LocationConstraint } = await this.s3
      .getBucketLocation({ Bucket: this.bucket })
      .promise();
    // returns "" if bucket created in "us-east-1"

    return LocationConstraint || "us-east-1"; // return "us-east-1" when ""
  }

  /**
   * Get the bucket's website's endpoint.
   * @function getWebsiteURL
   * @returns {string} - The URL of the website.
   */
  async getWebsiteURL() {
    const region = await this.getRegion(); // get bucket region
    const { endpoint } = getRegionEndpoint(region); // get S3 website region endpoint

    return `http://${this.bucket}.${endpoint}`;
  }

  /**
   * Loads an array of bucket's objects Key and ETag in this.manifest.
   * @function loadManifest
   */
  async loadManifest() {
    const objects = await this.getObjects();

    objects.forEach(({ Key, ETag }) => (this.manifest[Key] = ETag));
  }

  /**
   * Generates ETag of a given file.
   * @function generateFileETag
   * @param {string} pathName - The path of the file.
   * @returns {string} - ETag (MD5 hash)
   */
  generateFileETag(pathName) {
    const file = fs.openSync(pathName, "r"); // open the file
    let hashes = [];

    while (true) {
      let buffer = Buffer.alloc(this.partSize, null, "hex");
      let bytesRead = fs.readSync(file, buffer, 0, this.partSize, null);
      let hash = this.getMD5Hash(buffer.slice(0, bytesRead));

      hashes.push(hash);

      if (this.partSize > bytesRead) break; // break the loop when at the end of the file
    }

    fs.closeSync(file); // close the file

    // return empty if no file
    if (hashes.length == 0) return;
    // if one part, return the hash
    else if (hashes.length == 1) return `"${hashes[0]}"`;
    // if multiple parts, combine the hash of each part, then hash them, then add number of parts
    else {
      const combinedHashes = Buffer.from(hashes.join(""), "hex");
      const hash = this.getMD5Hash(combinedHashes);

      return `"${hash}-${hashes.length}"`;
    }
  }

  /**
   * Get the MD5 hash of the supplied data.
   * @function getMD5Hash
   * @param {string} data - The data to be hashed.
   * @returns {string} - MD5 hash
   */
  getMD5Hash(data) {
    return crypto
      .createHash("md5")
      .update(data)
      .digest("hex");
  }

  /**
   * Delete objects from the bucket.
   * @function deleteObjects
   * @param {Array<string>}
   */
  async deleteObjects(keys = []) {
    // convert array of keys to objects of Key
    const objects = keys.map(key => ({ Key: key }));

    await this.s3
      .deleteObjects({
        Bucket: this.bucket,
        Delete: { Objects: objects },
      })
      .promise();
  }
}

module.exports = BucketManager;
