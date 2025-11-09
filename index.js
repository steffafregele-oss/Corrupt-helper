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
      // titlu: doar 1 emoji animat la inceput (emoji_23)
      .setTitle(`<a:emoji_23:1437165438315532431> SUPPORT TICKET SYSTEM`)
      // thumbnail: coroana animata (corrupt_crown)
      .setThumbnail('https://cdn.discordapp.com/emojis/1437152941088702607.gif?size=80&quality=lossless')
      .setDescription(
        // fiecare linie incepe cu emoji_21 (animat)
        `<a:emoji_21:1437163698161717468> Need help? Click the button below to create a support ticket.\n` +
        `<a:emoji_21:1437163698161717468> Our staff team will assist you as soon as possible.\n` +
        `<a:emoji_21:1437163698161717468> Please describe your issue clearly in the ticket.\n` +
        `<a:emoji_21:1437163698161717468> Available 24/7 for your convenience!`
      )
      .setColor('#000000')
      .setImage('https://i.imgur.com/rCQ33gA.gif'); // bannerul de la stats (jos)

    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Create Ticket')
      .setStyle(ButtonStyle.Secondary) // baby blue
      // emoji-ul de la buton: emoji_16 (animat)
      .setEmoji({ id: '1437155312527347915' });

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

      // Embed în canalul ticket (same style)
      const ticketEmbed = new EmbedBuilder()
        .setTitle(`<a:emoji_23:1437165438315532431> TICKET CREATED`)
        .setThumbnail('https://cdn.discordapp.com/emojis/1437152941088702607.gif?size=80&quality=lossless') // coroana
        .setDescription(
          `<a:emoji_21:1437163698161717468> <@${interaction.user.id}> created this ticket!\n` +
          `<a:emoji_21:1437163698161717468> Please describe your issue here in detail.\n` +
          `<a:emoji_21:1437163698161717468> A staff member will respond shortly.`
        )
        .setColor('#000000')
        .setImage('https://i.imgur.com/rCQ33gA.gif')
        .setTimestamp();

      const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger)
        // folosim tot emoji personalizat la buton (emoji_16) pentru consistenta
        .setEmoji({ id: '1437155312527347915' });

      const row = new ActionRowBuilder().addComponents(closeButton);

      await ticketChannel.send({ embeds: [ticketEmbed], components: [row] });

      // Răspuns ephemer user
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
