var http = require('http');

var kazRegex = /RUR.+(\d\d\.\d\d\.\d\d).+>(\d+\.\d+).+>(.+\d).+EUR/;
var uzRegex = />(\d+-\d+-\d+).+rate>(\d+\.\d+)/;
var azRegex = /Date="(.+?)".+RUB.+?(\d+\.\d+)/;
var usdRegex = /Date="(.+?)"[^]+USD[^]+?Value>(\d+,\d+)/;
var eurRegex = /Date="(.+?)"[^]+EUR[^]+?Value>(\d+,\d+)/;


var data = '';

http.get('http://www.cbu.uz/section/rates/widget/xml/rub/' , function (res) {
	res.on('data', function (chunk) {
		data += chunk;
	});
	res.on('end', function () {
		console.log(data.match(uzRegex));
	})
}).on('error', function (err) {
	console.log(err);
});
