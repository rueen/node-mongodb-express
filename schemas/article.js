var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
    title: String,
    desc: String,
    summary: String,
    content: String,
    author: String,
    update: String
});

ArticleSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createAt = Date.now();
    } else {
        this.updateAt = Date.now();
    }
    next();
});

ArticleSchema.statics = {
    fetch: function (cb) {
        return this
            .find({})
            .sort({ $natural: -1 })
            .exec(cb);
    },
    findById: function (id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb);
    }
};

module.exports = ArticleSchema;