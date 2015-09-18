var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = db.User;
var Link = db.Url;
// var User = require('../app/models/user');
// var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}).then(function(result) {
    console.log(result);
    res.send(200, result);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({ url: uri }).then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var hashedUrl = Link.hashUrl(uri);
        var newLink = new Link({                  
          url: uri,
          title: title,
          visits: 0, 
          code: hashedUrl,
          base_url: req.headers.origin
        });

        newLink.save().then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  })
    .catch(function(err) {
      throw err;
    });;
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ user_name: username })
    .then(function(user) {
      console.log(user);
      if (!user) {
        console.log('no user');
        res.redirect('/login');
      } 
      else {
        console.log('password', password);
        console.log('user password', user.password);
        user.comparePassword(password, user.password, function(match) {
          console.log('match:', match);
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        })
      }
    })
    .catch(function(err) {
      throw err;
    });;
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ user_name: username })
    .then(function(user) {
      if (!user) {
        var hashPassword = User.hashPassword(password);
        var newUser = new User({
          user_name: username,
          password: hashPassword
        });
        newUser.save()
          .then(function(newUser) {
            util.createSession(req, res, newUser);
          });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    })
    .catch(function(err) {
      throw err;
    });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] })
    .then(function(link) {
      // console.log(link);
      if (!link) {
        console.log('About to redirect!');
        res.redirect('/');
      } else {
          console.log("visits updated", link);
          link.visits = link.visits + 1;
          res.redirect(link.url);
      }
    })
    .catch(function(err) {
      throw err;
    })
};