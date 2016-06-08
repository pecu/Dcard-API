var request = require('request');
var cheerio = require('cheerio');

var CSRFToken = 'k3aAmCQ2-GXWP9MfFxKHUcGiIa_6N93dIzuQ';
var cookie = '';
cookie += 'dcard-web=eyJjc3JmU2VjcmV0IjoibFZoZnpPSjFWRlhKRlpNRjBPcjRXY1JtIiwidG9rZW4iOm51bGx9; ';
cookie += 'dcard-web.sig=1EBWILvJ8hcmnOQYnshGrFEpotw; ';

var getAllSchool = function(){
    var url = 'https://www.dcard.tw/_api/forums';
    return new Promise(function(resolve, reject){
        request.get({url: url}, function(err, res, body){
            if(res.statusCode != 200){
                reject('getAllSchool error:' + err);
                return;
            }

            var allSchool = [];
            body = JSON.parse(body);
            body.forEach(function(e){
                if(e.isSchool){
                    allSchool.push(e.name);
                }
            });
            resolve(allSchool);
        });
    });
};

var testInternet = function(){
    return new Promise(function(resolve, reject){
        var url = 'https://www.dcard.tw';
        request.get({url: url}, function(err, res, body){
            if(res.statusCode == 200){
                resolve('test OK');
            } else {
                reject('testInternet error');
            }
        });
    });
};

var getCollection = function(){
    var url = 'http://www.dcard.tw/my/collections';
    var headers = {
        cookie: cookie
    };

    return new Promise(function(resolve, reject){
        request.get({url: url, headers: headers}, function(err, res, body){
            if(res.statusCode != 200){
                reject('getCollection error:' + err);
                return;
            }

            var $ = cheerio.load(body);
            var collection = []

            $('strong').each(function(){
                collection.push($(this).text());
            });

            resolve(collection);
        });
    });
};

var login = function(email, password){
    var url = 'https://www.dcard.tw/_api/sessions';

    var headers = {
        'x-csrf-token': CSRFToken,
        'content-type': 'application/json',
        'accept': 'application/json',
        'cookie': cookie
    };

    var form = {
        'email': email,
        'password': password
    };

    return new Promise(function(resolve, reject){
        request.post({url: url, body: JSON.stringify(form), headers: headers}, function(err, res, body){
            if(res.statusCode != 204){
                reject('login error: ' + err);
                return;
            }

            var headers = res.headers;
            var setCookie = headers['set-cookie'];

            CSRFToken = headers['x-csrf-token'];
            cookie = setCookie[0].split(' ')[0] + ' ' + setCookie[1].split(' ')[0];
            resolve('success');
        });
    });

};

var DcardAPI = {
    testInternet: testInternet,
    login: login,
    getAllSchool: getAllSchool,
    getCollection: getCollection
};

module.exports = DcardAPI;
