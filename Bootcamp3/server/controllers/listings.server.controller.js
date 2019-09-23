
/* Dependencies */
var mongoose = require('mongoose'), 
    Listing = require('../models/listings.server.model.js'),
    coordinates = require('./coordinates.server.controller.js');
    
/*
  In this file, you should use Mongoose queries in order to retrieve/add/remove/update listings.
  On an error you should send a 404 status code, as well as the error message. 
  On success (aka no error), you should send the listing(s) as JSON in the response.

  HINT: if you are struggling with implementing these functions refer back to this tutorial 
  https://www.callicoder.com/node-js-express-mongodb-restful-crud-api-tutorial/
  or
  https://medium.com/@dinyangetoh/how-to-build-simple-restful-api-with-nodejs-expressjs-and-mongodb-99348012925d
  

  If you are looking for more understanding of exports and export modules - 
  https://www.sitepoint.com/understanding-module-exports-exports-node-js/
  or
  https://adrianmejia.com/getting-started-with-node-js-modules-require-exports-imports-npm-and-beyond/
 */

/* Create a listing */
exports.create = function (req, res) {

  /* Instantiate a Listing */
  var listing = new Listing(req.body);

  /* save the coordinates (located in req.results if there is an address property) */
  if (req.results) {
    listing.coordinates = {
      latitude: req.results.lat,
      longitude: req.results.lng
    };
  }

  /* Then save the listing */
  listing.save(function (err) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.json(listing);
      console.log(listing);
    }
  });
};

/* Show the current listing */
exports.read = function (req, res) {
  /* send back the listing as json from the request */
  res.json(req.listing);
};

/* Update a listing - note the order in which this function is called by the router*/
exports.update = function (req, res) {
  /* Replace the listings's properties with the new properties found in req.body */
  var listing = req.listing;
  var originalCode = listing.code;
  listing.code = req.body.code;
  listing.name = req.body.name;
  listing.address = req.body.address;
  /*save the coordinates (located in req.results if there is an address property) */
  if (req.results) {
    listing.coordinates = {
      latitude: req.results.lat,
      longitude: req.results.lng
    };
  }
  /* Save the listing */
  Listing.findOneAndUpdate({code: originalCode}, {
    $set: {
      code: listing.code,
      address: listing.address,
      name: listing.name,
      coordinates: listing.coordinates
    }
  }, {returnOriginal: false}, function (err, data) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.json(data);
  });
  /* listing.save(function (err) {
     if (err) {
       console.log(err);
       res.status(400).send(err);
     } else {
       res.json(listing)
     }
   })*/
};

/* Delete a listing */
exports.delete = function (req, res) {
  var listing = req.listing;
  Listing.findOneAndRemove({
    i_id: listing.id
  })
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        console.error(err)
        res.status(400).send(err);
      })

};

/* Retreive all the directory listings, sorted alphabetically by listing code */
exports.list = function (req, res) {
  /* Add your code */
  Listing.find().sort('code').exec(function (err, listings) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(listings); //retrieves all of the directory listings
    }
  });
};

/* 
  Middleware: find a listing by its ID, then pass it to the next request handler. 

  HINT: Find the listing using a mongoose query, 
        bind it to the request object as the property 'listing', 
        then finally call next
 */
exports.listingByID = function (req, res, next, id) {
  Listing.findById(id).exec(function (err, listing) {
    if (err) {
      res.status(400).send(err);
    } else {
      req.listing = listing;
      next();
    }
  });
};