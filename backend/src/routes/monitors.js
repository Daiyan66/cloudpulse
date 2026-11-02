'use strict';

const { Router } = require('express');
const {
  getMonitors, createMonitor, getMonitor,
  updateMonitor, deleteMonitor, getHistory, getStats,
} = require('../controllers/monitorController');
const { authenticate } = require('../middleware/authenticate');
const { createMonitorRules, updateMonitorRules, validate } = require('../validators/monitorValidators');

const router = Router();

// All monitor routes require a valid JWT
router.use(authenticate);

router.route('/')
  .get(getMonitors)
  .post(createMonitorRules, validate, createMonitor);

router.route('/:id')
  .get(getMonitor)
  .put(updateMonitorRules, validate, updateMonitor)
  .delete(deleteMonitor);

router.get('/:id/history', getHistory);
router.get('/:id/stats',   getStats);

module.exports = router;
