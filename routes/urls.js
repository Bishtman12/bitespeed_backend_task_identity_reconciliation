const express = require('express');
const HealthController = require('../controller/health.controller');
const ContactController = require('../controller/contact.controller');

const router = express.Router();

// register controllers
const healthController = new HealthController();
healthController.register(router);

const contactController = new ContactController();
contactController.register(router);


module.exports = router;
