// ============================================================
// Middleware d'Upload de Fichiers (Multer)
// GESTION ALFA CAR
// ============================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================================
// Répertoire de stockage
// ============================================================
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================================
// Configuration du stockage sur disque
// ============================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique : timestamp-random-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .substring(0, 50);
        cb(null, `${uniqueSuffix}-${baseName}${ext}`);
    }
});

// ============================================================
// Filtre de fichiers : images uniquement
// ============================================================
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mimeType)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Seules les images (JPG, JPEG, PNG, GIF, WEBP) sont acceptées.'), false);
    }
};

// ============================================================
// Configuration Multer
// ============================================================
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max
    }
});

// ============================================================
// Middleware pour upload d'un seul fichier (champ 'image')
// ============================================================
const uploadSingle = (req, res, next) => {
    const singleUpload = upload.single('image');

    singleUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                req.flash('error', 'Le fichier est trop volumineux. La taille maximale est de 5 Mo.');
            } else {
                req.flash('error', `Erreur d'upload : ${err.message}`);
            }
            return res.redirect('back');
        } else if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next();
    });
};

// ============================================================
// Middleware pour upload de plusieurs fichiers (champ 'images', max 5)
// ============================================================
const uploadMultiple = (req, res, next) => {
    const multipleUpload = upload.array('images', 5);

    multipleUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                req.flash('error', 'Un ou plusieurs fichiers sont trop volumineux. La taille maximale est de 5 Mo par fichier.');
            } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                req.flash('error', 'Nombre maximum de fichiers dépassé. Vous pouvez uploader au maximum 5 images.');
            } else {
                req.flash('error', `Erreur d'upload : ${err.message}`);
            }
            return res.redirect('back');
        } else if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next();
    });
};

module.exports = {
    uploadSingle,
    uploadMultiple
};
