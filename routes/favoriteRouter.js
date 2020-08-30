const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {  // basic cors or get method. The corsWithOptions is for preflight requests
  Favorite.findOne({user:req.user._id})
  .populate('user')
  .populate('campsites')
  .then(favorite => {
    console.log(favorite);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorite);
  })
  .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({user:req.user._id})
  .then(favorite => {
    if (favorite){
      req.body.forEach(fav => {
        if(!favorite.campsites.includes(fav._id)) {
          favorite.campsites.push(req.fav._id);
        }
      })
      favorite.save()
      .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
      })
      .catch(err => next(err));
    } else {
      Favorite.create({user:req.user._id, campsites:req.body})
      .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
      })
    .catch(err => next(err));
    }
    // console.log(favorite);
  })
  .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { 
  res.statusCode = 403;
  res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({user:req.user._id})
  if (favorite) {
    favorite.remove()
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
      })
    .catch(err => next(err));
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorite);
  }
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {  // basic cors or get method. The corsWithOptions is for preflight requests
  Favorite.findById(req.params.favoriteId)
  .then(favorite => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorite);
  })
  .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  Favorite.findOne({user:req.user._id})
  .then(favorite => {
    if (favorite){
      if(!favorite.campsites.includes(req.params.campsiteId)) {
        favorite.campsites.push(req.params.campsiteId);
        favorite.save()
        .then(favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        })
        .catch(err => next(err));
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end("This campsite is already a favorite");
      }
    } else {
      Favorite.create({user:req.user._id, campsites:[req.params.campsiteId]})
      .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
      })
      .catch(err => next(err));
    }
  })
  .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findByIdAndUpdate(req.params.favoriteId, {
    $set: req.body
  }, { new: true }) //new, so we get back info about the updated document as the result from this method
  .then(favorite => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorite);
  })
  .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({user:req.user._id})
  .then(favorite => {
    if (favorite) {
      const index = favorite.campsites.indexOf(req.params.campsiteId)
      if (index >= 0) {
        favorite.campsites.splice(index, 1)
      } 
      favorite.save()
      .then(favorite => {
        Favorite.findById(favorite._id)
        .then(favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        })
        .catch(err => next(err));
      })
    .catch(err => next(err));
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(favorite);
    }
  })
  .catch(err => next(err));
});

module.exports = favoriteRouter;