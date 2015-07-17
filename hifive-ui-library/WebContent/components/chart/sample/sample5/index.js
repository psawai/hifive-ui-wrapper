/*
 * Copyright (C) 2015 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
(function() {

	var DUMMY_DATA_SIZE = 8;

	function createChartDummyData(size, median, vibration) {
		var ret = ui.sample.chart.createChartDummyData(size, median, vibration);
		for (var i = 0; i < size; i++) {
			ret[i].radian = Math.PI * 2 / size * i;
		}
		return ret;
	}

	var dataSourceManager = h5.ui.components.chart.dataSourceManager;
	
	/**
	 * @class
	 * @memberOF ui.sample.chart
	 */
	var pageController = {
		/**
		 * @memberOf ui.sample.chart.pageController
		 */
		__name: 'ui.sample.chart.pageController',

		/**
		 * データ内の右端のインデックス
		 *
		 * @memberOf ui.sample.chart.pageController
		 */
		_dataIndex: 0,

		/**
		 * 初期幅
		 *
		 * @memberOf ui.sample.chart.pageController
		 */
		_width: 600,

		/**
		 * 初期高さ
		 *
		 * @memberOf ui.sample.chart.pageController
		 */
		_height: 480,

		_dataSources: [],

		// チャートライブラリ
		_chart1Controller: h5.ui.components.chart.ChartController,
		_chart2Controller: h5.ui.components.chart.ChartController,

		__meta: {
			_chart1Controller: {
				rootElement: '#chart1'
			},
			_chart2Controller: {
				rootElement: '#chart2'
			}
		},

		__ready: function(context) {
			this._radarDataSource = dataSourceManager.createDataSource({
				name: 'radar_series_0'
			});
			
			this._radarDataSource.loadData({
				data: ui.sample.chart.createChartDummyData(DUMMY_DATA_SIZE, 5, 5)  // ダミーデータを生成
			}).done(this.own(function() {
				this._drawRadar(this._radarDataSource);
			}));

			this._arcDataSource = dataSourceManager.createDataSource({
				name: 'arc_series_0'
			});
			
			this._arcDataSource.loadData({
				data: createChartDummyData(10, 5, 5)  // ダミーデータを生成
			}).done(this.own(function() {
				this._drawArc(this._arcDataSource);
			}));	
		},
		
		_drawRadar: function(dataSource) {
			var color = ui.sample.chart.getRandomColor();
			this._chart1Controller.draw({
				chartSetting: {
					width: this._width,
					height: this._height
				},
				axes: {
					axis: {
						interval: 2,
						num: DUMMY_DATA_SIZE,
						shape: 'polygon'
					}
				},
				seriesDefault: { // すべての系列のデフォルト設定
					// 表示データ数
					mouseover: {
						tooltip: {
							content: this.own(this._getTooltipContent)
						}
					},
					range: {
						minVal: 0,
						maxVal: 10
					}
				},
				// 系列データ
				series: [{
					name: dataSource.name, //系列名(キーとして使用する)
					type: 'radar',
					data: dataSource, 
					propNames: {
						'y': 'val'
					},
					color: color,
					fillColor: color
				}]
			});
		},

		_drawArc: function(dataSource) {
			var color = ui.sample.chart.getRandomColor();
			this._chart2Controller.draw({
				chartSetting: {
					width: this._width,
					height: this._height
				},
				axes: {
					axis: {
						interval: 2,
						num: DUMMY_DATA_SIZE,
						shape: 'circle'
					}
				},
				seriesDefault: { // すべての系列のデフォルト設定
					// 表示データ数
					mouseover: {
						tooltip: {
							content: this.own(this._getTooltipContent)
						}
					},
					range: {
						minVal: 0,
						maxVal: 10
					}
				},
				// 系列データ
				series: [{
					name: dataSource.name, //系列名(キーとして使用する)
					type: 'arc',
					data: dataSource, 
					propNames: {
						'radius': 'val'
					},
					color: color,
					fillColor: color
				}]
			});
		},

		_getTooltipContent: function(data) {
			return data.label + ':' + data.val.toString();
		},
		
		'button click': function() {
			this._radarDataSource.manager.beginUpdate();
			this._radarDataSource.removeAll();
			this._radarDataSource.addAll(ui.sample.chart.createChartDummyData(DUMMY_DATA_SIZE, 5, 5));
			this._radarDataSource.manager.endUpdate();

			this._arcDataSource.manager.beginUpdate();
			this._arcDataSource.removeAll();
			this._arcDataSource.addAll(createChartDummyData(10, 5, 5));
			this._arcDataSource.manager.endUpdate();
		}
	};

	h5.core.expose(pageController);
})();

$(function() {
	h5.core.controller('body', ui.sample.chart.pageController);
});