express = require('express');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended : false});
var mysql = require('mysql');

app = express();

var connection = mysql.createConnection ({
  host : 'localhost',
  user : 'root',
  password : 'root',
  database : 'todo'
});

app.use(express.static('public'));
app.use(session ({secret : 'blalala'}));

app.use(function(req, res, next) {
  if (typeof(req.session.todolist) == 'undefined') {
    req.session.todolist = [];
  }
  next();
});

app.get('/', function(req, res) {
  connection.query('SELECT id, message FROM todolist', function(err, rows) {
    //console.log(rows);
    req.session.todolist = rows;
    res.render('todo.ejs', {todolist : req.session.todolist});
  });
});

app.post('/', urlEncodedParser, function(req, res) {
  if (req.body.newtodo != '') {
    connection.query('INSERT INTO todolist SET ?', {message : req.body.newtodo},
      function (error, results, fields) {
        if (error) throw error;
        req.session.todolist.push({message : req.body.newtodo, id: results.insertId }); // AJAX
        res.redirect('/');
      });
    }
});

app.get('/supprimer/:id', function(req, res) {
  connection.query('DELETE FROM todolist WHERE id = ?', [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      req.session.todolist.splice(req.params.id, 1); // AJAX
      res.redirect('/');
    });
});

app.get('/modifier/:id', function(req, res) {
  connection.query('SELECT id, message FROM todolist WHERE id = ?', [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      console.log(results);
      res.render('modify.ejs', {results : results});
    });
});

app.post('/realmod/:id', urlEncodedParser, function(req, res) {
  //console.log(req.body.modtodo);
  if (req.body.modtodo != '') {
    connection.query('UPDATE todolist SET message = ? WHERE id= ?', [req.body.modtodo, req.params.id],
      function (error, results, fields) {
        if (error) throw error;
        res.redirect('/');
      });
  }
});

app.listen(8080);
