"use strict";

module.exports.postToSlack = async (event, context) => {
  console.log(process.env.SLACK_WEBHOOK_URL);
  console.log(event);

  // TODO: add axios, then send POST request to Slack channel

  return;
};
