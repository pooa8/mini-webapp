var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');

var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'test',
});

connection.connect(function(err) {
  if (err) {
    console.error('mysql connection error');
    console.error(err);
    throw err;
  }
});

/* GET users listing. */
router.get('/', function(req, res) {
  connection.query('SELECT * FROM users', function(err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});
router.get('signUp', function(req, res) {
  const user = {
    'user_id': req.body.user.user_id,
    'name': req.body.user.name,
    'password': req.body.user.password,
    'email': req.body.user.email
  };
  connection.query('SELECT user_id FROM users WHERE user_id = ' + user.user_id + "", function(err, row) {
    if (row[0] == undefined) {
      const salt = bcrypt.genSaltSync();
      const encryptedPassword = bcrypt.hashSync(user.password, salt);
      connection.query('INSERT INTO users (user_id, name, password, email) VALUES (' + user.user_id + "," + user.name + "," + encryptedPassword + "," + user.email + ")", user, function(err, row2) {
        if (err) throw err;
      });
      res.json({
        success: true,
        message: 'Sign Up Success.'
      })
    }
    else {
      res.json({
        success: false,
        message: 'Sign Up Failed Please use another ID.'
      })
    }
  });
});

router.post('/login', function(req, res) {
  const user = {
    'user_id': req.body.user.user_id,
    'password': req.body.user.password
  };
  connection.query('SELECT user_id, password FROM users WHERE user_id = '+ user.user_id + "", function(err, row) {
    if (err) {
      res.json({
        success: false,
        message: 'Login Failed Please Check Your Id or Password !'
      })
    }
    if (row[0] !== undefined && row[0].user_id === user.user_id) {
      bcrypt.compare(user.password, row[0].password, function(err, res2) {
        if (res2) {
          res.json({
            success: true,
            message: 'Login Success !'
          })
        }
        else {
          res.json({
            message: 'Login Failed Please Check Your Id or Password !'
          })
        }
      })
    }
  })
});

module.exports = router;
