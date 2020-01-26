const AWS = require("aws-sdk/global");
const AutoScaling = require("aws-sdk/clients/autoscaling");

AWS.config.credentials = new AWS.SharedIniFileCredentials({
  profile: "javascriptAutomation",
});
AWS.config.update({ region: "us-east-1" }); // update aws-sdk region

const autoScaling = new AutoScaling({ apiVersion: "latest" });

(async function scaleUp() {
  await autoScaling
    .executePolicy({
      AutoScalingGroupName: "Notifon Scaling Group",
      PolicyName: "Scale Up",
    })
    .promise();
})();
