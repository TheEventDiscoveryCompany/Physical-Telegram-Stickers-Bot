var mongoose = require('mongoose');

var StickerGroupSchema = new mongoose.Schema({
    sticker: {
        url: String
    }
});

var StickerGroup = mongoose.model('StickerGroup', StickerGroupSchema);
module.exports = StickerGroup;