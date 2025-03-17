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
        const hoot = await Hoot.findById(req.params.hootId).populate(['author', 'comments.author']);
        res.status(200).json(hoot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

// PUT /:hootId
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

//DELETE /hoots/:hootId
router.delete('/:hootId', verifyToken, async (req, res) => {
// First, we’ll retrieve the hoot we want to delete from the database. We’ll do this using our Hoot model’s findById() method.
// With our retrieved hoot, we need check that this user has permission to delete the resource. We accomplish this using an if condition, comparing the hoot.author to _id of the user issuing the request (req.user._id)
// Remember, hoot.author contains the ObjectId of the user who created the hoot. If these values do not match, we respond with a 403 Forbidden status.
// If the user has permission to delete the resource, we call upon our Hoot model’s findByIdAndDelete() method.
// The findByIdAndDelete() accepts an ObjectId (req.params.hootId), used to locate the hoot we wish to remove from the database.
    try {
        const hoot = await Hoot.findById(req.params.hootId);

        if (!hoot.author.equals(req.user._id)) {
            return res.status(403).send('You are not allowed to delete this.');
        }

        const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
        res.status(200).json(deletedHoot);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

router.post("/:hootId/comments", verifyToken, async (req, res) => {
    // As we did when creating hoots, we’ll first append req.user._id to req.body.author. This updates the form data that will be used to create the resource, and ensures that the logged in user is marked as the author of a comment.
    // Next we’ll call upon the Hoot model’s findById() method. The retrieved hoot is the parent document we wish to add a comment to.
    // Because comments are embedded inside hoot’s, the commentSchema has not been compiled into a model. As a result, we cannot call upon the create() method to produce a new comment. Instead, we’ll use the Array.prototype.push() method, provide it with req.body, and add the new comment data to the comments array inside the hoot document.
    // To save the comment to our database, we call upon the save() method of the hoot document instance.
    // After saving the hoot document, we locate the newComment using its position at the end of the hoot.comments array, append the author property with a user object, and issue the newComment as a JSON response.
    try {
        req.body.author = req.user._id;
        const hoot = await Hoot.findById(req.params.hootId);
        hoot.comments.push(req.body);
        await hoot.save();
    
        // Find the newly created comment:
        const newComment = hoot.comments[hoot.comments.length - 1];
    
        newComment._doc.author = req.user;
    
        // Respond with the newComment:
        res.status(201).json(newComment);
      } catch (err) {
        res.status(500).json({ err: err.message });
      }



  });








module.exports = router;