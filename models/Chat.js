var mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
    chatId: Number,
    stickerGroup:[{ type: mongoose.Schema.Types.ObjectId, ref: 'StickerGroup' }]
}, {
    _id: false
});

var Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;