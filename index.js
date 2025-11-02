const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ] 
});

const keepAlive = require('./keep_alive');
keepAlive();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;

let ticketCount = 1;

client.once('clientReady', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (message.content === '/create_ticket_panel') {
    const embed = new EmbedBuilder()
      .setTitle('SUPPORT TICKET SYSTEM')
      .setDescription(
        "Need Help? Click the button below to create a support ticket\n" +
        "Our staff team will assist you as soon as possible\n" +
        "Please describe your issue clearly in the ticket\n" +
        "Available 24/7 for your convenience!"
      )
      .setColor('#000000')
      .setThumbnail('https://cdn.discordapp.com/emojis/1431059075826712656.gif')
      .setImage('https://i.imgur.com/9dqjvqm.gif');

    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Create Ticket')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'create_ticket') {
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

    const welcomeEmbed = new EmbedBuilder()
      .setTitle('🎫 Ticket Created')
      .setDescription(`<@${interaction.user.id}> created this ticket!\n\nPlease describe your issue and our staff will assist you shortly.`)
      .setColor('#FF0000')
      .setTimestamp();

    await ticketChannel.send({ embeds: [welcomeEmbed], components: [row] });
    await interaction.reply({ content: `✅ Your ticket has been created: ${ticketChannel}`, ephemeral: true });

    const filter = m => !m.author.bot;
    const collector = ticketChannel.createMessageCollector({ filter, time: 10 * 60 * 1000 });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await ticketChannel.delete().catch(() => {});
      }
    });
  }

  if (interaction.customId === 'close_ticket') {
    await interaction.reply({ content: '🔒 Closing ticket...', ephemeral: true });
    setTimeout(async () => {
      await interaction.channel.delete().catch(() => {});
    }, 2000);
  }
});

client.login(TOKEN);
