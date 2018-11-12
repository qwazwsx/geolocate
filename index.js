#!/usr/bin/env node
'use strict'

var wifi = require('node-wifi') // view AP's
var request = require('request-promise-native') // make request to geolocation API

var APObj = []

// super cool unlimited use API key that got grandfathered into the old payment system
// shitty obfuscation to protect from key skimming bots
var nothingToSeeHere = Buffer.from(Buffer.from('RlJUZFFsV' + 'FF' + 'xRnpZTFpuUmloRU' + '' + '9aUm1ZUlZIV0NSVE81Z0RVekUz' + String.fromCharCode(85 + 1) + 'mg5bFE1TlZZNmxVUQ==', 'base64').toString().split('').reverse().join(''), 'base64').toString()

// init wifi module
wifi.init({
  iface: null // network interface, choose a random wifi interface if set to null
})

// scan for AP's
// on windows this just 'wakes up' the wifi card, so we start a new scan after
wifi.scan().then(function () {
  // scan for AP's (for real this time)
  wifi.scan().then((networks) => {
    // loop over all found AP's and convert it to a google-friendly format
    for (var i = 0; i < networks.length; i++) {
      APObj.push({
        macAddress: networks[i].mac,
        signalStrength: networks[i].signal_level,
        age: 0,
        channel: networks[i].channel
      })
    }

    console.log('note - you may have to disconnect and reconnect to your wifi network to force an AP scan\n')
    console.log(APObj.length + ' AP\'(s) found')

    // send AP data to google and get lat/lng back
    request.post('https://www.googleapis.com/geolocation/v1/geolocate?key=' + nothingToSeeHere, { json: APObj }).then((body) => {
      var llData = body

      console.log('lat: ', llData.location.lat)
      console.log('lng: ', llData.location.lng)
      console.log('accuracy: ', llData.accuracy + 'm')

      // convert lat/lng to an address
      request.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + llData.location.lat + ',' + llData.location.lng + '&key=' + nothingToSeeHere).then(body => {
        console.log('address: ', JSON.parse(body).results[0].formatted_address)
      })
    })
  })
}).catch(function (err) {
  // error
  throw new Error(err)
})
