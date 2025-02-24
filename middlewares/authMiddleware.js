export function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.id) {
        return next(); // User is logged in
    }
    res.status(401).json({ error: "Unauthorized: Please log in" });
}
