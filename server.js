'use strict';
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var axios = require('axios');
var fs = require('fs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


/**
 * request logging
 */
app.use(function (req, res, next) {
    console.log('zensar-task', null, {
        req_params: req.params || "",
        req_body: req.body || ""
    });
    next();
});

let port = 8081;
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("App listening at http://%s:%s", host, port);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// entry point to rolloff dates service and routing logic
app.get('/countries/all', function (req, res, next) {
    let result = {};
    let statusCode;
    axios.get('https://restcountries.eu/rest/v2/all').then((countries) => {
        let countryData = countries.data.map((res) => {
            res.flag = res.flag.replace(/https/i, 'sftp');
            return res;
        });
        statusCode = 200;
        result.status = 'SUCCESS!';
        result.errorMessage = null
        result.data = countryData;
        res.writeHead(statusCode, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(result));

    }).catch((error) => {
        statusCode = 500;
        result.status = 'FAILED!';
        result.errorMessage = JSON.stringify(error);
        result.data = null;
        console.log('Error', error);
        res.writeHead(statusCode, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(result));
    })

});

app.post('/regions/search', function (req, res, next) {
    let result = {};
    let statusCode;
    let regionName = req.body.region;

    axios.get(`https://restcountries.eu/rest/v2/region/${regionName}`).then((countries) => {
        let countryData = countries.data.map((res) => {
            res.flag = res.flag.replace(/https/i, 'sftp');
            return res;
        });

        let timeStamp = new Date().getTime();
        fs.writeFile(`${timeStamp}.txt`, JSON.stringify(countryData), 'utf8', function (err) {
            if (err) {
                throw err;
            } else {
                console.log('File is created successfully.');
            }
        });
        statusCode = 200;
        result.status = 'SUCCESS!';
        result.errorMessage = null
        result.data = countryData;
        res.writeHead(statusCode, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(result));

    }).catch((error) => {
        statusCode = 500;
        result.status = 'FAILED!';
        result.errorMessage = JSON.stringify(error);
        result.data = null;
        console.log('Error', error);
    });

});

