"use strict";

module.exports.hello = async event => {
  console.log(event);
  return {
    message: "Go Serverless v1.0! Your function executed successfully!",
    event,
  };
};
