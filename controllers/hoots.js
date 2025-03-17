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


// GET /hoots/:hootId
router.get('/:hootId', verifyToken, async (req, res) => {
    try {
        // call on the Hoot model's findById() method 
        // pass in req.params.hootId
        // call populate() to populate the author property
        const hoot = await Hoot.findById(req.params.hootId).populate('author');
        res.status(200).json(hoot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

router.put('/:hootId', verifyToken, async (req, res) => {

    try {
        // retrieve the hoot we want to update using findById()
        const hoot = await Hoot.findById(req.params.hootId);

        // check that user has permission to update the resource
        // by using an if condition, comparing the hoot.author to the _id (req.user._id)
        // (hoot.author contains the objectId of the user who created the hoot)
        if (!hoot.author.equals(req.user._id)) {
            // respond with 403 if it doesn't match
            return res.status(403).send('You are not allowed to update this.');
        }

        // if it does match, call findByIdAndUpdate() method
        // pass 3 args
        const updatedHoot = await Hoot.findByIdAndUpdate(
            // 1. the ObjectId (req.params.hootId) to locate the hoot
            req.params.hootId,
            // 2. the form data (req.body) to update the hoot doc
            req.body,
            // 3. { new: true } specifies that we want this method to return the updated doc
            { new: true }
        );

        // then, append the complete user object to the updatedHoot doc
        updatedHoot._doc.author = req.user;

        // then issue a json res with the updatedHoot object
        res.status(200).json(updatedHoot);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});











module.exports = router;