var mongoose = require('mongoose');
var StickerGroup = require('./StickerGroup');

var StickerSchema = new mongoose.Schema({
    stickerGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StickerGroup'
    },
    url: String
});

StickerSchema.post('save', function(doc) {
    console.log("post save");
    console.log(this);
    // Add ref for sticker to referenced sticker group
    doc.constructor.updateRefs("add", doc, function(err, stickerGroup) {
        if (err) console.log(err);
        console.log("refs added");
    });
});

StickerSchema.post('remove', function(doc) {
    console.log("post remove");
    // Remove ref for sticker to referenced sticker group
    doc.constructor.updateRefs("remove", doc, function(err, stickerGroup) {
        if (err) console.log(err);
        console.log("refs removed");
    });
});

StickerSchema.statics.updateRefs = function(add_or_remove, sticker, cb) {
    StickerGroup.findOne(sticker.stickerGroup, function(err, stickerGroup) {
        if (err) {
            console.log("Error updating refs: ", err);
            return cb(err);
        }

        if (add_or_remove == "add") {
            // Add if ref doesn't exist
            if (stickerGroup.stickers.indexOf(sticker._id) === -1) {
                stickerGroup.stickers.push(sticker._id);
            }
        }
        else if (add_or_remove == "remove") {
            // Remove if ref doesn't exist
            if (stickerGroup.stickers.indexOf(sticker._id) > -1) {
                stickerGroup.stickers.pull(sticker._id);
            }
        }
        return stickerGroup.save(cb);
    });
};


var Sticker = mongoose.model('Sticker', StickerSchema);
module.exports = Sticker;