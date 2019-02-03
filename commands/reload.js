exports.run = (client, message, args) => {

    if (message.author.id !== "296048748877053953")  return message.channel.send('Sorry, only the owner can use this command.');

    try {
        delete require.cache[require.resolve(`./${args[0]}.js`)];

    } catch (e) {

        return message.channel.send(`Unable to reload: ${args[0]}`);

    }

    message.channel.send(`Successfully reloaded: ${args[0]}`);
}
