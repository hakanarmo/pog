const Discord = require('discord.js');
const botconfig = require("./botconfig.json");
const client = new Discord.Client(); 

const prefix = '-' 
const ownerID = '201460488037466112'; 
const db = require('quick.db');

const serverStats = {
  guildID: '541286273223098368',
  ticketCategoryID: '541742094629339157'
}

// Tickets
client.on('message', async message => {
if (message.author.bot) return;
if (message.channel.type !== 'text') {
    let active = await db.fetch(`support_${message.author.id}`);
    let guild = client.guilds.get(serverStats.guildID);
    let channel, found = true;
    try {
        if (active) client.channels.get(active.channelID)
            .guild;
    } catch (e) {
        found = false;
    }
    if (!active || !found) {
        active = {};
        channel = await guild.createChannel(`${message.author.username}-${message.author.discriminator}`)
            channel.setParent(serverStats.ticketCategoryID)
            channel.setTopic(`-close to close the ticket | Support for ${message.author.tag} | ID: ${message.author.id}`)

              channel.overwritePermissions("491776930190852106", { 
                  VIEW_CHANNEL: false,
                  SEND_MESSAGES: false,
                  ADD_REACTIONS: false
                });
              
        let author = message.author;
        const newChannel = new Discord.RichEmbed()
            .setColor(botconfig.red)
            .setAuthor(author.tag, author.avatarURL)
            .setFooter('Support Ticket Created!')
            .addField('User', author)
            .addField('ID', author.id)
        await channel.send(newChannel);
        const newTicket = new Discord.RichEmbed()
            .setColor(botconfig.blue)
            .setAuthor(`Hello, ${author.username}`, author.avatarURL)
            .setFooter('Support Ticket Created!')
        await author.send(newTicket);
        active.channelID = channel.id;
        active.targetID = author.id;
    }
    channel = client.channels.get(active.channelID);
    const dm = new Discord.RichEmbed()
        .setColor(botconfig.blue)
        .setAuthor(`Thank you, ${message.author.username}`, message.author.avatarURL)
        .setFooter(`Your message has been sent - A staff member will be in contact soon.`)
    await message.author.send(dm);
    if (message.content.startsWith(prefix + 'close')) return;
    const embed5 = new Discord.RichEmbed()
        .setColor(botconfig.red)
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setDescription(message.content)
        .setFooter(`Message Received - ${message.author.tag}`)
    await channel.send(embed5);
    db.set(`support_${message.author.id}`, active);
    db.set(`supportChannel_${channel.id}`, message.author.id);
    return;
}
let support = await db.fetch(`supportChannel_${message.channel.id}`);
if (support) {
    support = await db.fetch(`support_${support}`);
    let supportUser = client.users.get(support.targetID);
    if (!supportUser) return message.channel.delete();
    if (message.content.toLowerCase() === '-close') {
        const complete = new Discord.RichEmbed()
            .setColor(botconfig.blue)
            .setAuthor(`Hey, ${supportUser.tag}`, supportUser.avatarURL)
            .setFooter('Ticket Closed -- Coding Budgies')
            .setDescription('*Your ticket has been marked as complete. If you wish to reopen it, or create a new one, please send a message to the bot.*')
        supportUser.send(complete);
        message.channel.delete();
        db.delete(`support_${support.targetID}`);
        let inEmbed = new Discord.RichEmbed()
            .setTitle('Ticket Closed!')
            .addField('Support User', `${supportUser.tag}`)
            .addField('Closer', message.author.tag)
            .setColor(botconfig.red)
        const staffChannel = client.channels.get('541291124669677602'); //Create a log channel and put id here
        staffChannel.send(inEmbed);
    }
    const embed4 = new Discord.RichEmbed()
        .setColor(botconfig.red)
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setFooter(`Message Received - Coding Budgies`)
        .setDescription(message.content)
    client.users.get(support.targetID)
        .send(embed4);
    message.delete({
        timeout: 10000
    });
    embed4.setFooter(`Message Sent -- ${supportUser.tag}`)
        .setDescription(message.content);
    return message.channel.send(embed4);
}
});

// Command Handler
client.on('message', message => {

    let args = message.content.slice(prefix.length).trim().split(' ');
    let cmd = args.shift().toLowerCase();

    if (message.author.bot) return; 
    if (!message.content.startsWith(prefix)) return; 

    try {

        delete require.cache[require.resolve(`./commands/${cmd}.js`)];

        let commandFile = require(`./commands/${cmd}.js`); 
        commandFile.run(client, message, args);
 
    } catch (e) { 
        console.log(e.stack);
    }
});

client.on('ready', async () => {
    client.user.setActivity(`-help| ${client.guilds.size} Servers`, {type: "PLAYING"});
})

client.on('ready', () => console.log('Launched!'));

client.login(process.env.BOT_TOKEN)
