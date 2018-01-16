var mongoose = require('mongoose');

var StickerSchema = new mongoose.Schema({
    url: String
});

var Sticker = mongoose.model('Sticker', StickerSchema);
module.exports = Sticker;