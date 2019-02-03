const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async (bot, message, args) => {

    let bicon = bot.user.displayAvatarURL;
    let botembed = new Discord.RichEmbed()
        .setAuthor(`Coding Budgies | ${bot.user.username}`, `${bot.user.displayAvatarURL}`)
        .addField("Commands", `**Open Ticket :** To start a ticket, message the bot\n**Close :** To close the ticket\n-close`)
        .setColor(botconfig.blue);

    message.channel.send(botembed);
}
