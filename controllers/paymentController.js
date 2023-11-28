const Razorpay = require('razorpay');
var crypto = require('crypto');
const instance = new Razorpay({ key_id: 'rzp_test_KHlf4bjD7Fm6Lo', key_secret: 'sPa8pfCa9Me5uhlXmwIujRRt' })
const { v4: uuidv4 } = require('uuid');
const orderSchema = require('../models/orderModel');

// To create Order
module.exports.orderCreate = (req, res) => {

    const { cartTotal } = req.body;

    const options = {
        amount: cartTotal * 100,
        currency: "INR",
        receipt: uuidv4()
    };

    instance.orders.create(options, function (err, order) {
        if (err) {
            res.send({ err: err })
        }
        res.send(order)
    });
}


// To verify payment
module.exports.verifyPayment = async (req, res) => {

    const order_id = req.body.response.razorpay_order_id;
    const razorpay_payment_id = req.body.response.razorpay_payment_id;
    const razorpay_signature = req.body.response.razorpay_signature;

    const body = order_id + "|" + razorpay_payment_id;

    const generated_signature = await crypto.createHmac('sha256', 'sPa8pfCa9Me5uhlXmwIujRRt')
        .update(body.toString())
        .digest("hex")

    if (generated_signature == razorpay_signature) {
        res.status(200).send({ success: "payment is successful", order_id });
    } else {
        res.status(400).send({ failed: "payment is unsuccessful" });
    }
}


// Save Order Details in Database
module.exports.saveOrderInDatabase = async (req, res) => {

    const { order_id, totalAmount, receiptID, cartItems } = req.body;

    const order = new orderSchema({ order_id, totalAmount, receiptID, cartItems });

    const savedOrder = await order.save();

    if (savedOrder) {
        res.send({ success: "Data saved in Database", savedOrder })
    } else {
        res.send({ failed: true })
    }
}