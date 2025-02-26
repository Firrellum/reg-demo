// This file contains the middleware functions for authentication.

// The isAuthenticated middleware checks if a user is logged in by checking if the user object exists in the session.
export function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.id) { // check if user is logged in
        return next(); // return next 
    }else{
        res.status(401).json({ error: "Unauthorized: Please log in" }); // user not logged in message
    }
    
}
