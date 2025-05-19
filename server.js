// Server.js - Main entry point for the Discord bot application
const express = require('express');
const { Client, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');
const config = require('./config');

// Initialize Express app
const app = express();
const PORT = config.server.port;

// Create a new Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel]
});

// Ready event - Log when the bot is online
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot is monitoring for image-only channels`);
});

// Message event - Check if message contains images
client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  // Check if the channel is configured for image-only mode
  const channelId = message.channelId;
  const imageOnlyChannels = config.discord.imageOnlyChannels;
  
  if (imageOnlyChannels.includes(channelId)) {
    // Check if the user is an admin or has manage messages permission
    const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);
    
    // If user is admin, allow any message
    if (isAdmin) return;
    
    // Check if message has an image or video attachment
    const hasMediaContent = message.attachments.some(attachment => {
      const fileType = attachment.contentType;
      return fileType && (fileType.startsWith('image/') || fileType.startsWith('video/'));
    });
    
    // If no image or video is found, delete the message and notify the user
    if (!hasMediaContent) {
      try {
        await message.delete();
        const warningMsg = await message.channel.send(
          config.bot.warningMessage.replace('{user}', message.author)
        );
        
        // Delete the warning message after configured timeout
        setTimeout(() => {
          warningMsg.delete().catch(err => 
            console.error(`Failed to delete warning message: ${err}`)
          );
        }, config.bot.warningMessageTimeout);
      } catch (error) {
        console.error(`Failed to manage message: ${error}`);
      }
    }
  }
});

// Express route for health check
app.get('/', (req, res) => {
  res.send('Image-Only Discord Bot is running!');
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Login to Discord
client.login(config.discord.token);
