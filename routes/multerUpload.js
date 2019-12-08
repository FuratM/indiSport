// const express = require('express');
// const router = express.Router(); // ROUTER OBJECT...
//
// const storage = multer.diskStorage({
//   destination: '/Users/furat/Desktop/webFiles/expressJS_guide/public/uploads/',
//   filename: function(req, file, cb){
//     console.log('File is uploading');
//     // GIVE IMAGE ATTRIBUTES AND VAR-NAME....
//     const imageName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
//     // Save the file in the disk
//     cb(null, imageName);
//     // SAVE AND CHANGE IMAGE IN DB
//     const updateQuery = 'UPDATE apptable SET profileImg = "'+ imageName +'" WHERE ID=' + req.session.ID;
//     console.log('this is the query for the update :', updateQuery);
//     connection.query(updateQuery, function(err, rows){
//       if (err) {
//         throw err;
//       }else {
//         console.log('user updated with the image');
//       }
//     });
//
//   }
// });
//
// //Check file type: Allow only images...
// function checkFileType(file, cb){
//   const filetypes = /jpeg|jpg|png|gif/; // only images
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); //checking the extension
//   const mimetype = filetypes.test(file.mimetype); //media-type
//
//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     console.log('Error: images only');
//     cb('Error: images only!');
//   }
// }
//
// // UPLOAD MULTER-VARIABLEKEY
// const upload = multer({
//   // app.get('*', function(req, res) {
//     //   res.render('sysMsgs/urlERR', {
//       //     titlename: 'Page not found'
//       //   })
//       // });
//   storage: storage,
//   limits: {fileSize: 1000000}, //ERR if file is bigger than limits (1mb)
//   fileFilter: function(req, file, cb){
//     checkFileType(file, cb); //function-call
//   }
// }).single('skillVideo');
//
//
//
//
// module.exports = router
