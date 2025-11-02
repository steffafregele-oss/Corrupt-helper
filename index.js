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
const TOKEN = process.env.DISCORD_BOT_TOKEN; // folosește variabila ta corectă
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
      .setTitle('🎫 SUPPORT TICKET SYSTEM')
      .setDescription(
        "Need Help? Click the button below to create a support ticket\n" +
        "Our staff team will assist you as soon as possible\n" +
        "Please describe your issue clearly in the ticket\n" +
        "Available 24/7 for your convenience!"
      )
      .setColor('#000000')
      .setThumbnail('https://cdn.discordapp.com/emojis/1431059075826712656.gif') // emoji animat colț dreapta sus
      .setImage('https://i.imgur.com/wBQj8Ki.gif'); // banner jos
     
    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Create Ticket')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 6️⃣ Interaction listener
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // Creează ticket
  if (interaction.customId === 'create_ticket') {
    await interaction.deferReply({ ephemeral: true }); // confirmăm că răspundem
    try {
      const channelName = `ticket-${String(ticketCount).padStart(3, '0')}`;
      ticketCount++;

      const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
          { id: ADMIN_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
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
        .setThumbnail('https://cdn.discordapp.com/emojis/1431059075826712656.gif') // emoji animat colț dreapta sus
        .setImage('https://i.imgur.com/wBQj8Ki.gif') // banner jos
        .setTimestamp();

      await ticketChannel.send({ embeds: [embed], components: [row] });

      // Mesaj ephemer pentru user că ticketul a fost creat
      await interaction.editReply({ content: `✅ Your ticket has been created: ${ticketChannel}`, ephemeral: true });

    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: '❌ There was an error creating your ticket.', ephemeral: true });
    }
  }

  // Închide ticket
  if (interaction.customId === 'close_ticket') {
    await interaction.reply({ content: '🔒 Closing ticket...', ephemeral: true });
    setTimeout(async () => {
      await interaction.channel.delete().catch(() => {});
    }, 2000);
  }
});

// 7️⃣ Login bot
client.login(TOKEN);
