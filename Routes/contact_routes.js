const express = require('express');
const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact
} = require('../Controller/contact_controller');
const validateContact = require('../Middleware/contact_validators');
const verifyToken = require('../Configuration/auth'); // ✅ your auth middleware

const router = express.Router();

// 🔐 Protect all routes
router.get('/all', verifyToken, getAllContacts);
router.get('/:contactId', verifyToken, getContactById);
router.post('/', verifyToken, validateContact, createContact);
router.put('/editcontact/:_id', verifyToken, updateContact);

module.exports = router;