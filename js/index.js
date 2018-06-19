var scale = 'linear';
var limit = 50;
var currency = 'BTC';
var baseCurrency = 'USD';
var zoom = '1m';
var chart;
var chartPriceOpen = 0;
var chartPriceClose = 0;
var chartPriceMin = 0;
var chartPriceMax = 0;
var allCurrencies = {};

var currencies = [
	"BTC",
	"BCH",
	"ETH",
	"LTC",
	"XMR",
	"NMC",
	"AEON",
    "OMG",
    "ICX",
    "LINK",
    "NEO",
    "REQ"
];

var baseCurrencies = [
	"BTC",
	"USD",
	"EUR"
];

var options = {
	chart: {
		events: {
			load:  function() {
				chart = this;
				requestData();
			}
		},
		zoomType: 'xy',
		//Should use resetZoomButton to reset zoom
		//However, button does not show up see issue https://github.com/highcharts/highcharts/issues/8200
		//Workaround
		pinchType: '',
	},
	noData: {
		style: {
			fontWeight: 'bold',
			fontSize: '15px'
		}
	},
	
	plotOptions: {
		series: {
			softThreshold: true,
			animation: false
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
			s += "<b>Open:</b> " + formatCurrency(this.points[1].point.open) + "<br/>";
			s += "<b>High:</b> " + formatCurrency(this.points[1].point.high) + "<br/>";
			s += "<b>Low:</b> " + formatCurrency(this.points[1].point.low) + "<br/>";
			s += "<b>Close:</b> " + formatCurrency(this.points[1].point.close) + "<br/>";
			s += "<span style='font-size:3px;color:transparent;opacity:0'>paragraph</span><br/>";
			s += "<b>Change:</b> " + Number((1 - (this.points[1].point.open / this.points[1].point.close)) * 100).toFixed(2) + "%<br>";
			s += "<b>Amplitude:</b> " + Number((1 - (this.points[1].point.low / this.points[1].point.high)) * 100).toFixed(2) + "%<br>";
			s += "<span style='font-size:3px;color:transparent;opacity:0'>paragraph</span><br/>";
			s += "<b>Volume:</b> " + formatCurrency(this.points[0].y) + "<br/>";
			return s;
		},
		split: false
	},

	exporting: {
		enabled: false
	},

	credits: {
		enabled: false
	}
};

function requestData() {
	chart.showLoading();
	var url;
	if(zoom == '1m') { url = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=1'; }
	if(zoom == '5m') { url = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=5'; }
	if(zoom == '10m') { url = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=10'; }
	if(zoom == '1h') { url = 'https://min-api.cryptocompare.com/data/histohour?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=1'; }
	if(zoom == '5h') { url = 'https://min-api.cryptocompare.com/data/histohour?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=5'; }
	if(zoom == '10h') { url = 'https://min-api.cryptocompare.com/data/histohour?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=10'; }
	if(zoom == '1d') { url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=1'; }
	if(zoom == '3d') { url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=3'; }
	if(zoom == '1w') { url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + currency + '&tsym=' + baseCurrency + '&limit=' + (limit - 1) + '&aggregate=7'; }
	$.getJSON(url, function(data) {
		data = data['Data'];
		// split the data set into ohlc and volume
		var ohlc = [],
			volume = [],
			dataLength = data.length;
		
		chartPriceOpen = 0;
		chartPriceClose = 0;
		chartPriceMin = 0;
		chartPriceMax = 0;
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
				
				if(chartPriceOpen == 0) {
					chartPriceOpen = data[i]['open'];
				}
				chartPriceClose = data[i]['close'];
				if(chartPriceMin == 0 || chartPriceMin > data[i]['low']) {
					chartPriceMin = data[i]['low'];
				}
				if(chartPriceMax == 0 || chartPriceMax < data[i]['high']) {
					chartPriceMax = data[i]['high'];
				}
			}
		}
		chart.yAxis[0].update({type: scale});
		chart.xAxis[0].setExtremes();
		chart.series[1].setData(ohlc, false);
		chart.series[0].setData(volume, false);
		chart.redraw();
		updateChartPrice();
		updateSelect();
		chart.hideLoading();
	});
}

function updateChartPrice() {
	var chartPriceDiff = chartPriceClose - chartPriceOpen;
	var chartPriceDiffPercent = (1 - (chartPriceOpen / chartPriceClose)) * 100;
	var sign = '';
	if(chartPriceDiff > 0) {
		sign = '+';
		$("#chart-price-diff").removeClass();
		$("#chart-price-diff").addClass("green");
	}
	else {
		$("#chart-price-diff").removeClass();
		$("#chart-price-diff").addClass("red");
	}
	var diff = sign + formatCurrency(chartPriceDiff) + ' (' + sign + chartPriceDiffPercent.toFixed(2) + '%)';
	
	$("#chart-price-close").text(formatCurrency(chartPriceClose));
	$("#chart-price-diff").text(diff);
	$("#chart-price-min").text(formatCurrency(chartPriceMin));
	$("#chart-price-max").text(formatCurrency(chartPriceMax));
}

function updateSelect() {
	// basecurrency
	$("#nav-basecurrency option[value='" + baseCurrency + "']").prop('selected', true);
	// details chart
	$("#chart-zoom option[value='" + zoom + "']").prop('selected', true);
	$("#chart-limit option[value='" + limit + "']").prop('selected', true);
	$("#chart-scale option[value='" + scale + "']").prop('selected', true);
}

function changeChartZoom(z) {
	zoom = z;
	requestData();
}

function changeChartLimit(l) {
	limit = l;
	requestData();
}

function changeChartScale(s) {
	scale = s;
	requestData();
}

function changeCurrency(c) {
	currency = c;
	toggleOverviewDetails();
	$("#details-currency").text(allCurrencies[currency]['name']);
	requestData();
}

function changeBaseCurrency(c) {
	baseCurrency = c;
	loadOverview();
	requestData();
}

function loadAllCurrencies() {
	var url = "https://min-api.cryptocompare.com/data/all/coinlist";
	$.getJSON(url).then( function(data) { // then does not work
		var baseUrl = data['BaseImageUrl'];
		data = data['Data'];
		$.each(data, function(i, coin) {
			if(currencies.indexOf(i) != -1) {
				allCurrencies[i] = {};
				allCurrencies[i]['symbol'] = coin['Symbol'];
				allCurrencies[i]['name'] = coin['CoinName'];
				allCurrencies[i]['image'] = baseUrl + coin['ImageUrl'];
			}
		});
	});
}

function loadOverview() {
	var thead = $("#thead-overview");
	thead.empty();
	var tr = document.createElement('tr');
	tr.appendChild(document.createElement('th'));
	tr.appendChild(document.createElement('th'));
	tr.appendChild(document.createElement('th'));
	tr.appendChild(document.createElement('th'));
	tr.cells[0].appendChild(document.createTextNode('Name'));
	tr.cells[1].appendChild(document.createTextNode('Price (' + baseCurrency + ')'));
	tr.cells[2].appendChild(document.createTextNode('Marketcap (' + baseCurrency + ')'));
	tr.cells[3].appendChild(document.createTextNode('24h-Volume (' + baseCurrency + ')'));
	thead.append(tr);
	var url = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + currencies.toString() + "&tsyms=" + baseCurrency;
    $.getJSON(url).then( function(data) { // then does not work
		data = data['RAW'];
		var tbody = $("#tbody-overview");
		tbody.empty();
		$.each(data, function(i, coin) {
			tr = document.createElement('tr');
			$(tr).data("currency", i);
			$(tr).append($(document.createElement('td')).data("raw", i).html('<img class="tbody-overview-icon" src="' + allCurrencies[i]['image'] + '" width="16" height="16"> ' + i));
			$(tr).append($(document.createElement('td')).data("raw", coin[baseCurrency]['PRICE']).text(formatCurrency(coin[baseCurrency]['PRICE'])));
			$(tr).append($(document.createElement('td')).data("raw", coin[baseCurrency]['MKTCAP']).text(formatCurrency(coin[baseCurrency]['MKTCAP'])));
			$(tr).append($(document.createElement('td')).data("raw", coin[baseCurrency]['TOTALVOLUME24HTO']).text(formatCurrency(coin[baseCurrency]['TOTALVOLUME24HTO'])));
			tbody.append(tr);
		});
		$("#tbody-overview tr").click(function() {
			var c = $(this).data("currency");
			changeCurrency(c);
		});
	});
}

async function toggleOverviewDetails() {
	await loadOverview();
	$("#overview-container").toggle();
	$("#details-container").toggle();
}

function toggleSettings() {
	$("#settings-container").slideToggle();
}

function formatCurrency(x) { // helper function
	if(x >= 10) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}); }
	else if(x > 1) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}); }
	else if(x == 1) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}); }
	else if(x >= 0.1) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4}); }
	else if(x >= 0.01) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 5, maximumFractionDigits: 5}); }
	else if(x >= 0.001) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 6, maximumFractionDigits: 6}); }
	else if(x >= 0.0001) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 7, maximumFractionDigits: 7}); }
	else if(x > 0) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 8, maximumFractionDigits: 8}); }
	else if(x == 0) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}); }
	
	else if(x <= -10) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}); }
	else if(x < -1) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}); }
	else if(x == -1) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}); }
	else if(x <= -0.1) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4}); }
	else if(x <= -0.01) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 5, maximumFractionDigits: 5}); }
	else if(x <= -0.001) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 6, maximumFractionDigits: 6}); }
	else if(x <= -0.0001) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 7, maximumFractionDigits: 7}); }
	else if(x < -0) { x = Number(x).toLocaleString('en-US', {minimumFractionDigits: 8, maximumFractionDigits: 8}); }

	return x;
}

async function init() {
	console.log("1");
	await loadAllCurrencies();
	console.log("2");
	await loadOverview();
	console.log("3");
}

$(function() {
	if(ssm.isActive('mobile')){
        setMobileOptions();
    }else{
        setDesktopOptions();
    }
	
	init();

	$('th').click(function() {
		sortTable(this);
	});
	
	$('#details-goback').click(function() {
		toggleOverviewDetails();
	});
	
	chart = new Highcharts.stockChart('chart', options);
	
	$('#nav-settings').click(function(e) {
		toggleSettings();
	});
});

ssm.addStates([{
        id: 'mobile',
        query: '(max-width: 500px)',
        onEnter: function(){
            if (typeof chart !== "undefined"){
                setMobileOptions();
                chart = new Highcharts.stockChart('chart', options);
                requestData();
            }
        }
    },
    {
        id: 'desktop',
        query: '(min-width: 501px)',
        onEnter: function(){
            if (typeof chart !== "undefined"){
                setDesktopOptions();
                chart = new Highcharts.stockChart('chart', options);
                requestData();
            }
     }
}]);

function setDesktopOptions(){
    limit = 500;
    options['yAxis'] = [
            {
                title: {
                    text: 'OHLC'
                },
                height: '60%',
                lineWidth: 2,
                offset: 20,
                opposite: true
            }, 
            {
                title: {
                    text: 'Volume'
                },
                top: '65%',
                height: '35%',
                offset: 20,
                lineWidth: 2,
                opposite: true
            }
    ];
    options['series'] = [{
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
        }
    ];
    options['rangeSelector'] = { enabled: true }
    options['scrollbar'] = { enabled: true }
    options['navigator'] = { enabled: true }
 };

function setMobileOptions(){
    limit = 50;
    options['yAxis'] = [{
            visible: true,
            opposite: false,
        },
        {
            visible: true,
            opposite: true,
        }
    ];
    options['series'] = [{
            type: 'column',
            name: 'Volume',
            yAxis: 0,
            dataGrouping: { enabled: false }
        },
        {
            type: 'candlestick',
            name: 'OHLC',
            yAxis: 1,
            dataGrouping: { enabled: false },
        }
    ];
    options['rangeSelector'] = { enabled: false }
    options['scrollbar'] = { enabled: false }
    options['navigator'] = { enabled: false }
};

function sortTable(th) {
	var table = $(th).parents('table').eq(0);
	var rows = table.find('tr:gt(0)').toArray().sort(comparer($(th).index()));
	$(th).siblings("th").removeData("sort");
	if($(th).data("sort") === undefined) {
		$(th).data("sort", "desc");
		rows = rows.reverse();
	}
	else if($(th).data("sort") == "asc") {
		$(th).data("sort", "desc");
		rows = rows.reverse();
	}
	else if($(th).data("sort") == "desc") {
		$(th).data("sort", "asc");
	}
	var i = 0;
	var length = rows.length;
	for(i = 0; i < length; i++) {
		table.append(rows[i]);
	}
}
function comparer(index) {
	return function(a, b) {
		var valA = getCellValue(a, index);
		var valB = getCellValue(b, index);
		return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB);
	}
}
function getCellValue(row, index) {
	return $(row).children('td').eq(index).data("raw");
}
