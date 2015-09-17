var Bookshelf = require('bookshelf');
var path = require('path');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var crypto = require('crypto');


mongoose.connect('mongodb://shortlyHeidiGarrett:ogxziywO5cdKxwZuhPA7umLHw7BUAAexeJUXOp9S.L8-@ds042688.mongolab.com:42688/shortlyHeidiGarrett');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('Connected to DB succesfully!');
});

var userSchema = mongoose.Schema({
    user_name: String, 
    password: String
});

var urlSchema = mongoose.Schema({
    url: String, 
    base_url: String, 
    visits: Number, 
    title: String
});

userSchema.methods.initialize = function(){
    this.on('creating', this.hashPassword);
};

userSchema.methods.comparePassword = function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
      callback(isMatch);
    });
};

userSchema.methods.hashPassword = function(){
    var cipher = Promise.promisify(bcrypt.hash);
    return cipher(this.get('password'), null, null).bind(this)
      .then(function(hash) {
      this.set('password', hash);
  })
};

urlSchema.methods.initialize = function(){
  this.on('creating', function(model, attrs, options){
    var shasum = crypto.createHash('sha1');
    shasum.update(model.get('url'));
    model.set('code', shasum.digest('hex').slice(0, 5));
  });
};


exports.User = mongoose.model('User', userSchema);
exports.Url = mongoose.model('Url', urlSchema);

// module.exports = db;
// module.exports = User;
// module.exports = Url;

// var temp = new mongoose.model('Url', urlSchema);
