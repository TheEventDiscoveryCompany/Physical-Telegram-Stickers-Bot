var mongoose = require('mongoose');

var StickerSchema = new mongoose.Schema({
    stickerGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'StickerGroup' },
    url: String
});

var Sticker = mongoose.model('Sticker', StickerSchema);
module.exports = Sticker;