const express = require('express');
const cors = require('cors');
const app = express();
const UserLogin = require("./controllers/Login")
const { ProductsData, ProductDataWithID } = require("./controllers/ProductsData")
const SignupPost = require("./controllers/Signup");
const payment = require("./controllers/paymentController")
const products = require("./models/productModel")
const JWTSecretKey = "test";
const jwt = require("jsonwebtoken")
const Cart = require("./models/cartModel")
require('dotenv').config();

let PORT = process.env.PORT || 4000

// Enable JSON request body parsing
app.use(express.json());
// Enable CORS
app.use(cors());

// JWT Token Verify
function verifyToken(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];

    jwt.verify(token, JWTSecretKey, (err, valid) => {
        if (err) {
            res.send({ success: false });
        } else {
            next();
        }
    });
}


// ******************************************************************
// returning all CART Products
app.post("/findCartProducts", async (req, res) => {
    const { userID } = req.body;

    // Get the product IDs from the cart.
    const cartTableData = await Cart.find({ userID });

    let productsAvailWithQuantity = [];

    for (const cartData of cartTableData) {
        let product = await products.findOne({ _id: cartData.prodID }).lean()

        product.quantity = cartData.quantity;
        productsAvailWithQuantity.push(product);
    }

    res.send(productsAvailWithQuantity);
});


// save CART Products to a MongoDB database
app.post("/addToCart", async (req, res) => {
    const { productID, userID } = req.body;

    // Check if the user already exists in the cart.
    const userExists = await Cart.findOne({ userID });

    if (userExists) {
        // Check if the product already exists in the cart for the user.
        const productExists = await Cart.findOne({ userID, prodID: productID });

        if (productExists) {
            // Update the quantity of the product in the cart for the user.
            await Cart.findOneAndUpdate({ userID, prodID: productID }, { $inc: { quantity: 1 } });
        } else {
            // Add the product to the cart for the user.
            await Cart.create({ userID, prodID: productID, quantity: 1 });
        }
    } else {
        // Add the user to the cart.
        await Cart.create({ userID, prodID: productID, quantity: 1 });
    }

    // Respond to the client with a success message and the product details.
    res.send({
        message: "Product added to cart successfully!",
    });
});



// Decrement Product Quantity
app.post("/decrementProductQuantity", async (req, res) => {

    const { productID, userID } = req.body;

    await Cart.findOneAndUpdate({ userID, prodID: productID }, { $inc: { quantity: -1 } });

    // finding all the products using USER_ID
    const cartTableData = await Cart.find({ userID })

    let productsAvailWithQuantity = [];
    for (const cartData of cartTableData) {
        let product = await products.findOne({ _id: cartData.prodID }).lean()

        product.quantity = cartData.quantity;
        productsAvailWithQuantity.push(product);
    }
    res.send(productsAvailWithQuantity)
})

// Increment Product Quantity
app.post("/incrementProductQuantity", async (req, res) => {

    const { productID, userID } = req.body;
    await Cart.findOneAndUpdate({ userID, prodID: productID }, { $inc: { quantity: 1 } });

    const cartTableData = await Cart.find({ userID });

    let productsAvailWithQuantity = [];

    for (const cartData of cartTableData) {
        let product = await products.findOne({ _id: cartData.prodID }).lean()

        product.quantity = cartData.quantity;
        productsAvailWithQuantity.push(product);
    }

    res.send(productsAvailWithQuantity);
})


// CART Delete Secific Product
app.post("/deleteSpecificProduct", async (req, res) => {

    const { productID, userID } = req.body;

    await Cart.findOneAndDelete({ userID, prodID: productID });

    const cartTableData = await Cart.find({ userID });

    let productsAvailWithQuantity = [];
    for (const cartData of cartTableData) {
        let product = await products.findOne({ _id: cartData.prodID }).lean()

        product.quantity = cartData.quantity;
        productsAvailWithQuantity.push(product);
    }

    res.send(productsAvailWithQuantity);
})

// **************************************************************


app.get("/verify", verifyToken, async (req, res) => {
    res.send({ success: true })
})

// To Submit the User Details
app.post("/register", SignupPost);


// User LOGIN
app.post("/login", UserLogin);


// Get Products
app.get("/products", verifyToken, ProductsData);


// Get Product With ID
app.post("/product/:id", ProductDataWithID)


// Payment Routes
app.post("/orders", payment.orderCreate);
app.post("/paymentVerification", payment.verifyPayment);
app.post("/saveOrderInDatabase", payment.saveOrderInDatabase);


app.get("/", (req, res) => {
    res.send({ "msg": "Welcome to the homepage" })
})

app.listen(PORT, () => {
    console.log(`Server is connected ${PORT}`);
});