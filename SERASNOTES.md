Within our Express API, we’ll implement full CRUD functionality on a blog post resource hoots. Additionally, we will implement create functionality on an embedded resource called comments.

Thanks to this template, our Express application will already be able to sign up and sign in users. The template also includes a verifyToken middleware function. The verifyToken middleware ensures that any route following it in the middleware pipeline will require authentication before proceeding.

To demonstrate JWT Authentication, our Express application will use verifyToken to protect all routes related to the hoot resource. This means users will be required to sign in before getting access to any hoot data.

## User Stories
Our Express API should include functionality for the following user stories:

As a guest, I should be able to create an account.
As a user with an account, I should be able to log in to my account.
As a user, I should be able to create a hoot post.
As a user, I should be able to read a list of all hoots.
As a user, I should be able to view information about a single hoot post along with its associated comments.
As a user, I should be able to add a comment to a specific hoot.
As the author of a hoot, I should be able to update that hoot.
As the author of a hoot, I should be able to delete that hoot.
User stories related to signing up and signing in have been completed for us in the Express API JWT Auth Template, but we will be implementing the remaining features from scratch.

