var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ShapesProvider = function(host, port) {
    this.db= new Db('node-mongo-shapes', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
    this.db.open(function(){});
};

ShapesProvider.prototype.getCollection= function(callback) {
    this.db.collection('shapess', function(error, shapes_collection) {
        if( error ) callback(error);
        else callback(null, shapes_collection);
    });
};

//find all shapess
ShapesProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, shapes_collection) {
        if( error ) callback(error)
        else {
            shapes_collection.find().toArray(function(error, results) {
                if( error ) callback(error)
                else callback(null, results)
            });
        }
    });
};

//find an shapes by ID
ShapesProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, shapes_collection) {
        if( error ) callback(error)
        else {
            shapes_collection.findOne({_id: shapes_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
                if( error ) callback(error)
                else callback(null, result)
            });
        }
    });
};

//find an shapes by email
ShapesProvider.prototype.findByEmail = function(email, callback) {
    this.getCollection(function(error, shapes_collection) {
        if( error ) callback(error)
        else {
            shapes_collection.find({email: email}).toArray(function(error, result) {
                if( error ) callback(error)
                else callback(null, result)
            });
        }
    });
};


//save new shapes
ShapesProvider.prototype.save = function(shapess, callback) {
    this.getCollection(function(error, shapes_collection) {
        if( error ) callback(error)
        else {
            if( typeof(shapess.length)=="undefined")
                shapess = [shapess];

            for( var i =0;i< shapess.length;i++ ) {
                shapes = shapess[i];
                shapes.created_at = new Date();
            }

            shapes_collection.insert(shapess, function() {
                callback(null, shapess);
            });
        }
    });
};

// update an shapes
ShapesProvider.prototype.update = function(shapesId, shapess, callback) {
    this.getCollection(function(error, shapes_collection) {
        if( error ) callback(error);
        else {
            shapes_collection.update(
                {_id: shapes_collection.db.bson_serializer.ObjectID.createFromHexString(shapesId)},
                shapess,
                function(error, shapess) {
                    if(error) callback(error);
                    else callback(null, shapess)
                });
        }
    });
};

//delete shapes
ShapesProvider.prototype.delete = function(shapesId, callback) {
    this.getCollection(function(error, shapes_collection) {
        if(error) callback(error);
        else {
            shapes_collection.remove(
                {_id: shapes_collection.db.bson_serializer.ObjectID.createFromHexString(shapesId)},
                function(error, shapes){
                    if(error) callback(error);
                    else callback(null, shapes)
                });
        }
    });
};

exports.ShapesProvider = ShapesProvider;