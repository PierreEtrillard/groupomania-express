const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
};

const storage = multer.diskStorage({
  //1: Demande à multer d'enregistrer les fichiers dans le dossier "images"
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  //2: Avec le nom créé via la fonction suivante:
  filename: (req, file, callback) => {
    //convertis les espaces en _ dans le nom de fichier original 
    const name = file.originalname.split(' ').join('_');
    //récupère le type MIME du fichier
    const extension = MIME_TYPES[file.mimetype];
    //construit le nouveau nom : "sans_espaceDate.type"
    callback(null, name + Date.now() + '.' + extension);
  }
});
// Methode single pour ne traiter qu'un fichier de type 'image' à la fois
module.exports = multer({storage: storage}).single('image');