var axios = require('axios');

module.exports = {
    botUrlPrefix: "https://api.telegram.org/bot" + process.env.TELEGRAM_BOT_TOKEN + "/",
    fileUrlPrefix: "https://api.telegram.org/file/bot" + process.env.TELEGRAM_BOT_TOKEN + "/",

    getBotCommands: function(message) {
        var commands = [];

        if (message.entities != undefined && message.entities.length > 0) {
            for (var i = 0; i < message.entities.length; i++) {
                if (message.entities[i].type == "bot_command") {
                    var commandStart = message.entities[i].offset;
                    var commandEnd = commandStart + message.entities[i].length;
                    var command = message.text.substring(commandStart, commandEnd);
                    commands.push(command);
                }
            }
        }

        return commands;
    },

    getFile: function(fileId) {
        return module.exports.sendTelegramRequest('getFile', {
            file_id: fileId
        });
    },

    sendMessage: function(chatId, message) {
        return module.exports.sendTelegramRequest('sendMessage', {
            chat_id: chatId,
            text: message
        });
    },

    sendTelegramRequest: function(endpoint, requestObj) {
        var url = module.exports.botUrlPrefix + endpoint;

        return new Promise((resolve, reject) => {
            axios.post(url, requestObj).then(response => {
                console.log('Telegram Request sent');
                resolve(response);
            }).catch(err => {
                console.log('Error :', err);
                reject(err);
            });
        });
    }
};