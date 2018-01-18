var mongoose = require('mongoose');
var shortid = require('shortid');
var Chat = require('./Chat');

var StickerGroupSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    urlSlug: {
        type: String,
        unique: true,
        default: function() { return shortid.generate(); }
    },
    //chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', localField: '_id', foreignField: 'band' },
    isActive: { type: Boolean, default: true },
    stickers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sticker'
    }]
});

StickerGroupSchema.post('save', function(doc) {
    console.log("post save");
    // Add ref for sticker group to referenced chat
    doc.constructor.updateRefs("add", doc, function(err, chat) {
        if (err) console.log(err);
        console.log("refs added");
    });
});

StickerGroupSchema.post('findOneAndUpdate', function(doc) {
    console.log("post findOneAndUpdate");
    // Add ref for sticker group to referenced chat
    this.model.updateRefs("add", doc, function(err, chat) {
        if (err) console.log(err);
        console.log("refs added");
    });
});

StickerGroupSchema.post('remove', function(doc) {
    console.log("post remove");
    // Remove ref for sticker group to referenced chat
    doc.constructor.updateRefs("remove", doc, function(err, chat) {
        if (err) console.log(err);
        console.log("refs removed");
    });
});

StickerGroupSchema.statics.updateRefs = function(add_or_remove, stickerGroup, cb) {
    Chat.findOne(stickerGroup.chat, function(err, chat) {
        if (err) {
            console.log("Error updating refs: ", err);
            return cb(err);
        }

        if (add_or_remove == "add") {
            // Add if ref doesn't exist
            if (chat.stickerGroups.indexOf(stickerGroup._id) === -1) {
                chat.stickerGroups.push(stickerGroup._id);
            }
        }
        else if (add_or_remove == "remove") {
            // Remove if ref doesn't exist
            if (chat.stickerGroups.indexOf(stickerGroup._id) > -1) {
                chat.stickerGroups.pull(stickerGroup._id);
            }
        }
        return chat.save(cb);
    });
};
  

var StickerGroup = mongoose.model('StickerGroup', StickerGroupSchema);
module.exports = StickerGroup;