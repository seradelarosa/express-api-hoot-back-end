const express = require('express');
const verifyToken = require('../middleware/verify-token');
const Hoot = require('../models/hoot');
const router = express.Router();

// POST to /hoots
router.post('/', verifyToken, async (req, res) => {
    
    try {
        // add the logged in user (req.user._id) as the author (req.body.author)
        req.body.author = req.user._id;
        // create() the hoot document, passing req.body
        const hoot = await Hoot.create(req.body);
        // initially, author property only has the user's ObjectId
        // add complete user object (avail in req) to the new hoot to have full user info
        hoot._doc.author = req.user;
         // send the JSON response
         res.status(201).json(hoot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    };

})

// GET /hoots
router.get('/', verifyToken, async (req, res) => {
    try {
        // calling find({}) method to retrieve hoots from the database
        const hoots = await Hoot.find({})
        // chain 2 additional mongoose methods to the end
        // use populate() method to populate author property of each hoot with a user object
        // populate takes a key
        .populate("author")
        // use sort() method to sort hoots in descending order
        .sort({ createdAt: "desc" });

        // once the new hoots are retrieved, send JSON response containing the hoots array
        res.status(200).json(hoots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    };

});













module.exports = router;