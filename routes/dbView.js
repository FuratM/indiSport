const express = require('express');
const router = express.Router(); // ROUTER OBJECT...
const mysql = require('mysql'); //DB

router.get('/db-data-overview', function(req, res, next){
  //DB CONNECTION
  var connection = mysql.createConnection({
    //properties
    host:'localhost',
    user:'root',
    password:'',
    database: 'expressGuideDB'
  });

  var SQL_app_table = 'SELECT * FROM apptable'; // grab table from DB...

  connection.query( SQL_app_table, function(err, rows, fields){

    if (err) {
        res.render('errorPage');
    }else{
      res.json(rows);
    }

  })
});

module.exports = router
