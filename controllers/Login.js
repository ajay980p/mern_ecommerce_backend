const UserSchema = require("../models/userModels");
const jwt = require("jsonwebtoken")

const UserLogin = async (req, res) => {

    try {
        if (req.body.email && req.body.password) {

            console.log("Before")
            const user = await UserSchema.findOne({ email: req.body.email });
            console.log("Database checking ", user)
            if (user) {
                if (user.password === req.body.password) {

                    // generating token using JWT
                    jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: '10h' }, (err, token) => {

                        if (token) {
                            res.send({ user, token });
                        }
                        res.send({ err: "Authentication failed" })
                    })

                } else {
                    res.status(401).json({ error: "Wrong Password" });
                }
            } else {
                res.status(404).json({ error: "User not found" });
            }

        } else {
            res.status(400).json({ error: "Missing email or password" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = UserLogin;