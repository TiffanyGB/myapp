const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const imagesController = require('../controllers/images/imageController');
const multerConfig = require('../middleware/multer-config');

const uploadMiddleware = multerConfig.configurerMiddleware();

router.all('/upload', uploadMiddleware, imagesController.upload);

router.all('/image/:id', indexController.verifyToken);

module.exports = router;
