
$(function(){

	var months = [
			'',
			'Января',
			'Февраля',
			'Марта',
			'Апреля',
			'Мая',
			'Июня',
			'Июля',
			'Августа',
			'Сентября',
			'Октября',
			'Ноября',
			'Декабря'
	];

	function updateRates(){
		$.ajax({
			url: '/data'
		})
			.done(function(data){
				console.log(data);
				if (!data) return;
				for(var key in data){
					var dateString = data[key].date.split('.')[0] + ' ' + months[parseInt(data[key].date.split('.')[1])];
					$('#' + key + 'Name').html(data[key].pair);
					$('#' + key + 'UpdateDate').html(dateString);
					$('#' + key + 'Value').html(data[key].rate);
					$('#' + key + 'SourceDiv').html(data[key].name);
				}


			});
	}

updateRates();

setInterval(updateRates, 300000)

});

