const express = require('express');//import express.js library
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");//authMiddleware check toekn is valed (user authentucated)
const {
  createSession,
  getSessionById,
  getMySession, 
  deleteSession
} = require('../controllers/sessionController');




router.post('/create', protect, createSession);//create new session protect ensure user has logged in, controller 
router.get('/my-sessions', protect, getMySession); 
router.get('/:id', protect, getSessionById);
router.delete('/:id', protect, deleteSession);


module.exports = router;
