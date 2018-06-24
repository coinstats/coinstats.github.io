var menu = '';
var scale = 'linear';
var limit = 50;
var currency = 'BTC';
var baseCurrencyOverview = 'USD';
var baseCurrencyDetails = 'USD';
var zoom = '1m';
var chart;
var chartPriceOpen = 0;
var chartPriceClose = 0;
var chartPriceMin = 0;
var chartPriceMax = 0;
var allCurrencies = {};

var currencies = {
	"BTC": [],
	"BCH": [],
	"ETH": [],
	"LTC": ["BCH"],
	"XMR": ["LTC"],
	"NMC": [],
	"AEON": ["XMR"],
    "OMG": [],
    "ICX": [],
    "LINK": [],
    "NEO": [],
    "REQ": []
}

var baseCurrencies = [
	"BTC",
	"USD",
	"EUR"
];
	
var chartOptions = {
	chart: {
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
	},
};

var chartOptionsMobile = Object.assign({}, chartOptions);
chartOptionsMobile['yAxis'] = [{
        visible: true,
		height: '70%',
        opposite: true,
		labels: {
			align: 'left',
		}
    },
    {
        visible: true,
		top: '72%',
		height: '28%',
        opposite: true,
    }
];
chartOptionsMobile['series'] = [{
        type: 'column',
        name: 'Volume',
        yAxis: 1,
        dataGrouping: { enabled: false }
    },
    {
        type: 'candlestick',
        name: 'OHLC',
        yAxis: 0,
        dataGrouping: { enabled: false },
    }
];
chartOptionsMobile['rangeSelector'] = { enabled: false };
chartOptionsMobile['scrollbar'] = { enabled: false };
chartOptionsMobile['navigator'] = { enabled: false };

var chartOptionsDesktop = Object.assign({}, chartOptions);	
chartOptionsDesktop['yAxis'] = [{
        visible: true,
		height: '70%',
        opposite: true,
		labels: {
			align: 'left',
		}
    },
    {
        visible: true,
		top: '72%',
		height: '28%',
        opposite: true,
    }
];
chartOptionsDesktop['series'] = [{
        type: 'column',
        name: 'Volume',
        yAxis: 1,
        dataGrouping: { enabled: false }
    },
    {
        type: 'candlestick',
        name: 'OHLC',
        yAxis: 0,
        dataGrouping: { enabled: false },
    }
];
chartOptionsDesktop['rangeSelector'] = { enabled: true };
chartOptionsDesktop['scrollbar'] = { enabled: true };
chartOptionsDesktop['navigator'] = { enabled: true };
