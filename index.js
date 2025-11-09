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

const keepAlive = require('./keep_alive'); 
keepAlive(); // pornește serverul keep-alive

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

// 2️⃣ Token și rol admin
const TOKEN = process.env.DISCORD_BOT_TOKEN; 
const ADMIN_ROLE_ID = '1433970414706622504';

// 3️⃣ Ticket counter
let ticketCount = 1;

// 4️⃣ Ready event
client.once('ready', () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
});

// 5️⃣ Comanda pentru ticket panel
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!ticket panel set') {
    const embed = new EmbedBuilder()
      .setTitle("<a:emoji_22:1437165310775132160>  SUPPORT TICKET SYSTEM  <a:emoji_22:1437165310775132160>")
      .setDescription(
        "<a:corrupt_star1:1437146640661090335> Need help? Click the button below to create a support ticket.\n" +
        "<a:corrupt_star1:1437146640661090335> Our staff team will assist you as soon as possible.\n" +
        "<a:corrupt_star1:1437146640661090335> Please describe your issue clearly in the ticket.\n" +
        "<a:corrupt_star1:1437146640661090335> Available 24/7 for your convenience!"
      )
      .setColor('#000000')
      .setThumbnail('https://cdn.discordapp.com/emojis/1437165310775132160.gif') // emoji_22
      .setImage('https://i.imgur.com/rCQ33gA.gif'); // banner stats

    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Create Ticket')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('1437146640661090335'); // corrupt_star1

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 6️⃣ Interaction listener
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // Creează ticket
  if (interaction.customId === 'create_ticket') {
    await interaction.deferReply({ ephemeral: true });
    try {
      const channelName = `ticket-${String(ticketCount).padStart(3, '0')}`;
      ticketCount++;

      const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ] },
          { id: ADMIN_ROLE_ID, allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ] }
        ]
      });

      // Embed în canalul ticket
      const ticketEmbed = new EmbedBuilder()
        .setTitle("<a:emoji_22:1437165310775132160>  TICKET CREATED  <a:emoji_22:1437165310775132160>")
        .setDescription(
          `<a:corrupt_star1:1437146640661090335> <@${interaction.user.id}> created this ticket!\n` +
          "<a:corrupt_star1:1437146640661090335> Please describe your issue here in detail.\n" +
          "<a:corrupt_star1:1437146640661090335> A staff member will respond shortly."
        )
        .setColor('#000000')
        .setThumbnail('https://cdn.discordapp.com/emojis/1437165310775132160.gif') // emoji_22
        .setImage('https://i.imgur.com/rCQ33gA.gif')
        .setTimestamp();

      const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('1437146640661090335'); // corrupt_star1

      const row = new ActionRowBuilder().addComponents(closeButton);

      await ticketChannel.send({ embeds: [ticketEmbed], components: [row] });

      await interaction.editReply({ 
        content: `✅ Your ticket has been created! Go to ${ticketChannel} to describe your problem.`, 
        ephemeral: true 
      });

    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: '❌ There was an error creating your ticket.', ephemeral: true });
    }
  }

  // Închide ticket
  if (interaction.customId === 'close_ticket') {
    await interaction.reply({ content: 'Closing ticket...', ephemeral: true });
    setTimeout(async () => {
      await interaction.channel.delete().catch(() => {});
    }, 2000);
  }
});

// 7️⃣ Login bot
client.login(TOKEN);
