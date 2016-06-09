/**
 * Created by sergeiborzov on 03/11/15.
 */

var currencies = require('../models/currencies');

currencies.update();
setInterval(function(){
	currencies.update();
},3600000);


module.exports = function(req, res, next){
	res.json(currencies.getValues());
};