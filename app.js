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
const crypto = require('crypto');

//-------------------- ROUTES ------------------------
app.use('/', require('./routes/landing'));  // url, where we get the route from
// app.use('/users', require('./routes/users'));
app.use('/spaces', require('./routes/spaces'));
app.use('/dbView', require('./routes/dbView'));


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

// -------------------------CREATE ACCOUNT----------------------------
app.use(function(req, res, next){

  if (!req.query.emailStatus) {
    res.locals.mailMsg = '';
  }else if(req.query.emailStatus === 'emailTaken'){
    res.locals.mailMsg = 'This email is already taken!';
  }

  next(); // throw above to the next middleware

})

app.get('/users/createAccount', function(req, res, next){

  res.render('createAccount', {
    title: 'Performance App Create Account'
  })

})
app.post('/users/process_createAccount', function(req,res,next){

  // register form inputs
  const firstname = req.body.firstname_crAcc;
  const lastname = req.body.lastname_crAcc;
  const email_crAcc = req.body.email_crAcc;
  const grapplingStyle = req.body.grapplingStyle_crAcc;
  const password_crAcc = req.body.password_crAcc;

  // crypting the password............
  const hashedPassword = crypto.createHmac("sha256", password_crAcc).digest("hex");
  console.log('this is the hashed password', hashedPassword)

  // REGISTER -----> IF EMAIL IS NOT TAKEN: 'howManyMails' declared in this SQL.....
  connection.query("SELECT COUNT(*) AS howManyMails FROM apptable WHERE email = ?", email_crAcc, function(err, rows){
    if (err) {
      console.log(err);
    }else {
      if (rows[0].howManyMails > 0) {  // if the first email has more than one of its own......
        console.log('This email already exists!');
        res.redirect('/users/createAccount?emailStatus=emailTaken');
      }else {
        var insertDataSQL = 'INSERT INTO apptable (Firstname, Lastname, email, Grappling, Password) VALUES("'+firstname+'", "'+lastname+'", "'+email_crAcc+'", "'+grapplingStyle+'", "'+hashedPassword+'")';

        connection.query(insertDataSQL, function(err, rows){
          if (err) {
            throw err;
          }else {
            console.log('1 record inserted!');
            res.redirect('/users/login'); // redirect, and give information to the new-created user...
          }
        })
      }
    }
  })

})


// -----------------------------LOGIN----------------------------------
app.use(function(req, res, next){ // grabs msg from URL...
  if (req.query.msg === 'fail') {
    res.locals.info_msg = 'Sorry, this username and password combination does not exist';
  }else if(req.query.msg === 'noLogin'){
    res.locals.info_msg = 'Sorry, You tried to access the welcome page without logging in. Please login first.';
  } else{
    res.locals.info_msg = '';
  }

  next(); //send to next middleware...

})

app.get('/users/login', function(req, res, next){
  // console.log(req.query); //req.query is the place where you store data that are insecure. comes after the '?' in url...
  res.render('login', {
    title: 'Performance App Login'
  })
})


//IMPORTANT: POST BECAUSE IT RECIEVES SOMETHING DATA through form... FROM HERE WE PROVIDE DATA TO THE APP...
app.post('/users/process_login', function(req, res, next){

  const password_login = req.body.password_login; // gets NAME from form
  const hashedPassordLogin = crypto.createHmac("sha256", password_login).digest("hex");
  const email_login = req.body.email_login;

  connection.query( 'SELECT * FROM apptable WHERE email = ?', email_login, function(err, rows, fields){

    if (rows.length > 0) {
            if(rows[0].Password == hashedPassordLogin) {
              // res.cookie('email_login',email_login) //ARGS: NAME OF COOKIE, VALUE TO SET IT TO... saved in req.cookies-object
              // res.cookie('fname', rows[0].Firstname)
              // res.cookie('art', rows[0].Grappling)

              req.session.email_login = email_login;
              req.session.ID = rows[0].ID;
              req.session.fname = rows[0].Firstname;
              req.session.art = rows[0].Grappling;
              req.session.p_img = rows[0].profileImg; // for the profile image...
              res.redirect('/welcome');
            }else {
              res.redirect('/users/login?msg=fail');
            }
    }else {
      res.redirect('/users/login?msg=fail&login=false');
    }

  })
  //res.json(req.body) //req.body is made by urlencoded: parses http msg for sent data. data from form comes in here...
})

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

//IMPORTANT: A GET AND NOT POST REQUEST BECAUSE WE ARE NOT RECIEVING DATA THROUGH FORM...
app.get('/welcome', function(req, res, next){

  if (req.session.email_login) { // req.cookies.email_login / req.session.email_login
    console.log('---------------------->', `uploads/${req.session.p_img}`)
    res.render('welcome', { // req.body.username wont work, we try to get some cookies, not data...
       email: req.session.email_login, //name: username, value: req.cookies.username
       fname: req.session.fname,
       art: req.session.art,
       p_img: req.session.p_img, // profile image to be sent into the view...
       file: `uploads/${req.session.p_img}`
    });
  }else{
    res.redirect('/users/login?msg=noLogin');
  }

})

app.get('/users/logout', function(req, res, next){
  // res.clearCookie('email_login');
  req.session.destroy();
  res.redirect('/users/login'); // redirect and give info to the user that he/she successfully logged out...
})

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
  // app.get('*', function(req, res) {
    //   res.render('sysMsgs/urlERR', {
      //     titlename: 'Page not found'
      //   })
      // });
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
