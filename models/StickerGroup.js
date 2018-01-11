var mongoose = require('mongoose');

var StickerGroupSchema = new mongoose.Schema({
    stickerUrls: [String]
});

var StickerGroup = mongoose.model('StickerGroup', StickerGroupSchema);
module.exports = StickerGroup;