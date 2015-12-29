// Dependencies
var mongoose    = require('mongoose');
var User        = require('./model.js');

// Opens App Routes
module.exports = function(app){
    // GET Routes
    // Retrieve records for all users in the db
    app.get('/users',function(req,res){
        // Uses Mongoose schema to run the search (empty conditions)
        var query = User.find({});
        query.exec(function(err, users){
           if(err){
               res.send(err);
           } 
            res.json(users);
        });
    });
    // POST Routes
    // Provides method for saving new users in the db
    app.post('/users', function(req, res){
       // Creates a new User based on the Mongoose schema and the post body
        var newuser = new User(req.body);
        // New User is saved in the db.
        newuser.save(function(err){
           if(err){
               res.send(err);
           } 
            res.json(req.body);
        });
    });
    // Retrieves JSON records for all users who meet a certain set of query conditions
    app.post('/query/',function(req,res){
        var lat = req.body.latitude;
        var long = req.body.longitude;
        var distance = req.body.distance;
        var male = req.body.male;
        var female = req.body.female;
        var other = req.body.other;
        var minAge = req.body.minAge;
        var maxAge = req.body.maxAge;
        var favLang = req.body.favlang;
        var reqVerified = req.body.reqVerified;
        // Opens a generic Mongoose Query. Depending on the post body we will...
        var query = User.find({});
        // ... include filter by Max Distance (converting miles to meters)
        if(distance){
            // Using MongoDB's geospatial querying features.
            query = query.where('location').near({center:{type:'Point', coordinates:[long,lat]},
                // Converting meters to miles. Specifying spherical geometry 
                maxDistance: distance * 1609.34, spherical: true});
        }
        if(male || female || other){
            query.or([{ 'gender': male }, {'gender': female}, {'gender': other}]);
        }
        if(minAge){
            query = query.where('age').gte(minAge);
        }
        if(maxAge){
            query = query.where('age').lte(maxAge);
        }
        if(favLang){
            query = query.where('favlang').equals(favLang);
        }
        if(reqVerified){
            query = query.where('htmlverified').equals("Yep (Thanks for giving us real data!)");
        }
        // Execute Query and Return the Query Results
        query.exec(function(err,users){
           if(err)
               res.send(err);
            res.json(users);
        });
    })
};