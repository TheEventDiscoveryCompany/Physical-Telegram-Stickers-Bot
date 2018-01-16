require('dotenv').config();

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    child_process = require('child_process'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    axios = require('axios'),
    aws = require('aws-sdk'),
    s3Stream = require('s3-upload-stream')(new aws.S3()),
    streamifier = require('streamifier'),
    //zlib = require('zlib'),
    uuidv4 = require('uuid/v4'),
    webp = require('webp-converter');

// Helpers
var tgHelpers = require('./helpers/TelegramHelpers'),
    pwintyHelpers = require('./helpers/PwintyHelpers');

//Mongoose stuff
mongoose.Promise = global.Promise;
var Chat = require('./models/Chat'),
    StickerGroup = require('./models/StickerGroup'),
    Sticker = require('./models/Sticker');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded

var port = process.env.PORT || 3000;

if (process.env.MONGODB_URI === undefined) {
    // Server with no authentication
    var mongodbUri = "mongodb://";
    mongodbUri += process.env.MONGODB_HOST + ":" +
    process.env.MONGODB_PORT + "/" +
    process.env.MONGODB_DATABASE;
}
else {
    // URI set on production/staging
    var mongodbUri = process.env.MONGODB_URI;
}

// Use a GUID for the URL to eliminate fake messages
app.post('/d7bac4ef-9b4d-47c8-ad47-c33f0e4a5561', function(req, res) {
    var update = req.body;

    if (!update.message) {
        return res.end();
    }

    // Get Telegram commands
    var commands = tgHelpers.getBotCommands(update.message);

    // START CATCH COMMANDS
    if (commands.indexOf("/start") > -1) {
        console.log(update);
        mongoose.connect(mongodbUri, {useMongoClient: true})
            .then(() => {
                console.log("connected");

                // Upsert chat with Telegram chat id
                return Chat.findOneAndUpdate({ chatId: update.message.chat.id }, {}, { upsert: true, new: true });
                    /*.populate({
                        "path": "stickerGroups",
                        "match": { isActive: true }
                    })
                    .exec();*/
            })
            .then(chat => {
                console.log("updated chat");
                console.log(chat);

                // Upsert active sticker group with chat reference
                // There should only ever be one or zero active sticker group at a time
                return StickerGroup.findOneAndUpdate({
                    chat: chat._id,
                    isActive: true
                }, {}, { upsert: true, new: true })
                    .populate("chat")
                    .exec();
            })
            .then(stickerGroup => {
                console.log("updated sticker group");
                console.log(stickerGroup);

                // If the chat does not already reference this sticker group, reference it
                if (stickerGroup.chat.stickerGroups.indexOf(stickerGroup._id) === -1) {
                    stickerGroup.chat.stickerGroups.push(stickerGroup._id);
                }
                return stickerGroup.chat.save();
            })
            .then(stickerGroup => {
                console.log("updated chat with sticker group reference");
                console.log(stickerGroup);

                // Check if there are stickers before removing
                if (stickerGroup.stickers !== undefined) {
                    stickerGroup.stickers.pull();
                    return stickerGroup.stickers.save();
                }
                else {
                    return stickerGroup;
                }
            })
            .then(stickerGroup => {
                console.log("Removed stickers references from sticker group");
                console.log(stickerGroup);

                // TODO: Why aren't these stickers being removed???

                // Remove all stickers in the sticker group
                return Sticker.find({ stickerGroup: stickerGroup._id }).remove().exec();
            })
            .then(result => {
                console.log("Removed stickers from sticker group");

                return tgHelpers.sendMessage(update.message.chat.id, "Hey there! I'll take your favorite stickers and deliver them right to your doorstep.\n\nStart by sending me your stickers and type /done when you've finished.\n\nDidn't like the stickers you sent? Type /start to start over.\n\nIf you're having trouble using me, maybe I can /help");
            })
            .then(response => {
                res.end("they started");
            })
            .catch(err => {
                console.log("Error starting: ", err);

                tgHelpers.sendMessage(update.message.chat.id, "I'm having problems getting started, try again in a little bit").then(response => {
                    res.end("they informed of error");
                }).catch(err => {
                    res.end("Something went wrong");
                });
            });
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
        // TODO: Mark active sticker group as inactive

        tgHelpers.sendMessage(update.message.chat.id, "Done already? Here is a link to order the stickers your sent me: some link.\n\nYou like what you see? Maybe someone else does too, that link doesn't have to just be for you!\n\nThanks for taking advantage of me, you make my owner very happy.\n\nThoughts? Ideas? Kind words? Email me at physicaltelegramstickers@gmail.com").then(response => {
            res.end("they done");
        }).catch(err => {
            res.end("Something went wrong");
        });

    }
    else if (commands.indexOf("/help") > -1) {
        tgHelpers.sendMessage(update.message.chat.id, "At any time you can type /start to begin or start over.\n\nWhen you are finished sending me stickers, type /done and I'll send you a link to order them.\n\nType /help and I'll send you this exact message again.\n\nThoughts? Ideas? Kind words? Email me at physicaltelegramstickers@gmail.com.").then(response => {
            res.end("they helped");
        })
        .catch(err => {
            res.end("Something went wrong");
        });
    }
    // END CATCH COMMANDS

    // Parse a sent sticker
    else if (update.message.sticker != undefined) {
        console.log("sticker: ", update.message.sticker);

        var stickerObjectId = mongoose.Types.ObjectId();
        var stickerUUID = uuidv4();

        mongoose.connect(mongodbUri, {useMongoClient: true})
            .then(() => {
                console.log("connected");

                // TODO: Try to combine the next 2 queries into one

                // Get chat with active sticker group
                return Chat.findOne({ chatId: update.message.chat.id })
                    .populate({
                        "path": "stickerGroups",
                        "match": { isActive: true },
                        "options": { limit: 1 }
                    })
                    .exec();
            })
            .then(chat => {
                console.log("got chat");
                console.log(chat);

                // Update sticker group references
                chat.stickerGroups[0].stickers.push(stickerObjectId);
                return chat.stickerGroups[0].save();
            })
            .then(chat => {
                console.log("Updated sticker group with sticker reference");
                console.log(chat);

                // Create new sticker
                var sticker = new Sticker({ _id: stickerObjectId, stickerGroup: chat.stickerGroups[0]._id });
                return sticker.save();
            })
            .then(sticker => {
                console.log("Added new sticker");
                console.log(sticker);

                // Get file path of sticker from Telegram
                return tgHelpers.getFile(update.message.sticker.file_id);
            })
            .then(response => {
                console.log("getting sticker");
                // Get sticker from Telegram
                console.log("Sticker path: ", response.data.result.file_path);
                var stickerUrl = tgHelpers.fileUrlPrefix + response.data.result.file_path;
                return axios.get(stickerUrl, {
                    responseType: "arraybuffer"
                });
                //return stickerUrl;
            })
            .then(response => {
                console.log("converting");
                // Convert webp sticker to png
                return new Promise((resolve, reject) => {
                    //var file = fs.createWriteStream(__dirname + '/tmp/' + stickerUUID + '.webp', { mode: 0o755 });
                    //response.data.pipe(file);

                    var dwebp = require(__dirname + '/node_modules/webp-converter/dwebp.js');

                    // Take data from stdin, send to stdout
                    // Keep everything in memory
                    var dwebpArgs = "-o - -- -";
                    //var dwebpArgs = __dirname + '/tmp/sticker.webp -o ' + __dirname + '/tmp/sticker.png';
                    //var command = dwebp() + ' ' + __dirname + '/tmp/sticker.webp -o ' + __dirname + '/tmp/sticker.png';
                    var stickerPng = child_process.spawnSync(dwebp(), dwebpArgs.split(/\s+/), {
                        "input": response.data,
                        "stdio": "pipe"
                    });

                    /*var file = fs.createWriteStream(__dirname + '/tmp/sticker.png', { mode: 0o755 });
                    file.write(stickerPng.stdout);
                    file.end();*/

                    //fs.writeFileSync(__dirname + '/tmp/sticker.png', stickerPng.stdout, { mode: 0o755 });

                    //console.log(stickerPng.stdout);

                    // Upload file to s3
                    var fileKey = stickerUUID + ".png";
                    //var compress = zlib.createGzip();
                    var upload = s3Stream.upload({
                        "Bucket": "physical-telegram-stickers",
                        "Key": fileKey,
                        "ACL": "public-read",
                        "ContentType": "image/png"
                    });

                    // Handle and catch errors
                    upload.on('error', function (error) {
                        console.log("Error uploading to s3: ", error);
                        reject(error);
                    });

                    // Progress bar, kinda
                    upload.on('part', function (details) {
                        console.log(details);
                    });

                    // details contains URL of file
                    upload.on('uploaded', function (details) {
                        console.log(details);

                        // delete png sticker
                        /*fs.unlink("tmp/sticker.png", function(err) {
                            console.log(err);
                        });*/

                        resolve(details);
                    });

                    // Pipe sticker png to s3
                    streamifier.createReadStream(stickerPng.stdout).pipe(upload);

                    //webp.dwebp("tmp/" + stickerUUID + ".webp", "tmp/" + stickerUUID + ".png", "-o", function(status) {
                        //console.log(status);

                        //console.log(stickerPng.stdout.toString('utf8'));

                        /*
                        if (status.indexOf("101") > -1) {
                            reject(status);
                        }
                        else {
                            // delete webp sticker
                            fs.unlink("tmp/" + stickerUUID + ".webp", function(err) {
                                console.log(err);
                            });

                            fs.readFile("tmp/" + stickerUUID + ".png", function (err, data) {
                                if (err) {
                                    reject(err);
                                }

                                // Prep data for uploading
                                var base64data = new Buffer.from(data, 'binary');
                                var fileKey = stickerUUID + ".png";
                                var s3 = new aws.S3();
                                
                                // Upload file
                                s3.upload({
                                    Bucket: 'physical-telegram-stickers',
                                    Key: fileKey,
                                    Body: base64data,
                                    ACL: 'public-read',
                                    ContentType: 'image/png'
                                }, function (err, response) {
                                    if (err) {
                                        reject(err);
                                    }
                                    fs.unlink("tmp/" + stickerUUID + ".png", function(err) {
                                        console.log(err);
                                    });
                                    resolve(response);
                                });
                            });*/                            
                        //}
                    //});
                });
            })
            .then(details => {
                console.log(details);

                // Store the URL of the file to the DB
                return Sticker.findOneAndUpdate({ _id: stickerObjectId }, { url: details.Location }, { new: true });
            })
            .then(sticker => {
                console.log("Updated sticker with URL");
                console.log(sticker);

                return tgHelpers.sendMessage(update.message.chat.id, sticker.url);
            })
            .then(response => {
                res.end("they stickered");
            })
            .catch(err => {
                console.log("Error: ", err);
                res.end("Something went wrong");
            });
    }
    else {
        tgHelpers.sendMessage(update.message.chat.id, "🅱️ig 🅱️oi").then(response => {
            res.end("general");
        }).catch(err => {
            res.end("Something went wrong");
        });
    }
});



app.get('/', function(req, res) {
    res.send("To be fair, you have to have a very high IQ to understand Rick and Morty. The humour is extremely subtle, and without a solid grasp of theoretical physics most of the jokes will go over a typical viewers head. There's also Rick's nihilistic outlook, which is deftly woven into his characterisation- his personal philosophy draws heavily from Narodnaya Volya literature, for instance. The fans understand this stuff; they have the intellectual capacity to truly appreciate the depths of these jokes, to realise that they're not just funny- they say something deep about LIFE. As a consequence people who dislike Rick & Morty truly ARE idiots- of course they wouldn't appreciate, for instance, the humour in Rick's existential catchphrase \"Wubba Lubba Dub Dub,\" which itself is a cryptic reference to Turgenevs Russian epic Fathers and Sons. I'm smirking right now just imagining one of those addlepated simpletons scratching their heads in confusion as Dan Harmon's genius wit unfolds itself on their television screens. What fools.. how I pity them. 😂<br><br>And yes, by the way, i DO have a Rick & Morty tattoo. And no, you cannot see it. It's for the ladies' eyes only- and even then they have to demonstrate that they're within 5 IQ points of my own (preferably lower) beforehand. Nothin personnel kid 😎");
});


app.listen(port, function() {
    console.log('🅱️erver listening on port 3000');
});