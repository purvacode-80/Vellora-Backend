const express = require('express');
const { getAllContacts, getContactById, createContact } = require('../Controller/contact_controller');
const validateContact = require('../Middleware/contact_validators');
const router = express.Router();

router.get('/all', getAllContacts);
router.get('/:contactId', getContactById);
router.post('/', validateContact, createContact);

module.exports = router;
