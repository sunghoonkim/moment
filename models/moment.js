/**
 * Created by sunghoonkim on 11/4/15.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var momentSchema = new Schema({
    momentdate:String,
    passtime:Number,
    category: String,
    memo: String,
    imageUrl: String,
    dateAdded : { type: Date, default: Date.now }
})

module.exports = mongoose.model('Moment',momentSchema);