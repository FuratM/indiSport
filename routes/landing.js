//-----------------------LANDING PAGE----------------------------------

const express = require('express');
var router = express.Router(); // ROUTER OBJECT...
const mysql = require('mysql'); //DB

var connection = mysql.createConnection({
  //properties
  host:'localhost',
  user:'root',
  password:'',
  database: 'expressGuideDB'
});

router.get('/', function(req, res, next){

  connection.query('SELECT * FROM apptable ORDER BY ID', function(err, rows, fields){

    if (err) {
        res.redirect('systemError');
    }else{
        res.render('index', {
        title: 'Performance App',
        members: rows
      });
    }

  })

});

// REDIRECT! MORE PROFESSIONAL THAN THIS!!!
router.get('/sorts/:sortBy', function(req,res,next){
  var sortQuery = 'SELECT * FROM apptable ORDER BY ID';

  if (req.params.sortBy === 'sortAlpha') {
       sortQuery = 'SELECT * FROM apptable ORDER BY Firstname'
  }else if(req.params.sortBy === 'sortByStyle'){
    sortQuery = 'SELECT * FROM apptable ORDER BY Grappling'
  }

  connection.query(sortQuery, function(err, rows, fields){

    if (err) {
        res.redirect('systemError');
    }else{
        res.render('index', {
        title: 'Performance App',
        members: rows
      });
    }

  })

})

module.exports = router
