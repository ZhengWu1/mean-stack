"use strict";
/*
 *  Defined the salt utilities
 */
/* jshint node: true */
var crypto = require('crypto');

/*
 * Return a salted and hashed password entry from a
 * clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry
 * where passwordEntry is an object with two string
 * properties:
 *      salt - The salt used for the password.
 *      hash - The sha1 hash of the password and salt
 */
function makePasswordEntry(clearTextPassword) {
    var passwordEntry = {};
    passwordEntry.salt = crypto.randomBytes(8).toString('hex');
    passwordEntry.hash = crypto.createHash('sha1').update(clearTextPassword + passwordEntry.salt).digest('hex');
    return passwordEntry;
}

/*
 * Return true if the specified clear text password
 * and salt generates the specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
    return crypto.createHash('sha1').update(clearTextPassword + salt).digest('hex') === hash;
}

// make this available to our users in our Node applications
module.exports = {
    makePasswordEntry: makePasswordEntry,
    doesPasswordMatch: doesPasswordMatch
};