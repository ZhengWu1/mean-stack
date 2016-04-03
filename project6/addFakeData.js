"use strict";

/* jshint node: true */
/* global Promise */

/*
 * This Node.js program loads a fake Photo App datasset in  Mongoose defined objects
 * in a MongoDB database. It can be run with the command:
 *     node loadFakeData.js
 * be sure to have an instance of the MongoDB running on the localhost.
 *
 * This script loads the data into the MongoDB database named 'cs142project6'.  In loads
 * into collections named User and Photos. The Comments are added in the Photos of the
 * comments. 
 *
 * NOTE: This scripts uses Promise abstraction for handling the async calls to
 * the database. We are not teaching Promises in CS142 so strongly suggest you don't
 * use them in your solution.
 *
 */

var faker = require('faker');

// We use the Mongoose to define the schema stored in MongoDB.
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cs142project6');

// Load the Mongoose schema for Use and Photo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var versionString = '2.0';

var numUsers = 100;
var maxPhotos = 50;
var maxComments = 30;



// Generate the users

var userPromises = [];
var users = [];

console.log('Creating ', numUsers, 'users');

for (var i = 0; i < numUsers; i++) {
    var args = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        location: faker.address.city() + ', ' + faker.address.state(),
        description: faker.company.catchPhrase(),
        occupation: faker.name.jobTitle()
    };
    userPromises.push(User.create(args, function (err, userObj) {
        if (err) {
            console.error('Error create user', err);
        } else {
            // Set the unique ID of the object. We use the MongoDB generated _id for now
            // but we keep it distinct from the MongoDB ID so we can go to something
            // prettier in the future since these show up in URLs, etc.
            userObj.id = userObj._id;
            userObj.save();

            users.push(userObj);
            console.log('Adding user:', userObj.first_name + ' ' + userObj.last_name, ' with ID ',
                userObj.id);
        }
    }));
}


var allPromises = Promise.all(userPromises).then(function () {
    // Once we've loaded all the users into the User collection we add all the photos. Note
    // that the user_id of the photo is the MongoDB assigned id in the User object.
    var photoModels = [];
    var photoPromises = [];
    for (var u = 0; u < numUsers; u++) {
        var numPhotos = faker.random.number({min: 0, max: maxPhotos});
        (function (user) {
            for (var p = 0; p < numPhotos; p++) {
                photoPromises.push(Photo.create({
                    file_name: faker.image.image(),
                    date_time: new Date(),
                    user_id: user.id
                }, function (err, photoObj) {
                    if (err) {
                        console.error('Error create user', err);
                    } else {
                        // Set the unique ID of the object. We use the MongoDB generated _id for now
                        // but we keep it distinct from the MongoDB ID so we can go to something
                        // prettier in the future since these show up in URLs, etc.
                        photoObj.id = photoObj._id;
                        photoModels.push(photoObj);
                        var numComments = faker.random.number({min: 0, max: maxComments});
                        for (var c = 0; c < numComments; c++) {
                            var author = users[faker.random.number({
                                min: 0,
                                max: numUsers - 1
                            })];
                            var comment = {
                                comment: faker.lorem.paragraph(),
                                date_time: new Date(),
                                user_id: author.id
                            };
                            photoObj.comments.push(comment);
                            console.log("Adding comment of length %d by user %s to photo %s",
                                comment.comment.length,
                                comment.user_id,
                                photoObj.file_name);

                        }
                        photoObj.save();
                        console.log('Adding photo:', photoObj.file_name, ' of user ID ', user.id);
                    }
                }));
            }
        } )(users[u]);
    }
    return Promise.all(photoPromises).then(function () {
        // Update the SchemaInfo object to the new versionString
        return SchemaInfo.find({}, function (err, schemaInfos) {
            if (err || !schemaInfos || !schemaInfos.length) {
                console.error('Error updating schemaInfo', err);
            } else {
                var schemaInfo = schemaInfos[0];
                schemaInfo.version = versionString;
                schemaInfo.load_date_time = new Date();
                schemaInfo.save();
                console.log('SchemaInfo object updated with version ', versionString);
            }
        });
    });
});

allPromises.then(function () {
    mongoose.disconnect();
});
