/**
 * Class representing a distribution in CloudFront.
 *
 * @class DistributionManager
 * @description used to manage all API calls to CloudFront distribution.
 * @author Hossam ELMansy <hossamelmansy.developer@gmail.com>
 */

const CloudFront = require("aws-sdk/clients/cloudfront");
const uuidv4 = require("uuid/v4");

class DistributionManager {
  /**
   * @constructor
   */
  constructor() {
    this.cloudFront = new CloudFront({ apiVersion: "latest" });
  }

  /**
   * Find distribution by domain name.
   * @function findDistribution
   * @param {string} domain - The domain name.
   * @returns {object} - The object containing distribution.
   */
  async findDistribution(domain = "") {
    const {
      DistributionList,
    } = await this.cloudFront.listDistributions().promise();

    for (let distribution of DistributionList.Items) {
      if (distribution.Aliases.Items.includes(domain)) return distribution;
    }

    return null;
  }

  /**
   * Create new distribution.
   * @function createDistribution
   * @param {string} domain - The domain name.
   * @param {string} certificateArn - The Certificate ARN.
   * @returns {object} - The object containing distribution.
   */
  async createDistribution(domain = "", certificateArn = "") {
    const originId = `S3-${domain}`;

    const { Distribution } = await this.cloudFront
      .createDistribution({
        DistributionConfig: {
          CallerReference: uuidv4(),
          Comment: "Created by webotron",
          DefaultCacheBehavior: {
            ForwardedValues: {
              Cookies: { Forward: "all" },
              QueryString: false,
              Headers: { Quantity: 0 },
              QueryStringCacheKeys: { Quantity: 0 },
            },
            MinTTL: 3600,
            TargetOriginId: originId,
            TrustedSigners: { Enabled: false, Quantity: 0 },
            ViewerProtocolPolicy: "redirect-to-https",
            DefaultTTL: 86400,
          },
          Enabled: true,
          Origins: {
            Items: [
              {
                DomainName: `${domain}.s3.amazonaws.com`,
                Id: originId,
                S3OriginConfig: { OriginAccessIdentity: "" },
              },
            ],
            Quantity: 1,
          },
          Aliases: {
            Items: [domain],
            Quantity: 1,
          },
          DefaultRootObject: "index.html",
          ViewerCertificate: {
            ACMCertificateArn: certificateArn,
            SSLSupportMethod: "sni-only",
            MinimumProtocolVersion: "TLSv1.1_2016",
          },
        },
      })
      .promise();

    return Distribution;
  }

  /**
   * Wait for the distribution to be deployed.
   * @function waitForDeploy
   * @param {string} distributionId - Distribution ID.
   * @returns {object} - The object containing distribution.
   */
  async waitForDeploy(distributionId = "") {
    const {
      Distribution,
    } = await this.cloudFront
      .waitFor("distributionDeployed", { Id: distributionId })
      .promise();

    return Distribution;
  }
}

module.exports = DistributionManager;
