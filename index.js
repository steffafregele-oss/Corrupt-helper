// 1️⃣ Importuri
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType, 
  PermissionsBitField 
} = require('discord.js');

const express = require('express');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

// 2️⃣ Keep-alive server
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is alive ✅"));
app.listen(PORT, () => console.log(`✅ Keep-alive server running on port ${PORT}`));

// 3️⃣ Token și ID rol admin
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const ADMIN_ROLE_ID = '1433970414706622504'; // rol admin

// 4️⃣ Ticket counter
let ticketCount = 1;

// 5️⃣ Ready event
client.once('ready', () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
});

// 6️⃣ Comanda pentru ticket panel
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!ticket panel set') {
    const embed = new EmbedBuilder()
      .setTitle('🎫 SUPPORT TICKET SYSTEM')
      .setDescription(
        "Click the button below to create a support ticket.\n" +
        "Our staff will assist you as soon as possible."
      )
      .setColor('#000000');

    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Create Ticket')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 7️⃣ Interaction listener
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // Creează ticket
  if (interaction.customId === 'create_ticket') {
    const channelName = `ticket-${String(ticketCount).padStart(3, '0')}`;
    ticketCount++;

    const ticketChannel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: ADMIN_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    const closeButton = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);

    const embed = new EmbedBuilder()
      .setTitle('🎫 Ticket Created')
      .setDescription(`<@${interaction.user.id}> created this ticket! Please describe your issue.`)
      .setColor('#FF0000')
      .setTimestamp();

    await ticketChannel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ Your ticket has been created: ${ticketChannel}`, ephemeral: true });
  }

  // Închide ticket
  if (interaction.customId === 'close_ticket') {
    await interaction.reply({ content: '🔒 Closing ticket...', ephemeral: true });
    setTimeout(async () => {
      await interaction.channel.delete().catch(() => {});
    }, 2000);
  }
});

// 8️⃣ Login
client.login(TOKEN);
