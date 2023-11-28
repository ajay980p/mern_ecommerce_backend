const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    order_id: String,
    totalAmount: Number,
    receiptID: String,
    cartItems: [Object]
});

module.exports = mongoose.model('Orders', orderSchema);
