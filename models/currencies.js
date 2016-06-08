'use strict';
var http = require('http');
var https = require('https');
var xml = require('xml2js');
var fs = require('fs');
var path = require('path');
var data = '',
	rates = {},
	currencies = JSON.parse(fs.readFileSync(path.join(__dirname, '../currencies.json').toString())),
	forexUrl = 'https://query.yahooapis.com/v1/public/yql?q=select+*+from+yahoo.finance.xchange+where+pair+=+%22USDRUB%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';

delete currencies['UZS'];

function getForexData(){
	var data = '';
	https.get(forexUrl, function(res){
		res.on('data', (chunk) => data += chunk);
		res.on('end', function(){
			try{
				var obj = JSON.parse(data);
				var dateString = obj.query.results.rate.Date.replace(/\//g,'.');
				var dateArr = dateString.split('.');
				if (dateArr[1].length == 1){
					dateArr[1] = '0' + dateArr[1];
				}
				dateString = dateArr[1] + '.' + dateArr[0] + '.' + dateArr[2];
				rates['FRX'] = {
					rate: obj.query.results.rate.Rate.slice(0, -2),
					date: dateString,
					nominal: '1',
					name: 'Биржевой курс (Forex)',
					pair: 'RUB / USD'
				}
			}catch (e){
				console.log(e + " forex");
				return;
			}


		})
	}).on('error', function(err){
		console.log(err);
	});
}

/*function Currencie(){
	this.url=""
	this.rate=null;
	this.name="";
	this.update_at=new Date(Date.now());
	this.raw_data="";
}
Currencie.prototype.get=function(){
	this.raw_data=JSON.parse(http.SyncGet(this.url));
}
Currencie.prototype.parse=null
function Dollar(){
	this.name="USD"
}
Dollar.prototype=Currencie.prototype
Dollar.prototype.parse=function(){

}*/
function formatDate(date, country) {
	var dd = date.getDate();
	if (dd < 10) dd = '0' + dd;

	var mm = date.getMonth() + 1;
	if (mm < 10) mm = '0' + mm;

	var yy = date.getFullYear();

	switch(country){
		case 'UZS':
			return yy + '.' + mm + '.' + dd;
		case 'AZN':
			return dd + '.' + mm + '.' + yy;
		case 'EUR':
		case 'USD':
			return dd + '/' + mm + '/' + yy;
	}
}

function getRate(key, day){
	return new Promise(function(resolve, reject){
		var data = '',
				date = new Date(),
				source = currencies[key].sources[currencies[key].current];

		if (day == 'latest') date.setDate(date.getDate()+1);
		if (day == 'yesterday'){
			switch (date.getDay()){
				case 1:
					date.setDate(date.getDate()-3);
					break;
				case 7:
					date.setDate(date.getDate()-2);
					break;
				default :
					date.setDate(date.getDate()-1);
			}

		}

		var	url = source.url + formatDate(date, key) + '.xml';
		console.log(url);
		if (key == 'KZT') url = source.url;
		http.get(url , function (res) {

			res.on('data', (chunk) => data += chunk);

			res.on('end', function () {
				var result = data.match(new RegExp(source.regex));
				try{
					result[1] = result[1].replace(/[/-]/g, '.').match(/\d+\.\d+\.\d+/g)[0];
					result[2] = result[2].replace(',','.');

					if(result[3] && day === 'yesterday'){
						result[2] = parseFloat(result[2]) - parseFloat(result[3]);

					}

					if(source.inverted === '1'){
						result[2] = (Math.round(100 * parseInt(currencies[key].nominal) / result[2])/ 100).toFixed(2);
					}else{
						result[2] = (Math.round(100 * parseInt(currencies[key].nominal) * result[2])/ 100).toFixed(2);
					}

					(result === null) ? reject(new Error('No match')) : resolve(result);
				}catch (err){
					reject(new Error("Error with " + key));
				}


			})
		}).on('error', function (err) {
			reject(err);
		});
	});
}



module.exports = {
	update: function(){
		for (let key in currencies){
			getRate(key, 'latest').then(
				function(result){
					rates[key] = {
						rate: result[2],
						date: result[1],
						nominal: currencies[key].nominal,
						name: currencies[key].sources[currencies[key].current].name,
						pair: currencies[key].sources[currencies[key].current].pair
					};
				}
			).catch(err => console.log(err));
		}
		getForexData();
	},
	getValues: function(){
		return rates;
	}
};
