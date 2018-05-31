var scale = 'linear';
var limit = 25;
var currency = 'BTC';
var baseCurrency = 'USD';
var zoom = '1m';
var chart;

var options = {
	chart: {
		events: {
			load:  function() {
				chart = this,
				requestData('1m');
			}
		}
	},
	
	rangeSelector: {
		enabled: false
	},
	
	scrollbar: {
		enabled: false
	},
	
	navigator: {
		enabled: false
	},
	
	yAxis: [{
		title: {
			text: ''
        },
        offset: 35
	},
	{
		visible: false
	}],
	
	plotOptions: {
		series: {
			softThreshold: true
		},
		candlestick: {
			color: '#d82e2e',
			lineColor: '#d82e2e',	    		
			upLineColor: '#4dd82d',
			upColor: '#4dd82d'
		}
	},
	
	tooltip: {
		backgroundColor: {
			linearGradient: {
				x1: 0,
				y1: 0,
				x2: 0,
				y2: 1
			},
			stops: [
				[0, 'white'],
				[1, '#EEE']
			]
		},
		borderColor: 'gray',
		borderWidth: 1,
		shared: true,
		followPointer: true,
		formatter: function () {
			var s;
			s = Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', new Date(this.x)) + "<br/>";
			s += "<span style='font-size:3px;color:transparent;opacity:0'>paragraph</span><br/>";
			s += "<b>Open:</b> " + this.points[1].point.open.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 8}) + "<br/>";
			s += "<b>High:</b> " + this.points[1].point.high.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 8}) + "<br/>";
			s += "<b>Low:</b> " + this.points[1].point.low.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 8}) + "<br/>";
			s += "<b>Close:</b> " + this.points[1].point.close.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 8}) + "<br/>";
			s += "<span style='font-size:3px;color:transparent;opacity:0'>paragraph</span><br/>";
			s += "<b>Volume:</b> " + this.points[0].y.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 8}) + "<br/>";
			return s;
		},
		split: false
	},
	
	series: [{
		type: 'column',
		name: 'Volume',
		yAxis: 1,
		dataGrouping: {
			enabled: false
		}
	},
	{
		type: 'candlestick',
		name: 'OHLC',
		yAxis: 0,
		dataGrouping: {
			enabled: false
		}
	}],
	
	exporting: {
		enabled: false
	},
	
	credits: {
		enabled: false
	}
};

function requestData(z) {
	zoom = z;
	var url;
	if(z == '1m') { url = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=1'; }
	if(z == '5m') { url = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=5'; }
	if(z == '10m') { url = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=10'; }
	if(z == '1h') { url = 'https://min-api.cryptocompare.com/data/histohour?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=1'; }
	if(z == '5h') { url = 'https://min-api.cryptocompare.com/data/histohour?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=5'; }
	if(z == '10h') { url = 'https://min-api.cryptocompare.com/data/histohour?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=10'; }
	if(z == '1d') { url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=1'; }
	if(z == '3d') { url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=3'; }
	if(z == '1w') { url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=7'; }
	$.getJSON(url, function(data) {
		data = data['Data'];
		// split the data set into ohlc and volume
		var ohlc = [],
			volume = [],
			dataLength = data.length;
		
		for (i = 0; i < dataLength; i++) {
			if(data[i]['low'] > 0) {
				ohlc.push([
					data[i]['time'] * 1000, // timestamp in milliseconds
					data[i]['open'], // open
					data[i]['high'], // high
					data[i]['low'], // low
					data[i]['close'] // close
				]);
				
				volume.push([
					data[i]['time'] * 1000, // timestamp in milliseconds
					data[i]['volumeto'] // volume
				]);
			}
		}
		chart.yAxis[0].update({type: scale});
		chart.xAxis[0].setExtremes();
		chart.series[1].setData(ohlc, false);
		chart.series[0].setData(volume, false);
		chart.redraw();
		updateSelect();
	});
}

function updateSelect() {
	// currencies
	$("#select-currency option[value='" + currency + "']").prop('selected', true);
	$("#select-basecurrency option[value='" + baseCurrency + "']").prop('selected', true);
	// settings
	$('input[type=radio][name=radio-scale]').filter('[value=' + scale + ']').prop('checked', true);
	$('input[type=radio][name=radio-zoom]').filter('[value=' + zoom + ']').prop('checked', true);
	$('input[type=radio][name=radio-limit]').filter('[value=' + limit + ']').prop('checked', true);
}

function changeScale(s) {
	scale = s;
	requestData(zoom);
}

function changeZoom(z) {
	zoom = z;
	requestData(zoom);
}

function changeLimit(l) {
	limit = l;
	requestData(zoom);
}

function changeCurrency(c) {
	if(baseCurrency == c) { // currency == basecurrency
		alert("ERROR: " + c + "/" + baseCurrency + " not possible.");
		updateSelect();
		return;
	}
	currency = c;
	requestData(zoom);
}

function changeBaseCurrency(c) {
	if(currency == c) { // currency == basecurrency
		alert("ERROR: " + currency + "/" + c + " not possible.");
		updateSelect();
		return;
	}
	baseCurrency = c;
	requestData(zoom);
}

function toggleSettings() {
	$("#settings-container").slideToggle();
}

$(function() {
	chart = new Highcharts.stockChart('chart', options);

	$('#settings-icon').click(function(e) {
		toggleSettings();
	});
	
	$('input[type=radio][name=radio-scale]').change(function () {
		changeScale(this.value);
	});
	
	$('input[type=radio][name=radio-zoom]').change(function () {
		changeZoom(this.value);
	});
	
	$('input[type=radio][name=radio-limit]').change(function () {
		changeLimit(this.value);
	});
});
