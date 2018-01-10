require('dotenv').config();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var helpers = require('./Helpers');

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

    var commands = helpers.getBotCommands(update.message);

    // Start command, catch this first
    if (commands.indexOf("/start") > -1) {
        helpers.sendMessage(update.message.chat.id, "Started it right").then(response => {
            res.end("started");
        }).catch(err => {
            res.end("Something went wrong");
        });
    }
    else if (commands.indexOf("/help") > -1) {
        helpers.sendMessage(update.message.chat.id, "I'm not very helpful").then(response => {
            res.end("helped");
        }).catch(err => {
            res.end("Something went wrong");
        });
    }
    else {
        helpers.sendMessage(update.message.chat.id, "To start, type /start\n\nFor help using this bot, type /help").then(response => {
            res.end("general");
        }).catch(err => {
            res.end("Something went wrong");
        });
    }


    console.log(commands);

    console.log(update);
    console.log(update.message.entities);
});



app.get('/', function(req, res) {
    res.send("To be fair, you have to have a very high IQ to understand Rick and Morty. The humour is extremely subtle, and without a solid grasp of theoretical physics most of the jokes will go over a typical viewers head. There's also Rick's nihilistic outlook, which is deftly woven into his characterisation- his personal philosophy draws heavily from Narodnaya Volya literature, for instance. The fans understand this stuff; they have the intellectual capacity to truly appreciate the depths of these jokes, to realise that they're not just funny- they say something deep about LIFE. As a consequence people who dislike Rick & Morty truly ARE idiots- of course they wouldn't appreciate, for instance, the humour in Rick's existential catchphrase \"Wubba Lubba Dub Dub,\" which itself is a cryptic reference to Turgenevs Russian epic Fathers and Sons. I'm smirking right now just imagining one of those addlepated simpletons scratching their heads in confusion as Dan Harmon's genius wit unfolds itself on their television screens. What fools.. how I pity them. 😂<br><br>And yes, by the way, i DO have a Rick & Morty tattoo. And no, you cannot see it. It's for the ladies' eyes only- and even then they have to demonstrate that they're within 5 IQ points of my own (preferably lower) beforehand. Nothin personnel kid 😎");
});


app.listen(port, function() {
    console.log('🅱️erver listening on port 3000');
});