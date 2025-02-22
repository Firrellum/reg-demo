import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", isAuthenticated, (req, res) => {
    res.json({ user: req.session.user });
});

export default router; 