var express = require('express');
var path = require('path');
var config = require('../db/dbConfig.js');
var connection= config.connection;

var bcrypt = require('bcrypt');
const saltRounds = 10;

var router = express.Router();

var ssn;

router.get('/', function (req, res, next) {
	return res.render('landing.ejs');
});

router.post('/', function (req, res, next)
{
	console.log('home');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		if(data){

			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({"Success":"Success!"});

			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			console.log("yikes");
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
	console.log("no");
});

router.post('/verify', function(req, res, next) {

});

router.get('/student', function(req, res, next) {
	return res.render('student.ejs');
});

router.get('/teacher_login', function(req, res, next) {
	return res.render('teacher_login.ejs');
});

router.post('/teacher_login', function(req, res, next) {
	console.log("nope");
	if(req.body){
		console.log(req.body.id);
			connection.query("SELECT * FROM teachers WHERE assigned_id = '"+req.body.id+"'", function (err, result, fields) {
				//if (err) throw err;
				if(err){
					res.send({"Success":"Wrong Id!"});
					throw err;
				}else{
					req.session._id = req.body.id;
					req.session.teacher_id = result[0]._id;
					res.send({"Success":"Success!"});
				}
				console.log(result);
			});
	}
});

router.get('/teacher', function(req, res) {
	if(req.session._id){
		//connection.connect(function(err) {
			//if (err) throw err;
			connection.query("SELECT * FROM teachers WHERE assigned_id = '"+req.session._id+"'", function (err, result, fields) {
				//if (err) throw err;
				if(err){
					res.redirect('/');
					throw err;
				}else{
					function isEmpty(scoreData) {
	  				for(var prop in scoreData) {
	    				if(scoreData.hasOwnProperty(prop)) {
	      				return false;
	    				}
	  				}
						return true;
					}
					if(isEmpty(result)){
						res.redirect('/');
					}else{
						connection.query("SELECT * FROM classes WHERE instructor_id = '"+req.session.teacher_id+"'", function (err, response, fields) {
							//if (err) throw err;
							if(err){
								throw err;
							}else{
								var fill = "";

								if(isEmpty(response)){
									console.log("response is null");
									fill = "<button class='btn btn-dark'>Add + </button>";
									res.render('teacher.ejs', {
										info : fill // get the user out of session and pass to template
									});
								}else{
									console.log("not null" + response[0].class_name);
									fill = "<% response.forEach(function(data) { %><span class='col-sm-2'><%= data.response.class_name %></span><% }); %>";

									res.render('teacher.ejs', {
										info : fill, // get the user out of session and pass to template
										blob : response
									});
							}
							}
						});
					}
			}
			});
		//});
	}else{
		res.redirect('/');
	}
});

router.post('/teacher', function (req, res){
	if(req.body){
		console.log(req.body.id);
			connection.query("UPDATE classes SET class_name= '"+req.body.className+"', instructor_name= '"+req.body.instrName+"', subject= '"+req.body.subject+"', year= '"+req.body.year+"', description= '"+req.body.descr+"', links= '"+req.body.addmore+"' WHERE _id= '"+req.body.id+"'", function (err, result, fields) {
				//if (err) throw err;
				if(err){
					res.send({"Success":"Wrong password!"});
					throw err;
				}else{
					console.log(req.body.instrName);
					res.send({"Success":"Success!"});
				}
				console.log(result);
			});
	}
});
router.get('/edit', function (req, res) {
	res.render('edit_info.ejs');
});
// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/teacher_login');
}


router.get('/class_search', function(req, res, next) {
	return res.render('class_search.ejs');
});

router.post('/class_search', function(req, res, next) {
	console.log("nope");
	if(req.body){
		console.log(req.body.search_code);
			connection.query("SELECT * FROM classes WHERE search_code= '"+req.body.search_code+"'", function (err, result, fields) {
				//if (err) throw err;
				if(err){
					res.send({"Success":"Wrong Id!"});
					throw err;
				}else{
					req.session.search_code = req.body.search_code;
					res.send({"Success":"Success!"});
				}
				console.log(result);
			});
	}
});

router.get('/welcome_', function(req, res) {
	console.log("/welcome");
	if(req.session.search_code){
		//connection.connect(function(err) {
			//if (err) throw err;
					function isEmpty(scoreData) {
	  				for(var prop in scoreData) {
	    				if(scoreData.hasOwnProperty(prop)) {
	      				return false;
	    				}
	  				}
						return true;
					}
						connection.query("SELECT * FROM classes WHERE search_code= '"+req.session.search_code+"'", function (err, result, fields) {
							//if (err) throw err;
							if(err){
								throw err;
							}else{
								var fill = "";

								if(isEmpty(result)){
									console.log("response is null");
									fill = "<button class='btn btn-dark'>Add + </button>";
									res.render('welcome.ejs', {
										info : fill // get the user out of session and pass to template
									});
								}else{
									console.log("not null" + result[0].class_name);
									fill = "<% response.forEach(function(data) { %><span class='col-sm-2'><%= data.response.class_name %></span><% }); %>";

									res.render('welcome.ejs', {
										info : fill, // get the user out of session and pass to template
										blob : result
									});
							}
					}
			});
	}else{
		res.redirect('/');
	}
});

router.get('/class', function(req, res, next) {
	console.log("/class");
	if(req.session.search_code){
		//connection.connect(function(err) {
			//if (err) throw err;
					function isEmpty(scoreData) {
						for(var prop in scoreData) {
							if(scoreData.hasOwnProperty(prop)) {
								return false;
							}
						}
						return true;
					}
						connection.query("SELECT * FROM classes WHERE search_code= '"+req.session.search_code+"'", function (err, result, fields) {
							//if (err) throw err;
							if(err){
								throw err;
							}else{
								var fill = "";

								if(isEmpty(result)){
									console.log("response is null");
									fill = "<button class='btn btn-dark'>Add + </button>";
									res.render('welcome.ejs', {
										info : fill // get the user out of session and pass to template
									});
								}else{
									console.log("not null" + result[0].class_name);
									fill = "<% response.forEach(function(data) { %><span class='col-sm-2'><%= data.response.class_name %></span><% }); %>";

									var rel_links = result[0].links.split(",");

									res.render('student.ejs', {
										info : fill, // get the user out of session and pass to template
										blob : result,
										links: rel_links
									});
							}
					}
			});
	}else{
		res.redirect('/');
	}
});



router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});


	//connection.query("SELECT * FROM classes WHERE search_code= '"+req.session.search_code+"'", function (err, result, fields)
	//connection.query("SELECT * FROM classes WHERE search_code= '"+req.body.search_code+"'", function (err, result, fields) {
		//if (err) throw err;

module.exports = router;
