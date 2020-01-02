/* GIT with net-ninja ---> https://www.youtube.com/watch?v=RIYrfkZjWmA&list=PL4cUxeGkcC9goXbgTDQ0n_4TBzOO0ocPR&index=7 --> express+react: https://www.youtube.com/watch?v=v0t42xBIYIs
init: inside dev-folder
status: overview for recent changes
diff: difference inside our changes
add: ready to commit. If we dont 'add' AND commit, it will not commit the most recent editing.
If we use 'git add .' it will add all changes weve made
restore: If you regret, you can go back to previous code
log: git log in order to get the full overview of the activities and activities-numbers. You can also do: git log --oneline (more simple overview)
checkout: when git-logging you can do 'git checkout 123456 -- specificFile.js' if you use '.' that means all
checkout: or you can do "git checkout id (123456)" to go back to a specific log
commit: commit -m '' to make a msg
push: put commit into github
*/

// DEPENDENCIES & INTEGRATIONS
const path = require('path'); //Path to view-folder
const express = require('express');
const multer = require('multer');
const session = require('express-session');
const app = express();
const mysql = require('mysql'); //DB
const helmet = require('helmet'); app.use(helmet()); // SECURITY ADD-ON
const cookieParser = require('cookie-parser'); // HANDLING COOKIES...
const fs = require('fs');
const port = 3010;

//----------------- CONTROLLERS --------------------------
const welcomeController = require('./controllers/welcome');


//------------------- DB CONNECTION -------------------
var connection = mysql.createConnection({
  //properties
  host:'localhost',
  user:'root',
  password:'',
  database: 'expressGuideDB'
});
connection.connect(function(error){
  if (error) {
    console.log('Not connected to the DB!');
  }else{
    console.log('Connected to DB!');
  }
}); // DB-conn message

app.use(express.urlencoded()); //ANY DATA THAT COMES IN (via our FORM) will be added to req.body via urlencoded...
// app.use('/public', express.static(path.join(__dirname, 'public'))); // INCLUDING STATIC FILES LIKE CSS, AJAX, IMAGES ETC...
app.use(express.static('./public'));
app.use(express.json());
app.use(cookieParser()); // able to handle COOKIES...
app.use(session({secret:'app_session'})); // session handling...

app.set('view engine', 'ejs'); // EJS as template...
app.set('views', path.join(__dirname, 'views')); // when res.render LOOK INTO THE VIEWS-folder


//-------------------- ROUTES ------------------------
app.use('/', require('./routes/landing'));  // url, where we get the route from
app.use('/users', require('./routes/users'));
app.use('/spaces', require('./routes/spaces'));
app.use('/dbView', require('./routes/dbView'));

//move this to another folder
app.use(function(req, res, next){

  if (req.query.file === 'uploaded') {
    res.locals.file_msg = 'File successfully uploaded!';
  }else if(req.query.file === 'notUploaded'){
    res.locals.file_msg = 'Not uploaded.. Please choose an image!';
  }else{
    res.locals.file_msg = '';
  }

  next();
})


//move this to users-folder.. remember try: /users/welcome
app.get('/welcome', function(req, res, next){
  welcomeController.goToWelcome(req, res);
});

//--------------------FILE UPLOAD----------------------------
//MULTER STORAGE
const storage = multer.diskStorage({
  destination: '/Users/furat/Desktop/webFiles/expressJS_guide/public/uploads/',
  filename: function(req, file, cb){
    console.log('File is uploading');
    // GIVE IMAGE ATTRIBUTES AND VAR-NAME....
    const imageName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    // Save the file in the disk
    cb(null, imageName);
    // SAVE AND CHANGE IMAGE IN DB
    const updateQuery = 'UPDATE apptable SET profileImg = "'+ imageName +'" WHERE ID=' + req.session.ID;
    console.log('this is the query for the update :', updateQuery);
    connection.query(updateQuery, function(err, rows){
      if (err) {
        throw err;
      }else {
        console.log('user updated with the image');
      }
    });

  }
});

//Check file type: Allow only images...
function checkFileType(file, cb){
  const filetypes = /jpeg|jpg|png|gif/; // only images
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); //checking the extension
  const mimetype = filetypes.test(file.mimetype); //media-type

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    console.log('Error: images only');
    cb('Error: images only!');
  }
}

// UPLOAD MULTER-VARIABLEKEY
const upload = multer({

  storage: storage,
  limits: {fileSize: 1000000}, //ERR if file is bigger than limits (1mb)
  fileFilter: function(req, file, cb){
    checkFileType(file, cb); //function-call
  }
}).single('skillVideo');


app.post('/welcomeFileUpload', function(req, res, next){

  upload(req, res, function(err){
    if(req.file === undefined) {
      res.redirect('/welcome?file=notUploaded');
    }else{
      console.log(req.file);
      req.session.p_img = req.file.filename; // can be possible because SESSION is EVERYWHERE...
      res.render('welcomeUpl', { // req.body.username wont work, we try to get some cookies, not data...
         email: req.session.email_login, //name: username, value: req.cookies.username
         fname: req.session.fname,
         art: req.session.art,
         fileSuccessStatus: 'File successfully uploaded!',
         file: `uploads/${req.file.filename}`

      });
    }

  })

})


//--------------------- system messages --------------------------------
// app.use('/', require('./routes/multerUpload'));
// app.use('/', require('./routes/dbConn'));
app.use('*', require('./routes/sysMsg'));

app.listen(port, function(){
  console.log('running on port ' + port);
});
