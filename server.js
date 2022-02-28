/*********************************************************************************
*  WEB422 – Assignment 1
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Victor Lozano Alonso Student ID: 130720204 Date: January 14, 2022
*  Heroku Link: https://web422--project.herokuapp.com/
*
********************************************************************************/ 

const express = require ("express");
const cors = require("cors");
const path = require("path");
const RestaurantDB = require("./modules/restaurantDB.js");
const dotenv = require("dotenv");

// New RestaurantDB object
const db = new RestaurantDB();

//Set up dotenv environment variables
dotenv.config({path:"./config/keys.env"});

// Set up Express
const app = express ();

// Set up cors
app.use(cors());

//To ensure that our server can parse the JSON 
app.use(express.json());

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Connect to MongoDB
db.initialize(process.env.MONGODB_CONNECTION).then(()=>{
    console.log("Connected to MongoDB");
    app.listen(HTTP_PORT, ()=>{
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err)=>{
    console.log(err);
});

// --- Routes definition ---

// Home route
app.get("/", (req, res) => {
    res.json({message: "API Listening"});
});

// Route to add new Restaurant
app.post("/api/restaurants", (req, res) => {
    let new_rest = req.body.new_restaurant;
    db.addNewRestaurant(new_rest).then( () =>{
        res.status(201).json({});
    }).catch(()=>{
        res.status(500).send("API POST Request Failed");
    });
});

// Route to get an array of all restaurants for a specific page (sorted by restaurant_id),
// given the number of items per page
app.get("/api/restaurants", (req, res) => {
    db.getAllRestaurants(req.query.page,req.query.perPage,req.query.borough).then(allRest=>{
        res.status(200).json(allRest);
    }).catch(()=>{
        res.status(500).send("Wrong Query");
    });
});

// Route to return a specific "Restaurant" object to the client.
app.get("/api/restaurants/:id", (req, res) => {
    db.getRestaurantById(req.params.id).then(restaurant=>{
        res.status(200).json(restaurant);
    }).catch(()=>{
        res.status(500).send("Wrong Query");
    });
});

// Route to update a specific "Restaurant" document in the collection
app.put("/api/restaurants/:id", (req, res) => {
    db.updateRestaurantById(req.body,req.params.id).then(() => {
        res.status(204).json({});
    }).catch(() => {
        res.status(500).send("Fail to update. Try again");
    });
});

// Route to delete a specific "Restaurant" document from the collection using its "id"
app.delete("/api/restaurants/:id", (req,res) => {
    db.deleteRestaurantById(req.params.id).then(() => {
        res.status(204).json({});
    }).catch(() => {
        res.status(500).send("Fail to delete. Try again");
    });
});

// Function to handle 404 requests to pages that are not found.
app.use ((req, res) => {
    res.status (404).send ('Page Not Found');
});

// Error handler function to catch all errors.
app.use (function (err, req, res, next) {
    console.error (err.stack);
    res.status (500).send ('Something broke!');
});