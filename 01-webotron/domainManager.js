/**
 * Class representing a Domain.
 *
 * @class DomainManager
 * @description used to manage and interact with Route53 domain.
 * @author Hossam ELMansy <hossamelmansy.developer@gmail.com>
 */

const Route53 = require("aws-sdk/clients/route53");
const uuidv4 = require("uuid/v4");

class DomainManager {
  /**
   * Initialize DomainManager
   * @constructor
   */
  constructor() {
    this.route53 = new Route53({ apiVersion: "latest" });
  }

  /**
   * Find Route53 hosted zone by domain name.
   * @function findHostedZone
   * @param {string} domain - The name of the domain.
   */
  async findHostedZone(domain = "") {
    // get hosted zones
    const { HostedZones } = await this.route53.listHostedZones().promise();

    for (let hostedZone of HostedZones) {
      if (domain.endsWith(hostedZone.Name.slice(0, -1))) {
        return hostedZone;
      }
    }
  }

  /**
   * Create Route53 hosted zone.
   * @function createHostedZone
   * @param {string} domain - The name of the domain.
   */
  async createHostedZone(domain = "") {
    const hostedZoneName = `${domain
      .split(".")
      .slice(-2)
      .join(".")}.`;

    const { HostedZone } = await this.route53
      .createHostedZone({ Name: hostedZoneName, CallerReference: uuidv4() })
      .promise();

    return HostedZone;
  }

  /**
   * Create record set that redirects domain to an S3 bucket.
   * @function createS3RecordSet
   * @param {object} hostedZone - The hosted zone object.
   * @param {string} domain - The name of the domain.
   * @param {object} s3RegionEndpoint - Object containing the name, endpoint and hosted zone id of the region.2
   * @returns {string} The domain name.
   */
  async createS3RecordSet(hostedZone, domain, s3RegionEndpoint) {
    await this.route53
      .changeResourceRecordSets({
        HostedZoneId: hostedZone.Id,
        ChangeBatch: {
          Changes: [
            {
              Action: "UPSERT",
              ResourceRecordSet: {
                Name: domain,
                Type: "A",
                AliasTarget: {
                  DNSName: s3RegionEndpoint.endpoint,
                  HostedZoneId: s3RegionEndpoint.route53HostedZoneID,
                  EvaluateTargetHealth: false,
                },
              },
            },
          ],
        },
      })
      .promise();

    return domain;
  }

  /**
   * Create record set that redirects domain to an CloudFront distribution.
   * @function createCloudFrontRecordSet
   * @param {object} hostedZone - The hosted zone object.
   * @param {string} domain - The name of the domain.
   * @param {string} distributionDomainName - CloudFront distribution domain name.
   * @returns {string} The domain name.
   */
  async createCloudFrontRecordSet(hostedZone, domain, distributionDomainName) {
    await this.route53
      .changeResourceRecordSets({
        HostedZoneId: hostedZone.Id,
        ChangeBatch: {
          Changes: [
            {
              Action: "UPSERT",
              ResourceRecordSet: {
                Name: domain,
                Type: "A",
                AliasTarget: {
                  DNSName: distributionDomainName,
                  HostedZoneId: "Z2FDTNDATAQYW2",
                  EvaluateTargetHealth: false,
                },
              },
            },
          ],
        },
      })
      .promise();

    return domain;
  }
}

module.exports = DomainManager;
