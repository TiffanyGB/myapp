const multer = require('multer');

function generateRandomLettersNumber(length) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomLetter = characters.charAt(randomIndex);
    result += randomLetter;
  }

  return result;
}

const configurerMiddleware = () => {
  const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
  };
  const storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, path.join(__dirname, 'images'));

    },

    filename: function(req, file, callback) {
      /**Créer un nouveau nom */
      const name = file.originalname.split(' ').join('_');
      const extension = MIME_TYPES[file.mimetype];
      callback(null, name + generateRandomLettersNumber(30) + '.' + extension);
      console.log("nom", name);
    }
  });


  return multer({ storage: storage }).single('file');
};

module.exports = { configurerMiddleware };
