function loadDetails() {
	chart.showLoading();
	updateSelect();
	$("#details-currency").text(allCurrencies[currency]['name'] + ' (' + currency + '/' + baseCurrencyDetails + ')');
	var url;
	if(zoom == '1m') { url = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + currency + '&tsym=' + baseCurrencyDetails + '&limit=' + (limit - 1) + '&aggregate=1'; }
	if(zoom == '5m') { url = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + currency + '&tsym=' + baseCurrencyDetails + '&limit=' + (limit - 1) + '&aggregate=5'; }
	if(zoom == '10m') { url = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + currency + '&tsym=' + baseCurrencyDetails + '&limit=' + (limit - 1) + '&aggregate=10'; }
	if(zoom == '1h') { url = 'https://min-api.cryptocompare.com/data/histohour?fsym=' + currency + '&tsym=' + baseCurrencyDetails + '&limit=' + (limit - 1) + '&aggregate=1'; }
	if(zoom == '5h') { url = 'https://min-api.cryptocompare.com/data/histohour?fsym=' + currency + '&tsym=' + baseCurrencyDetails + '&limit=' + (limit - 1) + '&aggregate=5'; }
	if(zoom == '10h') { url = 'https://min-api.cryptocompare.com/data/histohour?fsym=' + currency + '&tsym=' + baseCurrencyDetails + '&limit=' + (limit - 1) + '&aggregate=10'; }
	if(zoom == '1d') { url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + currency + '&tsym=' + baseCurrencyDetails + '&limit=' + (limit - 1) + '&aggregate=1'; }
	if(zoom == '3d') { url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + currency + '&tsym=' + baseCurrencyDetails + '&limit=' + (limit - 1) + '&aggregate=3'; }
	if(zoom == '1w') { url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + currency + '&tsym=' + baseCurrencyDetails + '&limit=' + (limit - 1) + '&aggregate=7'; }
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
		chart.hideLoading();
	});
}

function updateChartPrice() {
	var chartPriceDiff = chartPriceClose - chartPriceOpen;
	var chartPriceDiffPercent = (1 - (chartPriceOpen / chartPriceClose)) * 100;
	var sign = '';
	$("#chart-price-diff").removeClass();
	if(chartPriceDiff > 0) {
		sign = '+';
		$("#chart-price-diff").addClass("green");
	}
	if(chartPriceDiff < 0) {
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
	var $navBasecurrency = $("#nav-basecurrency");
	$navBasecurrency.find('option').remove();
	$.each(baseCurrencies, function() {
		$navBasecurrency.append($("<option />").val(this).text(this));
	});
	if(menu == 'overview') {
		$("#nav-basecurrency option[value='" + baseCurrencyOverview + "']").prop('selected', true);
	}
	if(menu == 'details') {
		$.each(currencies[currency], function() {
			$navBasecurrency.append($("<option />").val(this).text(this));
		});
		if(baseCurrencies.indexOf(baseCurrencyDetails) > -1 || currencies[currency].indexOf(baseCurrencyDetails) > -1) {
			$("#nav-basecurrency option[value='" + baseCurrencyDetails + "']").prop('selected', true);
		}
		else {
			changeBaseCurrency(baseCurrencyOverview);
			
		}
	}
	// details chart
	$("#chart-zoom option[value='" + zoom + "']").prop('selected', true);
	$("#chart-limit option[value='" + limit + "']").prop('selected', true);
	$("#chart-scale option[value='" + scale + "']").prop('selected', true);
}

function changeChartZoom(z) {
	zoom = z;
	loadDetails();
}

function changeChartLimit(l) {
	limit = l;
	loadDetails();
}

function changeChartScale(s) {
	scale = s;
	loadDetails();
}

function changeCurrency(c) {
	currency = c;
	clickDetails();
}

async function changeBaseCurrency(c) {
	if(menu == 'overview') {
		baseCurrencyOverview = c;
		changeTitle('coinstats.github.io');
		loadOverview();
	}
	if(menu == 'details') {
		baseCurrencyDetails = c;
		changeTitle(currency + '/' + baseCurrencyDetails + ' - coinstats.github.io');
		loadDetails();
	}
}

function changeTitle(t) {
	document.title = t;
}

async function loadAllCurrencies() {
	var url = "https://min-api.cryptocompare.com/data/all/coinlist";
	await $.getJSON(url, function(data) {
		var baseUrl = data['BaseImageUrl'];
		data = data['Data'];
		$.each(data, function(i, coin) {
			if(Object.keys(currencies).indexOf(i) != -1) {
				allCurrencies[i] = {};
				allCurrencies[i]['symbol'] = coin['Symbol'];
				allCurrencies[i]['name'] = coin['CoinName'];
				allCurrencies[i]['image'] = baseUrl + coin['ImageUrl'];
			}
		});
	});
}

function loadOverview() {
	updateSelect();
	var thead = $("#thead-overview");
	thead.empty();
	var tr = document.createElement('tr');
	$(tr).append($(document.createElement('th')).text('Name'));
	$(tr).append($(document.createElement('th')).text('Price (' + baseCurrencyOverview + ')'));
	$(tr).append($(document.createElement('th')).addClass('md lg xl').text('Marketcap (' + baseCurrencyOverview + ')'));
	$(tr).append($(document.createElement('th')).addClass('sm').text('M.Cap (' + baseCurrencyOverview + ')'));
	$(tr).append($(document.createElement('th')).addClass('md lg xl').text('Volume-24h (' + baseCurrencyOverview + ')'));
	$(tr).append($(document.createElement('th')).addClass('sm').text('Vol.-24h (' + baseCurrencyOverview + ')'));
	$(tr).append($(document.createElement('th')).text('Change-24h'));
	thead.append(tr);
	$("#thead-overview th").click(function() {
		sortTable(this);
	});
	var url = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + Object.keys(currencies) + "&tsyms=" + baseCurrencyOverview;
    $.getJSON(url, function(data) {
		data = data['RAW'];
		var tbody = $("#tbody-overview");
		tbody.empty();
		$.each(data, function(i, coin) {
			tr = document.createElement('tr');
			$(tr).data("currency", i);
			$(tr).append($(document.createElement('td')).data("raw", i).html('<img class="tbody-overview-icon" src="' + allCurrencies[i]['image'] + '" width="16" height="16"> ' + i));
			$(tr).append($(document.createElement('td')).data("raw", coin[baseCurrencyOverview]['PRICE']).text(formatCurrency(coin[baseCurrencyOverview]['PRICE'])));
			$(tr).append($(document.createElement('td')).addClass('md lg xl').data("raw", coin[baseCurrencyOverview]['MKTCAP']).text(formatCurrency(coin[baseCurrencyOverview]['MKTCAP'])));
			$(tr).append($(document.createElement('td')).addClass('sm').data("raw", coin[baseCurrencyOverview]['MKTCAP']).text(shortenLargeNumber(coin[baseCurrencyOverview]['MKTCAP'])));
			$(tr).append($(document.createElement('td')).addClass('md lg xl').data("raw", coin[baseCurrencyOverview]['TOTALVOLUME24HTO']).text(formatCurrency(coin[baseCurrencyOverview]['TOTALVOLUME24HTO'])));
			$(tr).append($(document.createElement('td')).addClass('sm').data("raw", coin[baseCurrencyOverview]['TOTALVOLUME24HTO']).text(shortenLargeNumber(coin[baseCurrencyOverview]['TOTALVOLUME24HTO'])));
			var changepercent = coin[baseCurrencyOverview]['CHANGEPCT24HOUR'];
			var changeClass;
			var changeSign = '';
			if(coin[baseCurrencyOverview]['CHANGEPCT24HOUR'] > 0) {
				changeSign = '+';
				changeClass = 'green';
			}
			if(coin[baseCurrencyOverview]['CHANGEPCT24HOUR'] < 0) {
				changeClass = 'red';
			}
			$(tr).append($(document.createElement('td')).addClass(changeClass).data("raw", coin[baseCurrencyOverview]['CHANGEPCT24HOUR']).text(changeSign +  coin[baseCurrencyOverview]['CHANGEPCT24HOUR'].toFixed(2) + '%'));
			tbody.append(tr);
		});
		$("#tbody-overview tr").click(function() {
			var c = $(this).data("currency");
			changeCurrency(c);
		});
		$("#thead-overview th:nth-child(3)").trigger("click");
	});
}

async function clickOverview() {
	menu = 'overview';
	$('#menu-overview').addClass('nav-menu-active');
	$('#menu-chart').removeClass('nav-menu-active');
	$("#overview-container").show();
	$("#details-container").hide();
	changeTitle('coinstats.github.io');
	loadOverview();
}

function clickDetails() {
	menu = 'details';
	$('#menu-overview').removeClass('nav-menu-active');
	$('#menu-chart').addClass('nav-menu-active');
	$("#overview-container").hide();
	$("#details-container").show();
	changeTitle(currency + '/' + baseCurrencyDetails + ' - coinstats.github.io');
	loadDetails();
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

function shortenLargeNumber(x) { // helper function
	var units = ['K', 'M', 'B', 'T', 'Q' ];
	var decimal;
	for(var i=units.length-1; i>=0; i--) {
		decimal = Math.pow(1000, i+1);
		if(x <= -decimal || x >= decimal) {
			return +(x / decimal).toFixed(2) + units[i];
		}
	}
	return x;
}

$(async function() {
	await loadAllCurrencies();
	
	await loadStates();
	
	clickOverview();
	
	$('#menu-overview').click(function() {
		clickOverview();
	});
	
	$('#menu-chart').click(function() {
		clickDetails();
	});
});

async function loadStates() {
	ssm.addStates([{
			id: 'mobile',
			query: '(max-width: 759px)',
			onEnter: function(){
				if (typeof chart === "undefined") {
					chart = new Highcharts.stockChart('chart', chartOptionsMobile);
				}
				else {
					chart.update(chartOptionsMobile);
				}
				changeChartLimit(50);
			}
		},
		{
			id: 'desktop',
			query: '(min-width: 760px)',
			onEnter: function(){
				if (typeof chart === "undefined") {
					chart = new Highcharts.stockChart('chart', chartOptionsDesktop);
				}
				else {
					chart.update(chartOptionsDesktop);
				}
				changeChartLimit(400);
		}
	}]);
}

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
