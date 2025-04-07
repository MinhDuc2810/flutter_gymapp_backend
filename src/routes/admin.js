const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const upload = require('../multer');

router.delete('/deletePT/:id', adminController.deletePt);
router.get('/getAllPT', adminController.getAllPt);
router.post('/addPt', upload.single('avatar'), adminController.addPT);
router.get('/getAllUsers', adminController.getAllUsers);
router.delete('/deletePackage/:id', adminController.deletePackage);
router.put('/modifyPackage/:id', adminController.modifyPackage);
router.post('/addPackage', adminController.addPackage);
router.get('/getPackages', adminController.getPackages);

module.exports = router;