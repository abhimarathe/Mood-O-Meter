var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/Feedback';

var bodyParser = require('body-parser');
app.use( bodyParser.json({limit: '50mb'}) );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 



app.get('/results', function (req, res) {

        MongoClient.connect(url, function(err, db) {
                 assert.equal(null, err);
                //insertDocument(db, function() {
                var cursor = db.collection('sentiment').find();
 // 		 		cursor.each(function(err, doc) {
	//      		 assert.equal(err, null);
	//     		  if (doc != null) {
	//      				 //console.dir(doc);
	// //				res.send(doc);
 //     		 		}
 //     		 	})	

     		 	db.collection('sentiment').aggregate([
     		 		{
     		 			$group : { _id:null, 
     		 					angerA:{$avg:"$audio.anger"},
     		 					sadnessA:{$avg:"$audio.sadness"},
     		 					fearA:{$avg:"$audio.fear"},
     		 					joyA:{$avg:"$audio.joy"},
     		 					disgustA:{$avg:"$audio.disgust"},

     		 					angerI:{$avg:"$image.anger"},
     		 					sadnessI:{$avg:"$image.sadness"},
     		 					fearI:{$avg:"$image.fear"},
     		 					joyI:{$avg:"$image.joy"},
     		 					disgustI:{$avg:"$image.disgust"},
     		 					//db.sentiment.aggregate([{$group:{ _id:null, Average:{$avg:"$audio.anger"}}}]);
     		 					}

     		 		}

     		 		], function(err, result) {
     		 			var audio = "\"audio\": {\"anger\":" +result[0].angerA+",\"sadness\":"+ result[0].sadnessA +",\"joy\":"+ result[0].joyA +",\"fear\":"+ result[0].fearA +",\"disgust\":"+ result[0].disgustA+"}";
    					var image = "\"image\": {\"anger\":" +result[0].angerI+",\"sadness\":"+ result[0].sadnessI +",\"joy\":"+ result[0].joyI +",\"fear\":"+ result[0].fearI +",\"disgust\":"+ result[0].disgustI+"}";
    						console.log("{"+audio+","+image+"}");
    						res.send("{"+audio+","+image+"}");
						}
				), function(err, result) {
                 		assert.equal(err, null);
                 		console.log("Done with Reading");
                 	};
                    db.close();
            });     
        });


app.get('/getNumericalRating', function (req, res) {
	MongoClient.connect(url, function(err, db) {
        if(err){
        		console.log('Unable to connect to Database :',url)
        	}
        else{


			db.collection('numerical').aggregate([
     		 		{
     		 			$group : { _id:null, 
     		 					machinistAvg:{$avg:"$machinist"},
     		 					marvelAvg:{$avg:"$marvel"},
     		 					finiteloopAvg:{$avg:"$finiteloop"},
     		 					brogrammersAvg:{$avg:"$brogrammers"},
     		 					aadhaarAvg:{$avg:"$aadhaar"},
     		 					vardAvg:{$avg:"$vard"},
     		 					decepticonsAvg:{$avg:"$decepticons"},
     		 					openfaceAvg:{$avg:"openface"}
     		 					
     		 					}

     		 		}

     		 		], function(err, result) {
     		 			var send1 = "\"machinist\" :"+result[0].machinistAvg+",\"marvel\" :"+result[0].marvelAvg+",\"finiteloop\" :"+result[0].finiteloopAvg+",\"brogrammers\" :"+result[0].brogrammersAvg+",\"aadhaar\" :"+result[0].aadhaarAvg+",\"vard\" :"+result[0].vardAvg+",\"decepticons\" :"+result[0].decepticonsAvg+",\"openface\" :"+result[0].openfaceAvg;
    						console.log("{"+send1+"}");
    						res.send("{"+send1+"}");
						}
				), function(err, result) {
                 		assert.equal(err, null);
                 		console.log("Done with Reading");
                 	};
	 		}

	})

});

app.post('/sendNumericalRating', function (req, res) {  
        
        console.log("Connected:")
        var numJson = req.body;
        // for(var jkey in numJson ){
        // 	if(jkey.toString() == "MachinistRating")
        // 	{
        // 		dbIn = numJson[jkey];
        // 		console.log(dbIn);
        // 	}
        // 	else(jkey.toString())
        // }
        MongoClient.connect(url, function(err, db) {
        	if(err){
        		console.log('Unable to connect to Database :',url)
        	}
        	else{

	        		


	            assert.equal(null, err);
	                //insertDocument(db, function() {
	            db.collection('numerical').insertOne(
	                //"machinist" : dbIn
	                numJson
	           		, function(err, result) {
	                 assert.equal(err, null);
	                 console.log("Inserted a document into the numerical collection.");
	                 });
	            db.close();
                }
                res.send(numJson);
 	});
 });


app.post('/sendSentiment',function(req,res){


	var jsonObj=req.body;
	for(var exKey in jsonObj) {

	      		switch(exKey.toString()){
	      			
		        	case "anger":
		        		var aA=jsonObj[exKey];	
		        		break;
		        	case "fear":
		        		var fA=jsonObj[exKey];
		        		break;
		        	case "joy":
		        		var jA=jsonObj[exKey];
		        		break;
		        	case "sadness":
		        		var sA=jsonObj[exKey];
		        		break;
		        	case "disgust":
		        		var dA = jsonObj[exKey];
		        		break;
		        	case "ImageString":
		        		var image = jsonObj[exKey];
		        		break;
		        }
		}
		//run python module
		var path = '/home/ubuntu/tmp/tmp_file'
		console.log("Got file..")
		require('fs').writeFileSync(path, image)
		console.log("Wrote file..")
		require('child_process')
			.exec('/home/ubuntu/anaconda2/bin/python /home/ubuntu/MODEL/script_running.py ' + path,
			{
				cwd : '/home/ubuntu/MODEL/',
				env : {
					CAFFE_ROOT : '/home/ubuntu/caffe',
					PYTHONPATH : '/home/ubuntu/caffe/python'
				}
			},
			function(err, stdout, stderr) {
				
				console.log({
					err: err,
					stdout : stdout,
					stderr : stderr
				})
				
				responseObj = JSON.parse(stdout)
				console.log(responseObj)
				res.json(responseObj)
				for(var exKey in responseObj) {
	      

		      		switch(exKey.toString()){

			        	case "anger":
			        		var aI=responseObj[exKey];	
			        		break;
			        	case "fear":
			        		var fI=responseObj[exKey];
			        		break;
			        	case "joy":
			        		var jI=responseObj[exKey];
			        		break;
			        	case "sadness":
			        		var sI=responseObj[exKey];
			        		break;
			        	case "disgust":
			        		var dI = responseObj[exKey];
			        		break;
			        }
		    	}
		    	//insert into DB
		    	MongoClient.connect(url, function(err, db) {
	            assert.equal(null, err);
	            //insertDocument(db, function() {
	            db.collection('sentiment').insertOne( {
	            
		            audio:
		            {
			            "anger" : aA, 
			            "fear" : fA,
			            "sadness" : sA,
			            "joy" : jA,
			            "disgust" : dA
		       		},
		       		image:
		       		{
		       			"anger" : aI, 
		            	"fear" : fI,
		            	"sadness" : sI,
		            	"joy" : jI,
		            	"disgust" : dI

	       			}
	       		}, function(err, result) {
		             assert.equal(err, null);
		             console.log("Inserted a document into the sentiment collection.");
	             });
	                    db.close();
         		});

			}
		)

	
});

//-----------------------------------------------------MACHINISTS-----------------------------------------------
//Machinists Request from Android
app.post('/sendSentiment/machinist',function(req,res){


	var jsonObj=req.body;
	for(var exKey in jsonObj) {


	      		switch(exKey.toString()){
	      			
		        	case "anger":
		        		var aA=jsonObj[exKey];	
		        		break;
		        	case "fear":
		        		var fA=jsonObj[exKey];
		        		break;
		        	case "joy":
		        		var jA=jsonObj[exKey];
		        		break;
		        	case "sadness":
		        		var sA=jsonObj[exKey];
		        		break;
		        	case "disgust":
		        		var dA = jsonObj[exKey];
		        		break;
		        	case "ImageString":
		        		var image = jsonObj[exKey];
		        		break;
		        }
		}

		var path = '/home/ubuntu/tmp/tmp_file'
		console.log("Got file..")
		require('fs').writeFileSync(path, image)
		console.log("Wrote file..")
		require('child_process')
			.exec('/home/ubuntu/anaconda2/bin/python /home/ubuntu/MODEL/script_running.py ' + path,
			{
				cwd : '/home/ubuntu/MODEL/',
				env : {
					CAFFE_ROOT : '/home/ubuntu/caffe',
					PYTHONPATH : '/home/ubuntu/caffe/python'
				}
			},
			function(err, stdout, stderr) {
				
				console.log({
					err: err,
					stdout : stdout,
					stderr : stderr
				})
				
				responseObj = JSON.parse(stdout)
				console.log(responseObj)
				res.json(responseObj)
				for(var exKey in responseObj) {
	      

		      		switch(exKey.toString()){

			        	case "anger":
			        		var aI=responseObj[exKey];	
			        		break;
			        	case "fear":
			        		var fI=responseObj[exKey];
			        		break;
			        	case "joy":
			        		var jI=responseObj[exKey];
			        		break;
			        	case "sadness":
			        		var sI=responseObj[exKey];
			        		break;
			        	case "disgust":
			        		var dI = responseObj[exKey];
			        		break;
			        }
		    	}
		    	//insert into DB
		    	MongoClient.connect(url, function(err, db) {
	            assert.equal(null, err);
	            //insertDocument(db, function() {
	            db.collection('MachinistSentiment').insertOne( {	//change collection name
	            
		            audio:
		            {
			            "anger" : aA, 
			            "fear" : fA,
			            "sadness" : sA,
			            "joy" : jA,
			            "disgust" : dA
		       		},
		       		image:
		       		{
		       			"anger" : aI, 
		            	"fear" : fI,
		            	"sadness" : sI,
		            	"joy" : jI,
		            	"disgust" : dI

	       			}
	       		}, function(err, result) {
		             assert.equal(err, null);
		             console.log("Inserted a document into the MachinistSentiment collection.");
	             });
	                    db.close();
         		});

			}
		)

	
});

//Machinists Request for Result
app.get('/results/machinist', function (req, res) {

        MongoClient.connect(url, function(err, db) {
                 assert.equal(null, err);
                //insertDocument(db, function() {
                //var cursor = db.collection('MachinistSentiment').find();

     		 	db.collection('MachinistSentiment').aggregate([
     		 		{
     		 			$group : { _id:null, 
     		 					angerA:{$avg:"$audio.anger"},
     		 					sadnessA:{$avg:"$audio.sadness"},
     		 					fearA:{$avg:"$audio.fear"},
     		 					joyA:{$avg:"$audio.joy"},
     		 					disgustA:{$avg:"$audio.disgust"},

     		 					angerI:{$avg:"$image.anger"},
     		 					sadnessI:{$avg:"$image.sadness"},
     		 					fearI:{$avg:"$image.fear"},
     		 					joyI:{$avg:"$image.joy"},
     		 					disgustI:{$avg:"$image.disgust"},
     		 					//db.sentiment.aggregate([{$group:{ _id:null, Average:{$avg:"$audio.anger"}}}]);
     		 					}

     		 		}

     		 		], function(err, result) {
     		 			var audio = "\"audio\": {\"anger\":" +result[0].angerA+",\"sadness\":"+ result[0].sadnessA +",\"joy\":"+ result[0].joyA +",\"fear\":"+ result[0].fearA +",\"disgust\":"+ result[0].disgustA+"}";
    					var image = "\"image\": {\"anger\":" +result[0].angerI+",\"sadness\":"+ result[0].sadnessI +",\"joy\":"+ result[0].joyI +",\"fear\":"+ result[0].fearI +",\"disgust\":"+ result[0].disgustI+"}";
    						console.log("{"+audio+","+image+"}");
    						res.send("{"+audio+","+image+"}");
						}
				), function(err, result) {
                 		assert.equal(err, null);
                 		console.log("Done with Reading");
                 	};
                    db.close();
                });     
});


//----------------------------------------------------MARVEL----------------------------------------------
//Marvel Request from Android
app.post('/sendSentiment/marvel',function(req,res){


	var jsonObj=req.body;
	for(var exKey in jsonObj) {


	      		switch(exKey.toString()){
	      			
		        	case "anger":
		        		var aA=jsonObj[exKey];	
		        		break;
		        	case "fear":
		        		var fA=jsonObj[exKey];
		        		break;
		        	case "joy":
		        		var jA=jsonObj[exKey];
		        		break;
		        	case "sadness":
		        		var sA=jsonObj[exKey];
		        		break;
		        	case "disgust":
		        		var dA = jsonObj[exKey];
		        		break;
		        	case "ImageString":
		        		var image = jsonObj[exKey];
		        		break;
		        }
		}

		var path = '/home/ubuntu/tmp/tmp_file'
		console.log("Got file..")
		require('fs').writeFileSync(path, image)
		console.log("Wrote file..")
		require('child_process')
			.exec('/home/ubuntu/anaconda2/bin/python /home/ubuntu/MODEL/script_running.py ' + path,
			{
				cwd : '/home/ubuntu/MODEL/',
				env : {
					CAFFE_ROOT : '/home/ubuntu/caffe',
					PYTHONPATH : '/home/ubuntu/caffe/python'
				}
			},
			function(err, stdout, stderr) {
				
				console.log({
					err: err,
					stdout : stdout,
					stderr : stderr
				})
				
				responseObj = JSON.parse(stdout)
				console.log(responseObj)
				res.json(responseObj)
				for(var exKey in responseObj) {
	      

		      		switch(exKey.toString()){

			        	case "anger":
			        		var aI=responseObj[exKey];	
			        		break;
			        	case "fear":
			        		var fI=responseObj[exKey];
			        		break;
			        	case "joy":
			        		var jI=responseObj[exKey];
			        		break;
			        	case "sadness":
			        		var sI=responseObj[exKey];
			        		break;
			        	case "disgust":
			        		var dI = responseObj[exKey];
			        		break;
			        }
		    	}
		    	//insert into DB
		    	MongoClient.connect(url, function(err, db) {
	            assert.equal(null, err);
	            //insertDocument(db, function() {
	            db.collection('MarvelSentiment').insertOne( {	//change collection name
	            
		            audio:
		            {
			            "anger" : aA, 
			            "fear" : fA,
			            "sadness" : sA,
			            "joy" : jA,
			            "disgust" : dA
		       		},
		       		image:
		       		{
		       			"anger" : aI, 
		            	"fear" : fI,
		            	"sadness" : sI,
		            	"joy" : jI,
		            	"disgust" : dI

	       			}
	       		}, function(err, result) {
		             assert.equal(err, null);
		             console.log("Inserted a document into the MarvelSentiment collection.");
	             });
	                    db.close();
         		});

			}
		)

	
});

//Marvel Request for Result
app.get('/results/marvel', function (req, res) {

        MongoClient.connect(url, function(err, db) {
                 assert.equal(null, err);
                //insertDocument(db, function() {
                //var cursor = db.collection('MachinistSentiment').find();

     		 	db.collection('MarvelSentiment').aggregate([
     		 		{
     		 			$group : { _id:null, 
     		 					angerA:{$avg:"$audio.anger"},
     		 					sadnessA:{$avg:"$audio.sadness"},
     		 					fearA:{$avg:"$audio.fear"},
     		 					joyA:{$avg:"$audio.joy"},
     		 					disgustA:{$avg:"$audio.disgust"},

     		 					angerI:{$avg:"$image.anger"},
     		 					sadnessI:{$avg:"$image.sadness"},
     		 					fearI:{$avg:"$image.fear"},
     		 					joyI:{$avg:"$image.joy"},
     		 					disgustI:{$avg:"$image.disgust"},
     		 					//db.sentiment.aggregate([{$group:{ _id:null, Average:{$avg:"$audio.anger"}}}]);
     		 					}

     		 		}

     		 		], function(err, result) {
     		 			var audio = "\"audio\": {\"anger\":" +result[0].angerA+",\"sadness\":"+ result[0].sadnessA +",\"joy\":"+ result[0].joyA +",\"fear\":"+ result[0].fearA +",\"disgust\":"+ result[0].disgustA+"}";
    					var image = "\"image\": {\"anger\":" +result[0].angerI+",\"sadness\":"+ result[0].sadnessI +",\"joy\":"+ result[0].joyI +",\"fear\":"+ result[0].fearI +",\"disgust\":"+ result[0].disgustI+"}";
    						console.log("{"+audio+","+image+"}");
    						res.send("{"+audio+","+image+"}");
						}
				), function(err, result) {
                 		assert.equal(err, null);
                 		console.log("Done with Reading");
                 	};
                    db.close();
                });     
});

//-----------------------------------------------------FiniteLoop-----------------------------------------------
//FiniteLoop Request from Android
app.post('/sendSentiment/finiteloop',function(req,res){


	var jsonObj=req.body;
	for(var exKey in jsonObj) {


	      		switch(exKey.toString()){
	      			
		        	case "anger":
		        		var aA=jsonObj[exKey];	
		        		break;
		        	case "fear":
		        		var fA=jsonObj[exKey];
		        		break;
		        	case "joy":
		        		var jA=jsonObj[exKey];
		        		break;
		        	case "sadness":
		        		var sA=jsonObj[exKey];
		        		break;
		        	case "disgust":
		        		var dA = jsonObj[exKey];
		        		break;
		        	case "ImageString":
		        		var image = jsonObj[exKey];
		        		break;
		        }
		}

		var path = '/home/ubuntu/tmp/tmp_file'
		console.log("Got file..")
		require('fs').writeFileSync(path, image)
		console.log("Wrote file..")
		require('child_process')
			.exec('/home/ubuntu/anaconda2/bin/python /home/ubuntu/MODEL/script_running.py ' + path,
			{
				cwd : '/home/ubuntu/MODEL/',
				env : {
					CAFFE_ROOT : '/home/ubuntu/caffe',
					PYTHONPATH : '/home/ubuntu/caffe/python'
				}
			},
			function(err, stdout, stderr) {
				
				console.log({
					err: err,
					stdout : stdout,
					stderr : stderr
				})
				
				responseObj = JSON.parse(stdout)
				console.log(responseObj)
				res.json(responseObj)
				for(var exKey in responseObj) {
	      

		      		switch(exKey.toString()){

			        	case "anger":
			        		var aI=responseObj[exKey];	
			        		break;
			        	case "fear":
			        		var fI=responseObj[exKey];
			        		break;
			        	case "joy":
			        		var jI=responseObj[exKey];
			        		break;
			        	case "sadness":
			        		var sI=responseObj[exKey];
			        		break;
			        	case "disgust":
			        		var dI = responseObj[exKey];
			        		break;
			        }
		    	}
		    	//insert into DB
		    	MongoClient.connect(url, function(err, db) {
	            assert.equal(null, err);
	            //insertDocument(db, function() {
	            db.collection('FiniteloopSentiment').insertOne( {	//change collection name
	            
		            audio:
		            {
			            "anger" : aA, 
			            "fear" : fA,
			            "sadness" : sA,
			            "joy" : jA,
			            "disgust" : dA
		       		},
		       		image:
		       		{
		       			"anger" : aI, 
		            	"fear" : fI,
		            	"sadness" : sI,
		            	"joy" : jI,
		            	"disgust" : dI

	       			}
	       		}, function(err, result) {
		             assert.equal(err, null);
		             console.log("Inserted a document into the FiniteloopSentiment collection.");
	             });
	                    db.close();
         		});

			}
		)

	
});

//Finiteloop Request for Result
app.get('/results/finiteloop', function (req, res) {

        MongoClient.connect(url, function(err, db) {
                 assert.equal(null, err);
                //insertDocument(db, function() {
                //var cursor = db.collection('MachinistSentiment').find();

     		 	db.collection('FiniteloopSentiment').aggregate([
     		 		{
     		 			$group : { _id:null, 
     		 					angerA:{$avg:"$audio.anger"},
     		 					sadnessA:{$avg:"$audio.sadness"},
     		 					fearA:{$avg:"$audio.fear"},
     		 					joyA:{$avg:"$audio.joy"},
     		 					disgustA:{$avg:"$audio.disgust"},

     		 					angerI:{$avg:"$image.anger"},
     		 					sadnessI:{$avg:"$image.sadness"},
     		 					fearI:{$avg:"$image.fear"},
     		 					joyI:{$avg:"$image.joy"},
     		 					disgustI:{$avg:"$image.disgust"},
     		 					//db.sentiment.aggregate([{$group:{ _id:null, Average:{$avg:"$audio.anger"}}}]);
     		 					}
     		 		}

     		 		], function(err, result) {
     		 			var audio = "\"audio\": {\"anger\":" +result[0].angerA+",\"sadness\":"+ result[0].sadnessA +",\"joy\":"+ result[0].joyA +",\"fear\":"+ result[0].fearA +",\"disgust\":"+ result[0].disgustA+"}";
    					var image = "\"image\": {\"anger\":" +result[0].angerI+",\"sadness\":"+ result[0].sadnessI +",\"joy\":"+ result[0].joyI +",\"fear\":"+ result[0].fearI +",\"disgust\":"+ result[0].disgustI+"}";
    						console.log("{"+audio+","+image+"}");
    						res.send("{"+audio+","+image+"}");
						}
				), function(err, result) {
                 		assert.equal(err, null);
                 		console.log("Done with Reading");
                 	};
                    db.close();
                });     
});

//------------------------------------------------------Brogrammers----------------------------------------------
//Brogrammers Request from Android
app.post('/sendSentiment/brogrammers',function(req,res){


	var jsonObj=req.body;
	for(var exKey in jsonObj) {


	      		switch(exKey.toString()){
	      			
		        	case "anger":
		        		var aA=jsonObj[exKey];	
		        		break;
		        	case "fear":
		        		var fA=jsonObj[exKey];
		        		break;
		        	case "joy":
		        		var jA=jsonObj[exKey];
		        		break;
		        	case "sadness":
		        		var sA=jsonObj[exKey];
		        		break;
		        	case "disgust":
		        		var dA = jsonObj[exKey];
		        		break;
		        	case "ImageString":
		        		var image = jsonObj[exKey];
		        		break;
		        }
		}

		var path = '/home/ubuntu/tmp/tmp_file'
		console.log("Got file..")
		require('fs').writeFileSync(path, image)
		console.log("Wrote file..")
		require('child_process')
			.exec('/home/ubuntu/anaconda2/bin/python /home/ubuntu/MODEL/script_running.py ' + path,
			{
				cwd : '/home/ubuntu/MODEL/',
				env : {
					CAFFE_ROOT : '/home/ubuntu/caffe',
					PYTHONPATH : '/home/ubuntu/caffe/python'
				}
			},
			function(err, stdout, stderr) {
				
				console.log({
					err: err,
					stdout : stdout,
					stderr : stderr
				})
				
				responseObj = JSON.parse(stdout)
				console.log(responseObj)
				res.json(responseObj)
				for(var exKey in responseObj) {
	      

		      		switch(exKey.toString()){

			        	case "anger":
			        		var aI=responseObj[exKey];	
			        		break;
			        	case "fear":
			        		var fI=responseObj[exKey];
			        		break;
			        	case "joy":
			        		var jI=responseObj[exKey];
			        		break;
			        	case "sadness":
			        		var sI=responseObj[exKey];
			        		break;
			        	case "disgust":
			        		var dI = responseObj[exKey];
			        		break;
			        }
		    	}
		    	//insert into DB
		    	MongoClient.connect(url, function(err, db) {
	            assert.equal(null, err);
	            //insertDocument(db, function() {
	            db.collection('BrogrammersSentiment').insertOne( {	//change collection name
	            
		            audio:
		            {
			            "anger" : aA, 
			            "fear" : fA,
			            "sadness" : sA,
			            "joy" : jA,
			            "disgust" : dA
		       		},
		       		image:
		       		{
		       			"anger" : aI, 
		            	"fear" : fI,
		            	"sadness" : sI,
		            	"joy" : jI,
		            	"disgust" : dI

	       			}
	       		}, function(err, result) {
		             assert.equal(err, null);
		             console.log("Inserted a document into the BrogrammersSentiment collection.");
	             });
	                    db.close();
         		});

			}
		)

	
});

//Brogrammers Request for Result
app.get('/results/brogrammers', function (req, res) {

        MongoClient.connect(url, function(err, db) {
                 assert.equal(null, err);
                //insertDocument(db, function() {
                //var cursor = db.collection('MachinistSentiment').find();

     		 	db.collection('BrogrammersSentiment').aggregate([
     		 		{
     		 			$group : { _id:null, 
     		 					angerA:{$avg:"$audio.anger"},
     		 					sadnessA:{$avg:"$audio.sadness"},
     		 					fearA:{$avg:"$audio.fear"},
     		 					joyA:{$avg:"$audio.joy"},
     		 					disgustA:{$avg:"$audio.disgust"},

     		 					angerI:{$avg:"$image.anger"},
     		 					sadnessI:{$avg:"$image.sadness"},
     		 					fearI:{$avg:"$image.fear"},
     		 					joyI:{$avg:"$image.joy"},
     		 					disgustI:{$avg:"$image.disgust"},
     		 					//db.sentiment.aggregate([{$group:{ _id:null, Average:{$avg:"$audio.anger"}}}]);
     		 					}

     		 		}

     		 		], function(err, result) {
     		 			var audio = "\"audio\": {\"anger\":" +result[0].angerA+",\"sadness\":"+ result[0].sadnessA +",\"joy\":"+ result[0].joyA +",\"fear\":"+ result[0].fearA +",\"disgust\":"+ result[0].disgustA+"}";
    					var image = "\"image\": {\"anger\":" +result[0].angerI+",\"sadness\":"+ result[0].sadnessI +",\"joy\":"+ result[0].joyI +",\"fear\":"+ result[0].fearI +",\"disgust\":"+ result[0].disgustI+"}";
    						console.log("{"+audio+","+image+"}");
    						res.send("{"+audio+","+image+"}");
						}
				), function(err, result) {
                 		assert.equal(err, null);
                 		console.log("Done with Reading");
                 	};
                    db.close();
                });     
});

//------------------------------------------------------Aadhaar----------------------------------------------
//Aadhaar Request from Android
app.post('/sendSentiment/aadhaar',function(req,res){


	var jsonObj=req.body;
	for(var exKey in jsonObj) {


	      		switch(exKey.toString()){
	      			
		        	case "anger":
		        		var aA=jsonObj[exKey];	
		        		break;
		        	case "fear":
		        		var fA=jsonObj[exKey];
		        		break;
		        	case "joy":
		        		var jA=jsonObj[exKey];
		        		break;
		        	case "sadness":
		        		var sA=jsonObj[exKey];
		        		break;
		        	case "disgust":
		        		var dA = jsonObj[exKey];
		        		break;
		        	case "ImageString":
		        		var image = jsonObj[exKey];
		        		break;
		        }
		}

		var path = '/home/ubuntu/tmp/tmp_file'
		console.log("Got file..")
		require('fs').writeFileSync(path, image)
		console.log("Wrote file..")
		require('child_process')
			.exec('/home/ubuntu/anaconda2/bin/python /home/ubuntu/MODEL/script_running.py ' + path,
			{
				cwd : '/home/ubuntu/MODEL/',
				env : {
					CAFFE_ROOT : '/home/ubuntu/caffe',
					PYTHONPATH : '/home/ubuntu/caffe/python'
				}
			},
			function(err, stdout, stderr) {
				
				console.log({
					err: err,
					stdout : stdout,
					stderr : stderr
				})
				
				responseObj = JSON.parse(stdout)
				console.log(responseObj)
				res.json(responseObj)
				for(var exKey in responseObj) {
	      

		      		switch(exKey.toString()){

			        	case "anger":
			        		var aI=responseObj[exKey];	
			        		break;
			        	case "fear":
			        		var fI=responseObj[exKey];
			        		break;
			        	case "joy":
			        		var jI=responseObj[exKey];
			        		break;
			        	case "sadness":
			        		var sI=responseObj[exKey];
			        		break;
			        	case "disgust":
			        		var dI = responseObj[exKey];
			        		break;
			        }
		    	}
		    	//insert into DB
		    	MongoClient.connect(url, function(err, db) {
	            assert.equal(null, err);
	            //insertDocument(db, function() {
	            db.collection('AadhaarSentiment').insertOne( {	//change collection name
	            
		            audio:
		            {
			            "anger" : aA, 
			            "fear" : fA,
			            "sadness" : sA,
			            "joy" : jA,
			            "disgust" : dA
		       		},
		       		image:
		       		{
		       			"anger" : aI, 
		            	"fear" : fI,
		            	"sadness" : sI,
		            	"joy" : jI,
		            	"disgust" : dI

	       			}
	       		}, function(err, result) {
		             assert.equal(err, null);
		             console.log("Inserted a document into the AadhaarSentiment collection.");
	             });
	                    db.close();
         		});

			}
		)

	
});

//Aadhaar Request for Result
app.get('/results/aadhaar', function (req, res) {

        MongoClient.connect(url, function(err, db) {
                 assert.equal(null, err);
                //insertDocument(db, function() {
                //var cursor = db.collection('MachinistSentiment').find();

     		 	db.collection('AadhaarSentiment').aggregate([
     		 		{
     		 			$group : { _id:null, 
     		 					angerA:{$avg:"$audio.anger"},
     		 					sadnessA:{$avg:"$audio.sadness"},
     		 					fearA:{$avg:"$audio.fear"},
     		 					joyA:{$avg:"$audio.joy"},
     		 					disgustA:{$avg:"$audio.disgust"},

     		 					angerI:{$avg:"$image.anger"},
     		 					sadnessI:{$avg:"$image.sadness"},
     		 					fearI:{$avg:"$image.fear"},
     		 					joyI:{$avg:"$image.joy"},
     		 					disgustI:{$avg:"$image.disgust"},
     		 					//db.sentiment.aggregate([{$group:{ _id:null, Average:{$avg:"$audio.anger"}}}]);
     		 					}

     		 		}

     		 		], function(err, result) {
     		 			var audio = "\"audio\": {\"anger\":" +result[0].angerA+",\"sadness\":"+ result[0].sadnessA +",\"joy\":"+ result[0].joyA +",\"fear\":"+ result[0].fearA +",\"disgust\":"+ result[0].disgustA+"}";
    					var image = "\"image\": {\"anger\":" +result[0].angerI+",\"sadness\":"+ result[0].sadnessI +",\"joy\":"+ result[0].joyI +",\"fear\":"+ result[0].fearI +",\"disgust\":"+ result[0].disgustI+"}";
    						console.log("{"+audio+","+image+"}");
    						res.send("{"+audio+","+image+"}");
						}
				), function(err, result) {
                 		assert.equal(err, null);
                 		console.log("Done with Reading");
                 	};
                    db.close();
                });     
});


//------------------------------------------------------V.A.R.D.----------------------------------------------
//VARD Request from Android
app.post('/sendSentiment/vard',function(req,res){


	var jsonObj=req.body;
	for(var exKey in jsonObj) {


	      		switch(exKey.toString()){
	      			
		        	case "anger":
		        		var aA=jsonObj[exKey];	
		        		break;
		        	case "fear":
		        		var fA=jsonObj[exKey];
		        		break;
		        	case "joy":
		        		var jA=jsonObj[exKey];
		        		break;
		        	case "sadness":
		        		var sA=jsonObj[exKey];
		        		break;
		        	case "disgust":
		        		var dA = jsonObj[exKey];
		        		break;
		        	case "ImageString":
		        		var image = jsonObj[exKey];
		        		break;
		        }
		}

		var path = '/home/ubuntu/tmp/tmp_file'
		console.log("Got file..")
		require('fs').writeFileSync(path, image)
		console.log("Wrote file..")
		require('child_process')
			.exec('/home/ubuntu/anaconda2/bin/python /home/ubuntu/MODEL/script_running.py ' + path,
			{
				cwd : '/home/ubuntu/MODEL/',
				env : {
					CAFFE_ROOT : '/home/ubuntu/caffe',
					PYTHONPATH : '/home/ubuntu/caffe/python'
				}
			},
			function(err, stdout, stderr) {
				
				console.log({
					err: err,
					stdout : stdout,
					stderr : stderr
				})
				
				responseObj = JSON.parse(stdout)
				console.log(responseObj)
				res.json(responseObj)
				for(var exKey in responseObj) {
	      

		      		switch(exKey.toString()){

			        	case "anger":
			        		var aI=responseObj[exKey];	
			        		break;
			        	case "fear":
			        		var fI=responseObj[exKey];
			        		break;
			        	case "joy":
			        		var jI=responseObj[exKey];
			        		break;
			        	case "sadness":
			        		var sI=responseObj[exKey];
			        		break;
			        	case "disgust":
			        		var dI = responseObj[exKey];
			        		break;
			        }
		    	}
		    	//insert into DB
		    	MongoClient.connect(url, function(err, db) {
	            assert.equal(null, err);
	            //insertDocument(db, function() {
	            db.collection('VardSentiment').insertOne( {	//change collection name
	            
		            audio:
		            {
			            "anger" : aA, 
			            "fear" : fA,
			            "sadness" : sA,
			            "joy" : jA,
			            "disgust" : dA
		       		},
		       		image:
		       		{
		       			"anger" : aI, 
		            	"fear" : fI,
		            	"sadness" : sI,
		            	"joy" : jI,
		            	"disgust" : dI

	       			}
	       		}, function(err, result) {
		             assert.equal(err, null);
		             console.log("Inserted a document into the VardSentiment collection.");
	             });
	                    db.close();
         		});

			}
		)

	
});

//VARD Request for Result
app.get('/results/vard', function (req, res) {

        MongoClient.connect(url, function(err, db) {
                 assert.equal(null, err);
                //insertDocument(db, function() {
                //var cursor = db.collection('MachinistSentiment').find();

     		 	db.collection('VardSentiment').aggregate([
     		 		{
     		 			$group : { _id:null, 
     		 					angerA:{$avg:"$audio.anger"},
     		 					sadnessA:{$avg:"$audio.sadness"},
     		 					fearA:{$avg:"$audio.fear"},
     		 					joyA:{$avg:"$audio.joy"},
     		 					disgustA:{$avg:"$audio.disgust"},

     		 					angerI:{$avg:"$image.anger"},
     		 					sadnessI:{$avg:"$image.sadness"},
     		 					fearI:{$avg:"$image.fear"},
     		 					joyI:{$avg:"$image.joy"},
     		 					disgustI:{$avg:"$image.disgust"},
     		 					//db.sentiment.aggregate([{$group:{ _id:null, Average:{$avg:"$audio.anger"}}}]);
     		 					}

     		 		}

     		 		], function(err, result) {
     		 			var audio = "\"audio\": {\"anger\":" +result[0].angerA+",\"sadness\":"+ result[0].sadnessA +",\"joy\":"+ result[0].joyA +",\"fear\":"+ result[0].fearA +",\"disgust\":"+ result[0].disgustA+"}";
    					var image = "\"image\": {\"anger\":" +result[0].angerI+",\"sadness\":"+ result[0].sadnessI +",\"joy\":"+ result[0].joyI +",\"fear\":"+ result[0].fearI +",\"disgust\":"+ result[0].disgustI+"}";
    						console.log("{"+audio+","+image+"}");
    						res.send("{"+audio+","+image+"}");
						}
				), function(err, result) {
                 		assert.equal(err, null);
                 		console.log("Done with Reading");
                 	};
                    db.close();
                });     
});

//------------------------------------------------------The Decepticons----------------------------------------------
//The Decepticons Request from Android
app.post('/sendSentiment/decepticons',function(req,res){


	var jsonObj=req.body;
	for(var exKey in jsonObj) {


	      		switch(exKey.toString()){
	      			
		        	case "anger":
		        		var aA=jsonObj[exKey];	
		        		break;
		        	case "fear":
		        		var fA=jsonObj[exKey];
		        		break;
		        	case "joy":
		        		var jA=jsonObj[exKey];
		        		break;
		        	case "sadness":
		        		var sA=jsonObj[exKey];
		        		break;
		        	case "disgust":
		        		var dA = jsonObj[exKey];
		        		break;
		        	case "ImageString":
		        		var image = jsonObj[exKey];
		        		break;
		        }
		}

		var path = '/home/ubuntu/tmp/tmp_file'
		console.log("Got file..")
		require('fs').writeFileSync(path, image)
		console.log("Wrote file..")
		require('child_process')
			.exec('/home/ubuntu/anaconda2/bin/python /home/ubuntu/MODEL/script_running.py ' + path,
			{
				cwd : '/home/ubuntu/MODEL/',
				env : {
					CAFFE_ROOT : '/home/ubuntu/caffe',
					PYTHONPATH : '/home/ubuntu/caffe/python'
				}
			},
			function(err, stdout, stderr) {
				
				console.log({
					err: err,
					stdout : stdout,
					stderr : stderr
				})
				
				responseObj = JSON.parse(stdout)
				console.log(responseObj)
				res.json(responseObj)
				for(var exKey in responseObj) {
	      

		      		switch(exKey.toString()){

			        	case "anger":
			        		var aI=responseObj[exKey];	
			        		break;
			        	case "fear":
			        		var fI=responseObj[exKey];
			        		break;
			        	case "joy":
			        		var jI=responseObj[exKey];
			        		break;
			        	case "sadness":
			        		var sI=responseObj[exKey];
			        		break;
			        	case "disgust":
			        		var dI = responseObj[exKey];
			        		break;
			        }
		    	}
		    	//insert into DB
		    	MongoClient.connect(url, function(err, db) {
	            assert.equal(null, err);
	            //insertDocument(db, function() {
	            db.collection('DeceptioconsSentiment').insertOne( {	//change collection name
	            
		            audio:
		            {
			            "anger" : aA, 
			            "fear" : fA,
			            "sadness" : sA,
			            "joy" : jA,
			            "disgust" : dA
		       		},
		       		image:
		       		{
		       			"anger" : aI, 
		            	"fear" : fI,
		            	"sadness" : sI,
		            	"joy" : jI,
		            	"disgust" : dI

	       			}
	       		}, function(err, result) {
		             assert.equal(err, null);
		             console.log("Inserted a document into the DeceptioconsSentiment collection.");
	             });
	                    db.close();
         		});

			}
		)

	
});

//The Decepticons Request for Result
app.get('/results/decepticons', function (req, res) {

        MongoClient.connect(url, function(err, db) {
                 assert.equal(null, err);
                //insertDocument(db, function() {
                //var cursor = db.collection('MachinistSentiment').find();

     		 	db.collection('DeceptioconsSentiment').aggregate([
     		 		{
     		 			$group : { _id:null, 
     		 					angerA:{$avg:"$audio.anger"},
     		 					sadnessA:{$avg:"$audio.sadness"},
     		 					fearA:{$avg:"$audio.fear"},
     		 					joyA:{$avg:"$audio.joy"},
     		 					disgustA:{$avg:"$audio.disgust"},

     		 					angerI:{$avg:"$image.anger"},
     		 					sadnessI:{$avg:"$image.sadness"},
     		 					fearI:{$avg:"$image.fear"},
     		 					joyI:{$avg:"$image.joy"},
     		 					disgustI:{$avg:"$image.disgust"},
     		 					//db.sentiment.aggregate([{$group:{ _id:null, Average:{$avg:"$audio.anger"}}}]);
     		 					}

     		 		}

     		 		], function(err, result) {
     		 			var audio = "\"audio\": {\"anger\":" +result[0].angerA+",\"sadness\":"+ result[0].sadnessA +",\"joy\":"+ result[0].joyA +",\"fear\":"+ result[0].fearA +",\"disgust\":"+ result[0].disgustA+"}";
    					var image = "\"image\": {\"anger\":" +result[0].angerI+",\"sadness\":"+ result[0].sadnessI +",\"joy\":"+ result[0].joyI +",\"fear\":"+ result[0].fearI +",\"disgust\":"+ result[0].disgustI+"}";
    						console.log("{"+audio+","+image+"}");
    						res.send("{"+audio+","+image+"}");
						}
				), function(err, result) {
                 		assert.equal(err, null);
                 		console.log("Done with Reading");
                 	};
                    db.close();
                });     
});

//------------------------------------------------------Open Face----------------------------------------------
//Open Face Request from Android
app.post('/sendSentiment/openface',function(req,res){


	var jsonObj=req.body;
	for(var exKey in jsonObj) {


	      		switch(exKey.toString()){
	      			
		        	case "anger":
		        		var aA=jsonObj[exKey];	
		        		break;
		        	case "fear":
		        		var fA=jsonObj[exKey];
		        		break;
		        	case "joy":
		        		var jA=jsonObj[exKey];
		        		break;
		        	case "sadness":
		        		var sA=jsonObj[exKey];
		        		break;
		        	case "disgust":
		        		var dA = jsonObj[exKey];
		        		break;
		        	case "ImageString":
		        		var image = jsonObj[exKey];
		        		break;
		        }
		}

		var path = '/home/ubuntu/tmp/tmp_file'
		console.log("Got file..")
		require('fs').writeFileSync(path, image)
		console.log("Wrote file..")
		require('child_process')
			.exec('/home/ubuntu/anaconda2/bin/python /home/ubuntu/MODEL/script_running.py ' + path,
			{
				cwd : '/home/ubuntu/MODEL/',
				env : {
					CAFFE_ROOT : '/home/ubuntu/caffe',
					PYTHONPATH : '/home/ubuntu/caffe/python'
				}
			},
			function(err, stdout, stderr) {
				
				console.log({
					err: err,
					stdout : stdout,
					stderr : stderr
				})
				
				responseObj = JSON.parse(stdout)
				console.log(responseObj)
				res.json(responseObj)
				for(var exKey in responseObj) {
	      

		      		switch(exKey.toString()){

			        	case "anger":
			        		var aI=responseObj[exKey];	
			        		break;
			        	case "fear":
			        		var fI=responseObj[exKey];
			        		break;
			        	case "joy":
			        		var jI=responseObj[exKey];
			        		break;
			        	case "sadness":
			        		var sI=responseObj[exKey];
			        		break;
			        	case "disgust":
			        		var dI = responseObj[exKey];
			        		break;
			        }
		    	}
		    	//insert into DB
		    	MongoClient.connect(url, function(err, db) {
	            assert.equal(null, err);
	            //insertDocument(db, function() {
	            db.collection('OpenfaceSentiment').insertOne( {	//change collection name
	            
		            audio:
		            {
			            "anger" : aA, 
			            "fear" : fA,
			            "sadness" : sA,
			            "joy" : jA,
			            "disgust" : dA
		       		},
		       		image:
		       		{
		       			"anger" : aI, 
		            	"fear" : fI,
		            	"sadness" : sI,
		            	"joy" : jI,
		            	"disgust" : dI

	       			}
	       		}, function(err, result) {
		             assert.equal(err, null);
		             console.log("Inserted a document into the OpenfaceSentiment collection.");
	             });
	                    db.close();
         		});

			}
		)

	
});

//OpenFace Request for Result
app.get('/results/openface', function (req, res) {

        MongoClient.connect(url, function(err, db) {
                 assert.equal(null, err);
                //insertDocument(db, function() {
                //var cursor = db.collection('MachinistSentiment').find();

     		 	db.collection('OpenfaceSentiment').aggregate([
     		 		{
     		 			$group : { _id:null, 
     		 					angerA:{$avg:"$audio.anger"},
     		 					sadnessA:{$avg:"$audio.sadness"},
     		 					fearA:{$avg:"$audio.fear"},
     		 					joyA:{$avg:"$audio.joy"},
     		 					disgustA:{$avg:"$audio.disgust"},

     		 					angerI:{$avg:"$image.anger"},
     		 					sadnessI:{$avg:"$image.sadness"},
     		 					fearI:{$avg:"$image.fear"},
     		 					joyI:{$avg:"$image.joy"},
     		 					disgustI:{$avg:"$image.disgust"},
     		 					//db.sentiment.aggregate([{$group:{ _id:null, Average:{$avg:"$audio.anger"}}}]);
     		 					}

     		 		}

     		 		], function(err, result) {
     		 			var audio = "\"audio\": {\"anger\":" +result[0].angerA+",\"sadness\":"+ result[0].sadnessA +",\"joy\":"+ result[0].joyA +",\"fear\":"+ result[0].fearA +",\"disgust\":"+ result[0].disgustA+"}";
    					var image = "\"image\": {\"anger\":" +result[0].angerI+",\"sadness\":"+ result[0].sadnessI +",\"joy\":"+ result[0].joyI +",\"fear\":"+ result[0].fearI +",\"disgust\":"+ result[0].disgustI+"}";
    						console.log("{"+audio+","+image+"}");
    						res.send("{"+audio+","+image+"}");
						}
				), function(err, result) {
                 		assert.equal(err, null);
                 		console.log("Done with Reading");
                 	};
                    db.close();
                });     
});

var server = app.listen(3000, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
});

