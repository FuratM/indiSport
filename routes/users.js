const express = require('express');
const router = express.Router(); // ROUTER OBJECT...
const crypto = require('crypto');
const mysql = require('mysql'); //DB

var connection = mysql.createConnection({
  //properties
  host:'localhost',
  user:'root',
  password:'',
  database: 'expressGuideDB'
});


// -------------------------CREATE ACCOUNT----------------------------
router.use(function(req, res, next){

  if (!req.query.emailStatus) {
    res.locals.mailMsg = '';
  }else if(req.query.emailStatus === 'emailTaken'){
    res.locals.mailMsg = 'This email is already taken!';
  }

  next(); // throw above to the next middleware

})

router.get('/createAccount', function(req, res, next){

  res.render('createAccount', {
    title: 'Performance App Create Account'
  })

})
router.post('/process_createAccount', function(req,res,next){

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
router.use(function(req, res, next){ // grabs msg from URL...
  if (req.query.msg === 'fail') {
    res.locals.info_msg = 'Sorry, this username and password combination does not exist';
  }else if(req.query.msg === 'noLogin'){
    res.locals.info_msg = 'Sorry, You tried to access the welcome page without logging in. Please login first.';
  } else{
    res.locals.info_msg = '';
  }

  next(); //send to next middleware...

})

router.get('/login', function(req, res, next){
  // console.log(req.query); //req.query is the place where you store data that are insecure. comes after the '?' in url...
  res.render('login', {
    title: 'Performance App Login'
  })
})


//IMPORTANT: POST BECAUSE IT RECIEVES SOMETHING DATA through form... FROM HERE WE PROVIDE DATA TO THE APP...
router.post('/process_login', function(req, res, next){

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


router.use(function(req, res, next){

  if (req.query.file === 'uploaded') {
    res.locals.file_msg = 'File successfully uploaded!';
  }else if(req.query.file === 'notUploaded'){
    res.locals.file_msg = 'Not uploaded.. Please choose an image!';
  }else{
    res.locals.file_msg = '';
  }

  next();
})


router.get('/logout', function(req, res, next){
  // res.clearCookie('email_login');
  req.session.destroy();
  res.redirect('/users/login'); // redirect and give info to the user that he/she successfully logged out...
})





module.exports = router
