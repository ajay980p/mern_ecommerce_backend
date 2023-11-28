const express = require('express')
const ProductSchema = require("../models/productModel")
const Cart = require("../models/cartModel")


const ProductsData = async (req, res) => {
    try {
        let { category, minPrice, maxPrice } = req.query;

        let query = {}

        if (category) {
            query.category = category;
        }

        if (minPrice && maxPrice) {
            minPrice = parseInt(minPrice, 10)
            maxPrice = parseInt(maxPrice, 10)
            query.price = { $gte: minPrice, $lte: maxPrice };
        } else if (minPrice) {
            minPrice = parseInt(minPrice, 10)
            query.price = { $gte: minPrice };
        } else if (maxPrice) {
            maxPrice = parseInt(maxPrice, 10)
            query.price = { $lte: maxPrice };
        }

        const response = await ProductSchema.find(query);
        res.send(response);

    } catch (err) {
        res.status(500).send(err);
    }
};


const ProductDataWithID = async (req, res) => {

    const ProductID = req.params.id;
    const { userID } = req.body;

    const cartTableData = await Cart.find({ userID, prodID: ProductID }).lean();
    const response = await ProductSchema.findOne({ _id: ProductID }).lean();

    if (cartTableData.length === 0) {
        response.isAvailable = false;
        return res.send(response)
    }

    let product = []
    for (const cartData of cartTableData) {
        if (cartData.prodID == ProductID) {
            product = await ProductSchema.findOne({ _id: cartData.prodID }).lean()
            product.quantity = cartData.quantity;
        }
    }
    product.isAvailable = true;
    res.send(product);
}

module.exports = { ProductsData, ProductDataWithID };