const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const http = require("http");

const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* ---------------- MONGODB CONNECTION ---------------- */

mongoose.connect(
    "mongodb+srv://salinisuji6_db_user:salini07@cluster0.dpxieve.mongodb.net/cafeDB?retryWrites=true&w=majority&appName=Cluster0"
)

.then(() => {

    console.log("MongoDB Connected");

})

.catch((err) => {

    console.log(err);

});

/* ---------------- ORDER SCHEMA ---------------- */

const orderSchema = new mongoose.Schema({

    customerName: String,

    customerPhone: String,

    customerAddress: String,

    cart: Array

});

const Order = mongoose.model("Order", orderSchema);

/* ---------------- HOME ROUTE ---------------- */

app.get("/", (req, res) => {

    res.send("Backend Running");

});

/* ---------------- PLACE ORDER API ---------------- */

app.post("/place-order", async (req, res) => {

    try {

        console.log(req.body);

        const newOrder = new Order({

            customerName: req.body.customerName,

            customerPhone: req.body.customerPhone,

            customerAddress: req.body.customerAddress,

            cart: req.body.cart

        });

        await newOrder.save();

        /* LIVE ORDER EVENT */

        io.emit("new-order", req.body);

        console.log("Order Saved");

        res.json({

            success: true,

            message: "Order Saved Successfully"

        });

    } catch (error) {

        console.log(error);

        res.json({

            success: false,

            message: "Order Failed"

        });

    }

});

/* ---------------- GET ORDERS ---------------- */

app.get("/orders", async (req, res) => {

    try {

        const orders = await Order.find();

        res.json(orders);

    } catch (error) {

        console.log(error);

    }

});

/* ---------------- DELETE ORDER ---------------- */

app.delete("/delete-order/:id", async (req, res) => {

    try {

        const id = req.params.id;

        console.log("Deleting:", id);

        await Order.findByIdAndDelete(id);

        res.json({

            success: true

        });

    } catch (error) {

        console.log(error);

        res.json({

            success: false

        });

    }

});

/* ---------------- SOCKET CONNECTION ---------------- */

io.on("connection", (socket) => {

    console.log("Admin Connected");

});

/* ---------------- SERVER ---------------- */

server.listen(5000, () => {

    console.log("Server running on port 5000");

});