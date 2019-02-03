const Discord = require('discord.js');
const fs = require('fs');

const Enmap = require('enmap');

//CreateBot
const bot = new Discord.Client();
const TicketSystem = new Enmap();

bot.login(process.env.BOT_TOKEN);

// Important
let ServerID = '541286273223098368'; // Server ID ( Right click your server Icon > Copy ID > Place here.) IMPORTANT.
let ServerName = 'PUBG X Mates ★'; // Server name 
let Activity = 'Hey you!'; // What the bot is playing
let PREFIX = '$'; // Change me if you wish too

let AdminRoleName = 'Moderators'; // Change me to the Admin role of your server ( EXACT SAME NAME )
let EveryoneRoleName = '@everyone'; // Dont Change

let SupportIcon = 'https://marketplace.magento.com/media/catalog/product/cache/c687aa7517cf01e65c009f6943c2b1e9/i/c/icon-medium-transparent.png'; // Icon Next to support tickets
let SupportChannelCatagoryID = '541742094629339157'; // Support Ticket Catagory ( Create a new catagory > Right Click > CopyID > Paste here) IMPORTANT.
let EmbedColor = 0x24ceff; // Embed Color 

// When bot has logged into discord do this.
bot.on("ready", async() =>{
    console.log(`\n${bot.user.username} is now online!\nConnected to : ${bot.guilds.size} discord(s) servers.`)
    bot.guilds.forEach(guild =>{

        console.log(`Server Name : ${guild.name} | Server ID : ${guild.id} | Member Count : ${guild.memberCount} | Created : ${guild.createdAt}`);
    })

    bot.user.setActivity(Activity);
    
});

// Manage Messages.
bot.on("message", async message => {
    let prefix = PREFIX;
    if(message.author.bot) return;

    Support(message, prefix)

    if (!message.content.startsWith(prefix)) return

});

async function Support(message, prefix){

    // check if the message sent is inside dms 
    if (message.channel.type == 'dm')
    {
        ToConsole(`Support Ticket: ${message.author.username} has sent a support ticket.`)

        let active = await TicketSystem.get(`support_${message.author.id}`)

        let guild = bot.guilds.get(ServerID);
        let channel, found = true;
        let author = message.author;

        // Check if they have already created a support ticket,
        try{
            if(active) bot.channels.get(active.channelID).guild;
        } catch(e){
            found = false;
        }

        // if no support ticket was found then we need to create one.
        if(!active || !found) {
            ToConsole(`Support Ticket: No Channel has been found, creating a new support channel.`);
            active = {};

            let admin = guild.roles.find('name', AdminRoleName);
            let everyone = guild.roles.find('name', EveryoneRoleName);

            // Create a new channel
            channel = await guild.createChannel(`${message.author.username} - ID ${author.discriminator}`);
            // Channel permissions and other stuff.
            await channel.setParent(SupportChannelCatagoryID); // Sets the channel inside the correct catagory.
            await channel.setTopic(`${prefix}complete to complete this ticket | ${message.author.username} | Support ID: ${message.author.id}`); // Changes the channel we have just created topic.
            
            // Overwrites the current permissions ( to avoid everyone from being able to see the channels apart from admins of course. )
            await channel.overwritePermissions(admin, {'READ_MESSAGES': true, 'SEND_MESSAGES': true,'MANAGE_MESSAGES': false,})
            await channel.overwritePermissions(everyone, {'READ_MESSAGES': false, 'SEND_MESSAGES': false,'MANAGE_MESSAGES': false,})


            // Send embed to the new created support ticket channel.
            const SupportEmbed = CreateEmbed(`${everyone},\n${author.username} has created a support ticket.`, `${ServerName} Support Ticket`, `Reply to respond to the support ticket.`);
            const ReplyToTicketCreator = CreateEmbed(`Thank you for your Support Ticket. A **${ServerName}** staff member will be with you shortly.`, `${ServerName} Support Ticket`, `Staff member will be intouch shortly.`);

            // Send embeds
            await channel.send(SupportEmbed);
            await author.send(ReplyToTicketCreator);

            active.channelID = channel.id;
            active.targetID = author.id;

            // Console log what has just happened.
            ToConsole(`Support Ticket: Created, Active Channel ID : ${active.channelID}, Active author ID : ${active.targetID}`);
        }

        channel = bot.channels.get(active.channelID);

        // Send what the member sent to the bot to the Support ticket channel.
        const supportMessage = CreateEmbed(message.content, `${message.author.username}`, `Message Recived -- ${message.author.tag}`);
        await channel.send(supportMessage);
        ToConsole(`${message.author.username} said : ${message.content}`);

        //Update User Data
        TicketSystem.set(`support_${message.author.id}`, active);
        TicketSystem.set(`supportChannel_${channel.id}`, message.author.id);
        
        return;
    }

    // Staff sending messages back.
    let support = await TicketSystem.get(`supportChannel_${message.channel.id}`);

    if(support){
        support = await TicketSystem.get(`support_${support}`);

        // Make sure the user we are talking to is still inside the discord ( Hasnt left the server etc)
        let SupportUser = bot.users.get(support.targetID);
        if(!SupportUser) return message.channel.delete(); // User no longer exists inside the discord server so we will delete the support channel.

        // If a staff member types PREFIXcomplete it will complete the support ticket and close it.
        if(message.content.toLowerCase() === `${prefix}complete`){
            const completeTicket = CreateEmbed(`Hey ${SupportUser.username},\nSupport Ticket has been marked as **complete** by ${ServerName} staff Member: **${message.author.username}**.\n\nIf you wish to reopen or create a new ticket reply back to me!\nHave a wonderful day ${SupportUser.username}`, `Ticket Complete`, `Ticket Closed -- ${ServerName}`);
            SupportUser.send(completeTicket);
            message.channel.delete();
            ToConsole(`${message.author.username} completed ${SupportUser.username} support ticket.`);
            return TicketSystem.delete(`support_${support.targetID}`);
        }

        const SendSupportTicketMessage = CreateEmbed(message.content, `${ServerName} Support Reply`, `Message Recived -- ${ServerName} Staff Team`);
        bot.users.get(support.targetID).send(SendSupportTicketMessage);
        ToConsole(`Staff Member (${message.author.username}) said : ${message.content}`);
        message.delete({timeout: 1000})

        SendSupportTicketMessage.setFooter(`Support Ticket Reply -- Staff Member: ${message.author.username}`);
        return message.channel.send(SendSupportTicketMessage);

    }

}

function CreateEmbed(d, a, f)
{
    const Embed = new Discord.RichEmbed()
    .setColor(EmbedColor)
    .setDescription(d)
    .setAuthor(a, SupportIcon)
    .setFooter(f)
    .setTimestamp();

    return Embed;
}

function ToConsole(m)
{
    console.log(`\n${ServerName} Console Log\n${m}\n`);
}
