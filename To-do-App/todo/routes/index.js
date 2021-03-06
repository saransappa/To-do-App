var express = require('express');
var router = express.Router();
const request = require('request');
const MongoClient = require('mongodb').MongoClient
/*

 ENTER YOUR MONGO DB ATLAS URI BELOW


*/
const uri = "";         

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(__dirname + "/" + "index.html");
});

/* GET Add task page. */
router.get('/add_task',function(req,res,next){
  res.sendFile(__dirname + "/" + "add_task.html");
});

/* GET About page */
router.get('/about',function(req,res,next){
	res.sendFile(__dirname+"/" + "about.html");
});

/* GET display tasks*/
router.get('/display_tasks',function(req,res,next){
  var html = "<!DOCTYPE html><html><head><title>Tasks</title></head><body><center><h1>Tasks</h1>";
  var json_file;
	request.get({
		  headers: {'content-type' : 'application/x-www-form-urlencoded'},
		  url:     'http://localhost:3000/get_tasks',
		}, function(error, response, body){
			if(!error){
		  		//console.log(body);
				json_file = JSON.parse(body);
				console.log(json_file);
		  	var s = "<p value=";
				var t = "</p>"

		  		for(var i=0;i<json_file.length;i++){

					var k = s+ JSON.stringify(json_file[i].task) + ">"+ json_file[i].task+t;
					html+=k;

		  		}
		  		html+= "<form action = \"http://localhost:3000/\" method = \"GET\"><input type = \"submit\" value = \"Back\"></form></center></body></html>";
		  		res.send(html);
			}
			else{
				console.log(error);
			}
	});
});

/* GET delete task page */
router.get('/delete_task',function(req,res,next){
  var html = "<!DOCTYPE html><html><head><title>Add Task</title></head><body><center><h1>Delete Task</h1><form action = \"http://localhost:3000/delete_task_details\" method = \"POST\">Select task:<select name=\"task\"> <option value='default'></option>";
  var json_file;
	request.get({
		  headers: {'content-type' : 'application/x-www-form-urlencoded'},
		  url:     'http://localhost:3000/get_tasks',
		}, function(error, response, body){
			if(!error){
		  		//console.log(body);
				json_file = JSON.parse(body);
				console.log(json_file);
		  		var s = "<option value=";
				var t = "</option>"

		  		for(var i=0;i<json_file.length;i++){

					var k = s+ JSON.stringify(json_file[i].task) + ">"+ json_file[i].task+t;
					html+=k;

		  		}
		  		html+= "</select><br/><br/><input type = \"submit\" value = \"Delete\"></form></center></body></html>";
		  		res.send(html);
			}
			else{
				console.log(error);
			}
	});
});

/* POST task details */
router.post('/add_task_details',function(req,res,next){
  MongoClient.connect(uri, (err, client) => {
	  if (err) return console.error(err)
  	  console.log('Connected to Tickets Database');
  	  const db = client.db('todo');
  	  const detailsCollection = db.collection('tasks');
  	  detailsCollection.insertOne(req.body);
	
	})
  console.log(req.body.task + " got submitted successfully");
  
  res.writeHead(301,
    {Location: 'http://localhost:3000/' }
  );
  res.end();
});

/* POST delete task details */
router.post('/delete_task_details',function(req,res,next){
  console.log(req.body.task);
  MongoClient.connect(uri, (err, client) => {
	  if (err) return console.error(err)
  	  console.log('Connected to Tickets Database');
  	  const db = client.db('todo');
  	  const detailsCollection = db.collection('tasks');
  	  detailsCollection.deleteOne(req.body);
	
	})
  console.log(req.body.task + " deleted successfully.");
  res.writeHead(301,
    {Location: 'http://localhost:3000/' }
  );
  res.end();
});

/* GET to do tasks */
router.get('/get_tasks',function(req,res,next){
  MongoClient.connect(uri, (err, client) => {
	  if (err) return console.error(err)
  	  console.log('Connected to Tickets Database');
  	  const db = client.db('todo');
  	  const detailsCollection = db.collection('tasks');
  	  detailsCollection.find().toArray(function(err, result) {  
        if (err) console.log(err);  
        console.log(result);
        res.send(result);
      });  
	
	})
});

/* GET page for editing tasks */
router.get('/edit_tasks',function(req,res,next){
	var html = "<!DOCTYPE html><html><head><title>Edit Task</title></head><body><center><h1>Delete Task</h1><textarea name=\"new_task\" form=\"usrform\" placeholder=\"Enter your edited task here\"></textarea><form action = \"http://localhost:3000/edit_task_details\" method = \"POST\" id=\"usrform\">Select task to be edited:<select name=\"old_task\"> <option value='default'></option>";
  	var json_file;
	request.get({
		  headers: {'content-type' : 'application/x-www-form-urlencoded'},
		  url:     'http://localhost:3000/get_tasks',
		}, function(error, response, body){
			if(!error){
		  		//console.log(body);
				json_file = JSON.parse(body);
				//console.log(json_file);
		  		var s = "<option value=";
				var t = "</option>"

		  		for(var i=0;i<json_file.length;i++){

					var k = s+ JSON.stringify(json_file[i].task) + ">"+ json_file[i].task+t;
					html+=k;

		  		}
		  		html+= "</select><br/><br/><input type = \"submit\" value = \"Edit\"></form></center></body></html>";
		  		res.send(html);
			}
			else{
				console.log(error);
			}
	});
});

/* POST for editing tasks */
router.post('/edit_task_details',function(req,res,next){
	var query = {task: req.body.old_task}; 
	var new_task = req.body.new_task;
	console.log(query);
	var z; 
	MongoClient.connect(uri, (err, client) => {
	  if (err) return console.error(err)
  	  console.log('Connected to Tickets Database');
  	  const db = client.db('todo');
  	  const detailsCollection = db.collection('tasks');
  	  detailsCollection.find(query).toArray(function(err, result) {  
		if (err) console.log(err);  
		else {
			var newvalue = {$set: {task:new_task}};
			detailsCollection.updateOne(query, newvalue,function(err_,result_){
				if(!err_){
					res.writeHead(301,
						{Location: 'http://localhost:3000/' }
					);
					res.end();
				}
			});
		}
		});  
	})
});

module.exports = router;
