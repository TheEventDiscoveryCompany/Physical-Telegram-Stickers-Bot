var mongoose = require('mongoose');

var StickerGroupSchema = new mongoose.Schema({
    chat: {type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    //chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', localField: '_id', foreignField: 'band' },
    isActive: { type: Boolean, default: true },
    stickers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sticker'
    }]
});

var StickerGroup = mongoose.model('StickerGroup', StickerGroupSchema);
module.exports = StickerGroup;