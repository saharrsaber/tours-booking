const express = require('express');
const viewController = require('./../controllers/viewController');
const router = express.Router();

// RENDERING PUG TEMPLATES
router.get('/', viewController.getOverview);
router.get('/tours/:slug', viewController.getTour);

module.exports = router;
