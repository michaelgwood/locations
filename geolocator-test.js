#!/usr/bin/env node
/*
 * Copyright Intel 2013 Michael Wood <michael.g.wood@intel.com>
 */

/* Requires sqlite3 ( npm install sqlite3 ) */

"use strict";
var geolocator = require (__dirname + '/geolocator.js');
var response = new Object ();
/* stubs for simulating http library */
response.end = function () { console.log ("end"); }
response.write = function (string) {console.log (string); }

function successCallback (queryData, loc) {
  console.log ("Success callback Got location "+loc)
}

function getGeolocation (queryData, response)
{
  var geolocatorData;
  geolocatorData = geolocator.newGeolocationData (queryData, successCallback);
  geolocator.getGeolocation (geolocatorData, response);
}


function main ()
{
  var lat, lng;
  geolocator.load ();
  var queryData = new Object ();

  if ((lat = process.argv[2]) && (lng = process.argv[3])) {
    queryData.lat = lat;
    queryData.lng = lng;
  } else {
    console.log ("Usage: geolocator-test.js lat long\nQuerying for \"City of Westminster\" instead (51.507222 -0.1275)");
    /* City of Westminster */
    queryData.lat = 51.507222;
    queryData.lng = -0.1275;
  }

  getGeolocation (queryData, response);

  process.on ('SIGINT', function () {
    console.log ("..OK BYE");
    process.exit (0);
  });
}

main ();
