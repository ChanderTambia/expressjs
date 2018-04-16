const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/expressjs')
let db = mongoose.connection;

db.once('open', function () {
	console.log('Connected to MongoDB');
});

db.on('error', function (err) {
	console.log(err);
});
//----Init App
const app = express();

//----Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: 'expressjs session',
	resave: false,
	saveUninitialized: true,
	cookie: { secure:true }
}));

app.use(require('connect-flash')());
app.use(function(req, res, next){
	res.locals.messages = require('express-messages')(req, res);
	next();
});

app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;

		while(namespace.length){
			formParam = '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));

let Article = require('./models/article');

//----Home Route
app.get('/', function (req, res) {
	Article.find({}, function (err, articles) {
		if (err) {
			console.log(err);
		} else {
			res.render('index_view', {
				page_title: "Home Page",
				article: articles
			});
		}
	});
});

app.get('/articles/:id', function (req, res) {
	Article.findById(req.params.id, function (err, article) {
		if (err) {
			console.log(err);
			return;
		} else {
			res.render('./articles/article_view', {
				article: article
			});
		}
	});
});

app.get('/article/add', function (req, res) {
	res.render('./articles/add_article_view', {
		page_title: "About Page"
	})
});

app.get('/article/edit/:id', function (req, res) {
	Article.findById(req.params.id, function (err, article) {
		if (err) {
			console.log(err);
			return;
		} else {
			res.render('./articles/edit_article_view', {
				article: article
			});
		}
	});
});

app.post('/article/edit/:id', function (req, res) {
	let article = {};
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	let query = {_id:req.params.id};

	Article.update(query, article, function(err){
		if(err){
			console.log(err);
			return;
		}else{
			res.redirect('/');
		}
	});
});

app.delete('/article/:id', function(req, res){
	let query = {_id: req.params.id};

	Article.remove(query, function(err){
		if(err){
			console.log(err);
		}else{
			res.send("Success");
		}
	});
});

app.post('/article/add', function (req, res) {
	let article = new Article();
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	article.save(function (err) {
		if (err) {
			console.log(err);
			return;
		} else {
			res.redirect('/');
		}
	});
});

//----Start Server
app.listen(3000, () => {
	console.log("Server Starting on port 3000");
});