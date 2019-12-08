const express = require('express');
const router = express.Router(); // ROUTER OBJECT...

router.get('/systemError', function(req, res, next){
  res.render('sysMsgs/errorPage', {
    titlename: 'System currently down'
  })
})

// ERR HANDLING: If trying to find a route not defined redirect to err-msg...
router.get('*', function(req, res, next) {
  res.render('sysMsgs/urlERR', {
    titlename: 'Page not found'
  })
});


module.exports = router
