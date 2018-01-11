require('dotenv').config();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var tgHelpers = require('./helpers/TelegramHelpers');
var pwintyHelpers = require('./helpers/PwintyHelpers');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded

var port = process.env.PORT || 3000;

// Use a GUID for the URL to eliminate fake messages
app.post('/d7bac4ef-9b4d-47c8-ad47-c33f0e4a5561', function(req, res) {
    var update = req.body;

    if (!update.message) {
        return res.end();
    }

    var commands = tgHelpers.getBotCommands(update.message);

    // START CATCH COMMANDS
    if (commands.indexOf("/start") > -1) {
        var message = "";

        var pwintyOrder = pwintyHelpers.createOrder()
            .then(response => {
                console.log(response.data);
                message = "Hey there! I'll take your favorite stickers and deliver them right to your doorstep.\n\nStart by sending me your stickers and type /done when you've finished.\n\nDidn't like the stickers you sent? Type /start to start over.\n\nIf you're having trouble using me, maybe I can /help";

                res.end("they order");
            })
            .catch(err => {
                console.log("Error: ", err);
                message = "I'm having problems getting started, try again in a little bit";
                res.end();
            });

        console.log(message);
/*
        // Start a pwinty order
        var pwintyOrder = pwintyHelpers.createOrder()
            .then(response => {
                console.log(response.data);
                message = "Hey there! I'll take your favorite stickers and deliver them right to your doorstep.\n\nStart by sending me your stickers and type /done when you've finished.\n\nDidn't like the stickers you sent? Type /start to start over.\n\nIf you're having trouble using me, maybe I can /help";
            })
            .catch(err => {
                console.log("Error: ", err);
                message = "I'm having problems getting started, try again in a little bit";
            })
            .finally(() => {
                tgHelpers.sendMessage(update.message.chat.id, message)
                    .then(response => {
                        res.end("they started");
                    })
                    .catch(err => {
                        res.end("Something went wrong");
                    });
            });*/
    }
    else if (commands.indexOf("/done") > -1) {
        tgHelpers.sendMessage(update.message.chat.id, "Done already? Here is a link to order the stickers your sent me: some link.\n\nYou like what you see? Maybe someone else does too, that link doesn't have to just be for you!\n\nThanks for taking advantage of me, you make my owner very happy.\n\nThoughts? Ideas? Kind words? Email me at physicaltelegramstickers@gmail.com").then(response => {
            res.end("they done");
        }).catch(err => {
            res.end("Something went wrong");
        });

    }
    else if (commands.indexOf("/help") > -1) {
        tgHelpers.sendMessage(update.message.chat.id, "At any time you can type /start to begin or start over.\n\nWhen you are finished sending me stickers, type /done and I'll send you a link to order them.\n\nType /help and I'll send you this exact message again.\n\nThoughts? Ideas? Kind words? Email me at physicaltelegramstickers@gmail.com.").then(response => {
            res.end("they helped");
        }).catch(err => {
            res.end("Something went wrong");
        });
    }
    // Parse a sent sticker
    else if (update.message.sticker != undefined) {
        console.log("sticker: ", update.message.sticker);
        tgHelpers.getFile(update.message.sticker.file_id).then(response => {
            stickerUrl = tgHelpers.fileUrlPrefix + response.data.result.file_path;

            pwintyHelpers.sendPwintyRequest("Orders/681697/Photos/", {
                "type": "webp",
                "url": stickerUrl,
                "copies": 1,
                "sizing": "ShrinkToFit"
            })
                .then(response => {
                    console.log(response.data);
                    res.end("sticker uploaded to pwinty");
                })
                .catch(err => {
                    console.log(err);
                    res.end("Something went wrong");
                });
        }).catch(err => {
            console.log("Couldn't get sticker");
            res.end("Something went wrong");
        });
    }
    // END CATCH COMMANDS
    else {
        tgHelpers.sendMessage(update.message.chat.id, "🅱️ig 🅱️oi").then(response => {
            res.end("general");
        }).catch(err => {
            res.end("Something went wrong");
        });
    }

    console.log(update.message);
});



app.get('/', function(req, res) {
    res.send("To be fair, you have to have a very high IQ to understand Rick and Morty. The humour is extremely subtle, and without a solid grasp of theoretical physics most of the jokes will go over a typical viewers head. There's also Rick's nihilistic outlook, which is deftly woven into his characterisation- his personal philosophy draws heavily from Narodnaya Volya literature, for instance. The fans understand this stuff; they have the intellectual capacity to truly appreciate the depths of these jokes, to realise that they're not just funny- they say something deep about LIFE. As a consequence people who dislike Rick & Morty truly ARE idiots- of course they wouldn't appreciate, for instance, the humour in Rick's existential catchphrase \"Wubba Lubba Dub Dub,\" which itself is a cryptic reference to Turgenevs Russian epic Fathers and Sons. I'm smirking right now just imagining one of those addlepated simpletons scratching their heads in confusion as Dan Harmon's genius wit unfolds itself on their television screens. What fools.. how I pity them. 😂<br><br>And yes, by the way, i DO have a Rick & Morty tattoo. And no, you cannot see it. It's for the ladies' eyes only- and even then they have to demonstrate that they're within 5 IQ points of my own (preferably lower) beforehand. Nothin personnel kid 😎");
});


app.listen(port, function() {
    console.log('🅱️erver listening on port 3000');
});