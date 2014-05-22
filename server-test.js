/*
 * Copyright Intel 2013 Michael Wood <michael.g.wood@intel.com>
 */

/* test curl http://127.0.0.1:8080/getgeolocation?lat=51.507222&lng=-0.1275 */
"use strict";
var http = require ("http");
var url = require ("url");
var sqlite = require ('sqlite3').verbose ();
var querystring = require ('querystring');
var geolocator = require ('./geolocator.js');

var port = 8080;

function printError (error)
{
  if (error)
    console.log (error);
}

function endResponse (response, error)
{
  if (error) {
    console.log (error);
    response.write ('{ "return" : "1" , "error" : "'+error+'" }');
  } else {
    response.write ('{ "return" : "0" }');
  }
  response.end ();
}

/* Callback function for successful getGeolocation
 */
function addGeolocationToFile (queryData, loc)
{
  console.log ("Location done");
}

function getGeolocation (queryData, response)
{
  var geolocatorData;
  geolocatorData = geolocator.newGeolocationData (queryData, addGeolocationToFile);
  geolocator.getGeolocation (geolocatorData, response);
}

function route (pathname, queryData, response)
{
  if (queryData)
  {
    switch (pathname)
    {
    case '/getgeolocation' :
      getGeolocation (queryData, response);
      break;
     default:
        endResponse (response, "404");
        break;
    }
  }
}


function main ()
{
  geolocator.load ();

  http.createServer (function (request, response) {
    response.writeHead (200, { "Content-Type": "text/plain" });
    var parsedUrl = url.parse (request.url, true);
    console.log (parsedUrl.pathname + parsedUrl.query);

    route (parsedUrl.pathname, parsedUrl.query, response);
  }).listen (port);

  process.on ('SIGINT', function () {
    console.log ("..OK BYE");
    process.exit (0);
  });
}

main ();
