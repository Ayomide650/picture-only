// Configuration file for the Discord Image-Only Bot
require('dotenv').config();

const config = {
  // Discord Bot Configuration
  discord: {
    token: process.env.DISCORD_TOKEN,
    imageOnlyChannels: process.env.IMAGE_ONLY_CHANNELS ? 
      process.env.IMAGE_ONLY_CHANNELS.split(',') : [],
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
  },
  
  // Bot Behavior Configuration
  bot: {
    warningMessageTimeout: 5000, // Time in ms before warning messages are deleted
    warningMessage: "{user}, only images are allowed in this channel!",
  }
};

module.exports = config;
