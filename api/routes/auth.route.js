import express, { Router } from 'express';
import { signup,signin, google,signOut } from '../controllers/auth.controller.js';


const router = express.Router();

router.post("/sign-up",signup)
router.post("/sign-in",signin)
router.post("/google",google)
router.get("/signout",signOut)

export default router;