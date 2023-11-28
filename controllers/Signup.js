const mongoose = require('mongoose')
const DB = require("../config/db")
const UserSchema = require("../models/userModels")
const jwt = require("jsonwebtoken")
const JWTSecretKey = "test";

const SignupPost = async (req, res) => {
    try {
        const user = new UserSchema(req.body);

        const data = await user.save();

        jwt.sign({ user }, JWTSecretKey, { expiresIn: '10h' }, (err, token) => {

            if (token) {
                res.send({ user, token });
            }
            res.send({ err: "Authentication failed" })
        })

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while saving the user.' });
    }
}

module.exports = SignupPost;
