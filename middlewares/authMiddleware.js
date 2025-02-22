export function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next(); // User is logged in
    }
    res.status(401).json({ error: "Unauthorized: Please log in" });
}
