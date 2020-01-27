"use strict";

const axios = require("axios").default;

module.exports.postToSlack = async (event, context) => {
  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: `From ${event.source} at ${event.detail.StartTime}: ${event.detail.Description}`,
  });
  return;
};
