const Discord = require("discord.js");
const fs = require("fs");
const util = require('util');

const Enmap = require('enmap');


//Create Bot
const bot = new Discord.Client();
const TicketSystem = new Enmap();
//Bot Stuff
bot.commands = new Discord.Collection();
var ServerName = "OneNationGaming Schedule Bot ";

//Make bot login on discord.
bot.login(process.env.BOT_TOKEN)

// When Bot has logged in do this
bot.on("ready", async() =>{
    bot.user.setActivity("Message to Schedule Training")

  const LogChannelID = "469602420092305420"

  var currentDate = new Date().toLocaleDateString();
  var currentTime = new Date().toLocaleTimeString();

  var embedLog = new Discord.RichEmbed()
    .setTitle(`${ServerName} Log`)
    .setDescription(`**${bot.user.username}** : **Has Started**\n\n${bot.user.username} is now **online**!\n\nConnteted to : **${bot.guilds.size}** discord(s) servers.`)
    .setFooter(`Date: ${currentDate} Time: ${currentTime}`)
    .setColor(0x800080)

  var readyChannel = bot.channels.get(LogChannelID);
  readyChannel.send(embedLog).then(console.log(`Send Ready!`)).catch(console.error)

  //Console log the bot is online an ready for commands & also show how many servers the bot is connected to
  console.log(`\n${bot.user.username} is now online!\nConnected to : ${bot.guilds.size} discord(s) servers\nReady for commands!`);
});

//Check if message was sent
bot.on("message", async message =>{
  let prefix = "ong!";
  //If the message is from the bot. Dont do shit
  if(message.author.bot) return;


  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  let commandfile = bot.commands.get(cmd.slice(prefix.length));

  if(commandfile) commandfile.run(bot, message, args);

  //TICKET SYSTEM
  //Player Direct Message Ticket
  if (message.channel.type == 'dm'){
    console.log("Ticket Sent")

    //Get Activity info
    let active = await TicketSystem.get(`support_${message.author.id}`);

    //Get the GUILD ID
    let guild = bot.guilds.get('361690793154576394'); // CHANGE ME DEPENDING ON THE SERVER

    //variables
    let channel, found = true;

    // Active check if the support channel still exists
    try {
      if(active) bot.channels.get(active.channelID).guild;
    } catch (e) {
      found = false;
    }

    if(!active || !found ){

      console.log(`No Active Found (LN: 116) Creating active`);

      active = {};

      let theTeam = guild.roles.find('name', 'TheTeam');
      let FieldTrainingOfficer = guild.roles.find('name', 'Field Training Officer');
      let Everyone = guild.roles.find("name", "@everyone");
      //Create Channel Stuff
      channel = await guild.createChannel(`${message.author.username} - ${message.author.discriminator}`);

      await channel.setParent('469687457672200193'); // CHANGE ME DEPENDING ON THE SERVER
      console.log(channel.parentID);
      await channel.setTopic(`ong!complete to close the ticket | Support for ${message.author.tag} | ID: ${message.author.id}`);
      await channel.overwritePermissions(theTeam, {'READ_MESSAGES': true, 'SEND_MESSAGES': false,'MANAGE_MESSAGES': false,})
      await channel.overwritePermissions(FieldTrainingOfficer, {'READ_MESSAGES': true, 'SEND_MESSAGES': true,'MANAGE_MESSAGES': false,})
      await channel.overwritePermissions(Everyone, {'READ_MESSAGES': false, 'SEND_MESSAGES': false,'MANAGE_MESSAGES': false,})


      //Create a user object to make everything easier.
      let author = message.author;
      //Create a Embed for the new channel being created
      const newChannel = new Discord.RichEmbed()
        .setColor(0x800080)
        .setDescription(`ID : ${author.id}`)
        .setAuthor(`${author.tag} Training Request`)
        .setFooter(`Reply here to respond to the request.`)

      //Send Message to the new created channel
      await channel.send(newChannel);

      // Create another embed to send to the client, telling them they have created a ticket.
      const newTicket = new Discord.RichEmbed()
        .setColor(0x800080)
        .setAuthor(`${author.tag}️`)
        .setFooter(`Training Request`)

      //Send Message to the new created channel
      await author.send(newTicket);


      //Update Data.
      active.channelID = channel.id;
      active.targetID = author.id;

      console.log(`Training Request - Active ChannelID : ${active.channelID}\nTraining Request - Active TargetID : ${active.targetID}`);
    }


    channel = bot.channels.get(active.channelID);

    //create the DM embed
    const dm = new Discord.RichEmbed()
      .setColor(0x800080)
      .setAuthor(`Thank you, ${message.author.tag}`)
      .setFooter(`Your request has been submitted -- A Field training Officer will be in contact soon`)

    //Send Message to the new created channel
      await message.author.send(dm);

    //Create ticket embed what staff see
    const embed = new Discord.RichEmbed()
      .setColor(0x800080)
      .setAuthor(`${message.author.tag}`)
      .setDescription(message.content)
      .setFooter(`Message Recieved -- ${message.author.tag}`)

    //Send Embed
      await channel.send(embed);

    //Update Data & return
    TicketSystem.set(`support_${message.author.id}`, active);
    TicketSystem.set(`supportChannel_${channel.id}`, message.author.id);
    return;
  }


  //STAFF SIDE OF TICKET SYSTEM
  //Fetch Support stuffs

  let support = await TicketSystem.get(`supportChannel_${message.channel.id}`);

  //if support is defined (Not null ) that means the channel the message was sent in is a support channel!
  if(support){
    //update the support object to the one we set before.
    support = await TicketSystem.get(`support_${support}`);

    //Check if the user is still in the server (guild hasnt left)
    let supportUser = bot.users.get(support.targetID);
    if(!supportUser) return message.channel.delete(); // If user doesnt exist no more delete the support ticket. Clears room for more.

    //ong!complete command here
    if(message.content.toLowerCase() === 'ong!complete'){
      //create embed
      const complete = new Discord.RichEmbed()
        .setColor(0x800080)
        .setAuthor(`Hey, ${supportUser.tag}`)
        .setFooter(`Training Request Closed -- OneNationGaming`)
        .setDescription(`Your Training Request has been marked as **complete**. If you wish to reopen this, or create a new Training Request reply back to me! `)

      //Send Embed
      supportUser.send(complete)

      // Delete the support channel as its no longer needed
      message.channel.delete();

      //Return & delete the guild object .
      return TicketSystem.delete(`support_${support.targetID}`);
    }

    //create embed
    const embed = new Discord.RichEmbed()
      .setColor(0x800080)
      .setAuthor(`OneNationGaming Training Request`)
      .setDescription(message.content)
      .setFooter(`Training Request -- OneNationGaming Team`)

    //Send Embed
    bot.users.get(support.targetID).send(embed)

    message.delete({timeout: 1000})

    //Modify the embed sent in the ticket channel to show when the message was sent to the user.
    embed.setFooter(`Training Request Reply -- TeamMember: ${message.author.tag}`)

    //Return the same bot message into support chat.
    return message.channel.send(embed)

  }

  if (!message.content.startsWith(prefix)) return



})
