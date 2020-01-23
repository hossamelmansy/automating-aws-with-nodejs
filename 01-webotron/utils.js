const S3_WEBSITE_REGION_ENDPOINTS = {
  "us-east-2": {
    name: "US East (Ohio)",
    endpoint: "s3-website.us-east-2.amazonaws.com",
    route53HostedZoneID: "Z2O1EMRO9K5GLX",
  },
  "us-east-1": {
    name: "US East (N. Virginia)	",
    endpoint: "s3-website-us-east-1.amazonaws.com",
    route53HostedZoneID: "Z3AQBSTGFYJSTF",
  },
  "us-west-1": {
    name: "US West (N. California)	",
    endpoint: "s3-website-us-west-1.amazonaws.com",
    route53HostedZoneID: "Z2F56UZL2M1ACD",
  },
  "us-west-2": {
    name: "US West (Oregon)",
    endpoint: "s3-website-us-west-2.amazonaws.com",
    route53HostedZoneID: "Z3BJ6K6RIION7M",
  },
  "ap-east-1": {
    name: "Asia Pacific (Hong Kong)",
    endpoint: "s3-website.ap-east-1.amazonaws.com",
    route53HostedZoneID: "ZNB98KWMFR0R6",
  },
  "ap-south-1": {
    name: "Asia Pacific (Mumbai)	",
    endpoint: "s3-website.ap-south-1.amazonaws.com",
    route53HostedZoneID: "Z11RGJOFQNVJUP",
  },
  "ap-northeast-3": {
    name: "Asia Pacific (Osaka-Local)",
    endpoint: "s3-website.ap-northeast-3.amazonaws.com",
    route53HostedZoneID: "Z2YQB5RD63NC85",
  },
  "ap-northeast-2": {
    name: "Asia Pacific (Seoul)	",
    endpoint: "s3-website.ap-northeast-2.amazonaws.com",
    route53HostedZoneID: "Z3W03O7B5YMIYP",
  },
  "ap-southeast-1": {
    name: "Asia Pacific (Singapore)	",
    endpoint: "s3-website-ap-southeast-1.amazonaws.com",
    route53HostedZoneID: "Z3O0J2DXBE1FTB",
  },
  "ap-southeast-2": {
    name: "Asia Pacific (Sydney)	",
    endpoint: "s3-website-ap-southeast-2.amazonaws.com",
    route53HostedZoneID: "Z1WCIGYICN2BYD",
  },
  "ap-northeast-1": {
    name: "Asia Pacific (Tokyo)",
    endpoint: "s3-website-ap-northeast-1.amazonaws.com",
    route53HostedZoneID: "Z2M4EHUR26P7ZW",
  },
  "ca-central-1": {
    name: "Canada (Central)",
    endpoint: "s3-website.ca-central-1.amazonaws.com",
    route53HostedZoneID: "Z1QDHH18159H29",
  },
  "cn-northwest-1": {
    name: "China (Ningxia)",
    endpoint: "s3-website.cn-northwest-1.amazonaws.com.cn",
    route53HostedZoneID: "Not supported",
  },
  "eu-central-1": {
    name: "Europe (Frankfurt)",
    endpoint: "s3-website.eu-central-1.amazonaws.com",
    route53HostedZoneID: "Z21DNDUVLTQW6Q",
  },
  "eu-west-1": {
    name: "Europe (Ireland)",
    endpoint: "s3-website-eu-west-1.amazonaws.com",
    route53HostedZoneID: "Z1BKCTXD74EZPE",
  },
  "eu-west-2": {
    name: "Europe (London)	",
    endpoint: "s3-website.eu-west-2.amazonaws.com",
    route53HostedZoneID: "Z3GKZC51ZF0DB4",
  },
  "eu-west-3": {
    name: "Europe (Paris)",
    endpoint: "s3-website.eu-west-3.amazonaws.com",
    route53HostedZoneID: "Z3R1K369G5AVDG",
  },
  "eu-north-1": {
    name: "Europe (Stockholm)",
    endpoint: "s3-website.eu-north-1.amazonaws.com",
    route53HostedZoneID: "Z3BAZG2TWCNX0D",
  },
  "sa-east-1": {
    name: "South America (São Paulo)	",
    endpoint: "s3-website-sa-east-1.amazonaws.com",
    route53HostedZoneID: "Z7KQH4QJS55SO",
  },
  "me-south-1": {
    name: "Middle East (Bahrain)",
    endpoint: "s3-website.me-south-1.amazonaws.com",
    route53HostedZoneID: "Z1MPMWCPA7YB62",
  },
};

module.exports = {
  getRegionEndpoint,
};

// ##########################################################
/**
 * @typedef {Object} S3WebsiteEndpoint
 * @property {string} name - The name of the region.
 * @property {string} endpoint - The region's endpoint.
 * @property {string} route53HostedZoneID - The region's Route53 hosted zone ID.
 */

/**
 * Returns the S3 website endpoint for a given region.
 * @function getRegionEndpoint
 * @param {string} region - AWS region code.
 * @returns {S3WebsiteEndpoint}
 */
function getRegionEndpoint(region = "us-east-1") {
  return S3_WEBSITE_REGION_ENDPOINTS[region];
}
