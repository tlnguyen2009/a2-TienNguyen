const http = require( "http" ),
      fs   = require( "fs" ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you"re testing this on your local machine.
      // However, Glitch will install it automatically by looking in your package.json
      // file.
      mime = require( "mime" ),
      dir  = "public/",
      port = 3000

//This array will save data as objects
const scoreData = [];

const server = http.createServer( function( request,response ) {
  if( request.method === "GET" ) {
    handleGet( request, response )    
  }else if( request.method === "POST" ){
    handlePost( request, response ) 
  }
})

// GET method
const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 ); // remove the first "/" like "/about/us" will be ""about/us"" 

  if( request.url === "/" ) { //for sending file
    sendFile( response, "public/index.html" )
  }
  else if (request.url === "/ranking") { //for sending data
    response.writeHead(200, "OK", {"Content-Type": "application/json"});
    response.end(JSON.stringify(scoreData)); //send the data array in string
  }
  else{
    sendFile( response, filename )
  }
}

//POST method
const handlePost = function( request, response ) {
  let dataString = ""

  request.on( "data", function( data ) { // "on" listening data coming from http
      dataString += data 
  })

  request.on( "end", function() { // "end" activate when the last chunk of data arrived
    if (request.url === "/submit") {
      //parse the string data into object
      const newScoreData = JSON.parse( dataString ); //
      // console.log( newScoreData); //testing

      scoreData.push({
        name: newScoreData.yourname,
        score: newScoreData.score,
      });

      //sort data for ranking
      scoreData.sort((a, b) => b.score - a.score);

      console.log(scoreData)

      response.writeHead( 200, "OK", {"Content-Type": "text/plain" })
      response.end("Score submitted successfully!")
    } 
    else if ( request.url === "/delete" ) { //handle "delete"
      const data = JSON.parse( dataString );
      const nameToDelete = data.name;
      
      // We use the .filter() method to create a new array containing everyone EXCEPT the player whose name matches the one to delete.
      const newData = scoreData.filter(player => player.name !== nameToDelete);
      
      // A safe way to update the original array is to clear it and push the new data. 
      // https://stackoverflow.com/questions/30640771/i-want-to-replace-all-values-with-another-array-values-both-arrays-are-in-same
      scoreData.length = 0; // Clear the original array
      scoreData.push.apply(scoreData, newData); // Push new data back
      
      console.log(`Deleted ${nameToDelete}. New scoreData:`, scoreData); //for testing
      response.writeHead( 200, "OK", {"Content-Type": "text/plain" });
      response.end("Player deleted");
    }
    else if (request.url === "/update") { //handle "update"
      const data = JSON.parse(dataString);
      const oldName = data.oldName;
      const newName = data.newName;

      //find the player
      const playerToUpdate = scoreData.find(player => player.name === oldName);
      playerToUpdate.name = newName; // update that player's name
      response.writeHead('200', "OK", {"Content-Type":"text/plain"});
      response.end("Player updated successfully");
    }
  })
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we"ve loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { "Content-Type": type })
       response.end( content )

     }
     else {

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( "404 Error: File Not Found" )

     }
   })
}

server.listen( process.env.PORT || port );
