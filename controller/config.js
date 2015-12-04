"use strict";

var convict = require('convict');

// define a schema

var conf = convict({
    env: {
        doc: "The applicaton environment.",
        format: ["production", "development", "test"],
        default: "development",
        env: "NODE_ENV"
    },
    slackHookUrl: {
        doc: "Slack WebHook Url ",
        format: String,
        default: "",
        env: "SLACK_WEB_HOOK_URL"
    }
});

conf.validate();

module.exports = conf;