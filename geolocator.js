/*
 * Copyright Intel 2013 Michael Wood <michael.g.wood@intel.com>
 */

/* Earth values from:
 * http://gis.stackexchange.com/questions/2951/algorithm-for-offsetting-a-latitude-longitude-by-some-amount-of-meters
 */

"use strict";
var http = require ("http");
var url = require ("url");
var sqlite = require ('sqlite3').verbose ();
var fs = require ('fs');

var locationsDbFile = __dirname + '/locations.sqlite3';
var locationsDb;


var earthRadius = 6378137;
var degrees = 180/Math.PI;
var initialOffset = 5000; /* meters */

exports.load = load;
exports.getGeolocation = getGeolocation;
exports.newGeolocationData = newGeolocationData;

function newGeolocationData (queryData, successCallback) {
  var geolocatorData = new Object ();

  geolocatorData.distanceFromPoint = 0;
  geolocatorData.tries = 0;
  geolocatorData.lat = parseFloat (queryData.lat);
  geolocatorData.lng = parseFloat (queryData.lng);
  geolocatorData.success = successCallback;
  geolocatorData.queryData = queryData;

  console.log (geolocatorData.lat);
  console.log (geolocatorData.lng);

  return geolocatorData;
}

function load ()
{
  if (fs.existsSync (locationsDbFile)) {
    fs.openSync (locationsDbFile, 'r');
    locationsDb = new sqlite.Database (locationsDbFile);
  } else {
    console.log ("Error loading locations database");
  }
}

function getGeolocation (geolocatorData, response)
{
  if (geolocatorData.tries > 100) {
    response.write ("{ data : [ \"unknown\" ] }");
    response.end ();
    return;
  }

  if (geolocatorData.distanceFromPoint == 0)
    geolocatorData.distanceFromPoint = 5000;
  else
    geolocatorData.distanceFromPoint+=5000;

    var deltaLat = geolocatorData.distanceFromPoint/earthRadius;
    var deltaLng = geolocatorData.distanceFromPoint/(earthRadius*Math.cos (Math.PI*geolocatorData.lat/180));

    var lat0 = geolocatorData.lat + (deltaLat * degrees);
    var lng0 = geolocatorData.lng + (deltaLng * degrees);

    var lat1 = geolocatorData.lat - (deltaLat * degrees);
    var lng1 = geolocatorData.lng - (deltaLng * degrees);

    var dbSelectL = locationsDb.prepare ("SELECT name FROM locations WHERE lat <= ? AND lat >= ? AND long <= ? AND long >= ? LIMIT 1", lat0, lat1, lng0, lng1);
    dbSelectL.all (function (error, rows) {
      if (error) {
        endResponse (response, error);
        return;
      }

      if (rows[0]) {
        var loc = rows[0].name;
        var outJson = "{\n \"data\": [";
        outJson += "\""+loc+ "\"";
        outJson += "]\n}";

        /* {
         *    "data": ["Cascade Locks"]
         * }
         */

        response.write (outJson);
        response.end ();
        geolocatorData.success (geolocatorData.queryData, loc);
      } else {
        geolocatorData.tries++;
        getGeolocation (geolocatorData, response);
      }
    });
}
