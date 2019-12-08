const express = require('express');
const router = express.Router(); // ROUTER OBJECT...

// CATCH THE PARAM IN WILDCARD : URL... forced to use next()
router.param('spaceId', function(req, res, next, spaceId){
  if (spaceId === 'bazoz') {
    console.log(spaceId + ' is here');
  }else {
      console.log('Wee need bazoz');
  }
  next(); // MIX THIS MIDDLEWARE WITH THE NEXT ONE...
})
//wildcard-route : MAKES ROUTES DYNAMIC...
router.get('/:spaceId', function(req, res, next){
  res.send(`<h1>Space id is --> ${req.params.spaceId}</h1>`)
})

module.exports = router
