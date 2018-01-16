var mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
    chatId: { type: Number, unique: true },
    stickerGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StickerGroup'
    }]
});

var Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;