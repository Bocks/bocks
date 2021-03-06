var Bocks = require('./bocksModel.js');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = {

  newBocks: function (req, res, next) {
    console.log('REQ', req.body);

    Bocks.create({
      userName: req.session.passport.user.username,
      title: req.body.title,
      code: req.body.code,
      highlights: req.body.highlights,
      isPrivate: !!req.body.isPrivate,
      tags: req.body.tags
    })
    .then(function (data) {
      console.log('DATA', data);

      if (data) {
        res.json(data);
      }
    });
  },

  retrieveAll: function(req, res, next) {
    var skip = parseInt(req.query.skip) || 0;
    var limit = parseInt(req.query.limit) || 5;
    var username = req.query.username || null;

    if (username) {
      Bocks.find({
        userName: username
      })
        .sort({ modifiedAt: -1 })
        .skip(skip)
        .limit(limit)
        .then(function(snippets) {
          if (snippets) {
            res.json(snippets);
          }
        });
    } else {
      Bocks.find()
        .sort({ modifiedAt: -1 })
        .skip(skip)
        .limit(limit)
        .then(function(snippets) {
          if (snippets) {
            res.json(snippets);
          }
        });
    }
  },

  getAllUserBocks: function (req, res, next) {
    Bocks.find({
      userName: req.body.userName
    }).where({
      $or : [
        {isPrivate: false},
        {userName: req.session.passport.user.username}
      ]
    }).then(function (data) {
      if (data) {
          res.json(data);
      }
    });
  },

  getOneBocks: function (req, res, next) {
    console.log('getOneBocks', req.params.id);

    Bocks.findById(req.params.id)
    // .where({
    //   $or : [
    //     {isPrivate: false},
    //     {userName: req.session.passport.user.username}
    //   ]
    // })
    .then(function (data) {
      console.log('getOneBocks then', data);
      if (data) {
        res.json(data);
      }
    }, function(err) {
      console.log('getOneBocks error', err);
      res.status(404);
    });
  },

  changeBocks: function (req, res, next) {
    Bocks.update({
      _id: req.params.id,
      userName: req.session.passport.user.username
    },
    {
      title: req.body.title,
      code: req.body.code,
      highlights: req.body.highlights,
      isPrivate: !!req.body.isPrivate,
      tags: req.body.tags,
      modifiedAt: Date.now()
    }).then(function (data) {
      if (data) {
        res.json(data);
      }
    });
  },

  remBocks: function (req, res, next) {
    Bocks.remove({
      _id: req.params.id
    }).where({
      userName: req.session.passport.user.username
    }).then(function (data) {
      if (data) {
        res.json(data);
      } else {
        res.status(401);
      }
    });
  }
};
