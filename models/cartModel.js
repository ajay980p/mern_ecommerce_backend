const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    prodID: {
        type: String,
        require: true
    },

    userID: {
        type: String,
        require: true
    },

    quantity: {
        type: Number,
        require: true
    }
})

module.exports = mongoose.model("carts", cartSchema);