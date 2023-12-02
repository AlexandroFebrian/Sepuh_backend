const multer = require('multer');

const allowedExt = [
    'image/jpg', 
    'image/jpeg', 
    'image/png',
    'application/zip'
];

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public');
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = uniqueSuffix + '.png';

        if (req.body) {
            if (Array.isArray(req.body.image)) {
                req.body.image.push(fileName);
                cb(null, fileName);
            } else if (file.fieldname == 'image[]') {
                req.body.image = [fileName];
                cb(null, fileName);
            } else if (file.fieldname == 'header_picture') {
                req.body.header_picture = fileName;
                cb(null, fileName);
            } else if (file.fieldname == 'profile_picture') {
                req.body.profile_picture = fileName;
                cb(null, fileName);
            } else if (file.fieldname == 'file') {
                req.body.file = fileName.replace('.png', '.zip');
                cb(null, fileName.replace('.png', '.zip'));
            }
        }
    }
});

const fileFilter = (req, file, cb) => {
    if (allowedExt.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const MulterUpload = multer({
    storage: fileStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50000000
    }
});

module.exports = MulterUpload;