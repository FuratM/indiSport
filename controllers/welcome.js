// function goToWelcome(req, res) {  //IMPORTANT: A GET AND NOT POST REQUEST BECAUSE WE ARE NOT RECIEVING DATA THROUGH FORM...
//
//   if (req.session.email_login) { // req.cookies.email_login / req.session.email_login
//     console.log('---------------------->', `uploads/${req.session.p_img}`)
//     res.render('welcome', { // req.body.username wont work, we try to get some cookies, not data...
//        email: req.session.email_login, //name: username, value: req.cookies.username
//        fname: req.session.fname,
//        art: req.session.art,
//        p_img: req.session.p_img, // profile image to be sent into the view...
//        file: `uploads/${req.session.p_img}`
//     });
//   }else{
//     res.redirect('/users/login?msg=noLogin');
//   }
// }
//
// module.exports = {
//   goToWelcome: goToWelcome
// }
