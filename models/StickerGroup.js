var mongoose = require('mongoose');

var StickerGroupSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: false },
    stickers:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Sticker' }]
});

var StickerGroup = mongoose.model('StickerGroup', StickerGroupSchema);
module.exports = StickerGroup;