/* jshint browser: true, jquery: true */
/* global h5 */

(function($) {
	'use strict';

	var datagrid = h5.ui.components.datagrid;
	var cellFormatter = datagrid.view.dom.cellFormatter;
	var changeHandler = datagrid.view.dom.changeHandler;

	var log = h5.log.createLogger('sample');

	function random(n) {
		return Math.floor(Math.random() * n);
	}

	function randomValue(array) {
		var i = random(array.length);
		return array[i];
	}

	function multiply(param) {
		return param.price * param.num;
	}

	function ratio(param) {
		var result = param.old_price / param.price;
		return parseFloat(result.toFixed(2));
	}

	var pageController = {

		// --- Metadata --- //

		__name: 'PageController',

		__meta: {
			_synchronizedController: {
				rootElement: '#grid'
			},

			_numSummaryController: {
				rootElement: '#summary'
			}
		},

		// --- Child Controller --- //

		_synchronizedController: datagrid.wrapper.SynchronizedController,

		_numSummaryController: datagrid.GridController,


		// --- Life Cycle Method --- //

		__ready: function() {

			var names = ['Taro', 'Hanako', 'Jiro'];
			var synchronizedArray = [];
			var numSummaryArray = [];
			var sum = 0;
			for (var i = 0; i < 100; i++) {
				var price = random(100) + 1;
				var old_price = random(100) + 1;
				var num = random(10) + 1;
				var total = multiply({
					price: price,
					num: num
				});
				var rate = ratio({
					old_price: old_price,
					price: price
				});
				sum = sum + num;
				synchronizedArray.push({
					id: String(i),
					name: randomValue(names),
					old_price: old_price,
					price: price,
					num: num,
					total: total,
					rate: rate
				});
			}
			numSummaryArray.push({
				id: '0',
				summary: sum
			});

			var synchronizedParam = {
				searcher: {
					type: 'all'
				},

				mapper: {
					type: 'property',
					param: {
						direction: 'vertical',
						visibleProperties: {
							header: ['_select', 'id'],
							main: ['name', 'old_price', 'price', 'num', 'total', 'rate']
						},

						dataDirectionSize: {
							size: 20
						}
					}
				},

				view: {
					type: 'table',
					param: {
						cellClassDefinition: {
							highScore: function(cell) {
								if (cell.editedData == null || cell.editedData.price == null) {
									return false;
								}
								return 80 <= cell.editedData.price;
							},

							editedCell: function(cell) {
								return cell.editedValue !== cell.originalValue;
							}
						},

						disableInput: function() {
							return false;
						},

						enableMoveRow: true,
						trackRowMoveColumn: 'id',
						selectRangeAction: 'dynamic',

						sortAscIconClasses: ['aaaaaa'],
						sortDescIconClasses: [],
						sortClearIconClasses: []
					}
				},

				properties: {
					_select: {
						size: 25,
						enableResize: false,
						toValue: function(data, cell) {
							return cell.isSelectedData;
						},

						formatter: cellFormatter.checkbox(true),
						changeHandler: changeHandler.selectData()
					},

					id: {
						size: 50
					},

					name: {
						formatter: cellFormatter.select(['Taro', 'Jiro', 'Hanako']),
						changeHandler: changeHandler.edit(),
						sortable: true,
						filter: ['Taro', 'Jiro', 'Hanako']
					},

					old_price: {
						formatter: cellFormatter.input('text'),
						changeHandler: changeHandler.edit(parseInt),
						sortable: true
					},

					price: {
						formatter: cellFormatter.input('text'),
						changeHandler: changeHandler.edit(parseInt),
						sortable: true
					},

					num: {
						formatter: cellFormatter.input('text'),
						changeHandler: this.own(function(context, $el, cell) {
							this._changeValue(context, cell, parseInt);
						}),
						sortable: true
					}
				},

				relation: [{
					sourceColumn: ['price', 'num'],
					relatedColumn: 'total',
					relativeFunction: multiply
				}, {
					sourceColumn: ['old_price', 'price'],
					relatedColumn: 'rate',
					relativeFunction: ratio
				}]
			};

			var synchronizedDataSource = datagrid.createDataSource({
				idProperty: 'id',
				type: 'local',
				param: synchronizedArray
			});

			this._synchronizedController.activate(synchronizedDataSource, synchronizedParam);

			datagrid.util.delay(1000, this.own(function() {
				this._synchronizedController.getGridController().search({});
			}));

			var numSummaryParam = {
				searcher: {
					type: 'all'
				},

				mapper: {
					type: 'property',
					param: {
						direction: 'vertical',
						visibleProperties: {
							header: [],
							main: ['summary']
						},

						dataDirectionSize: {
							size: 20
						}
					}
				},

				view: {
					type: 'table',
					param: {
						cellClassDefinition: {
							editedCell: function(cell) {
								return cell.editedValue !== cell.originalValue;
							}
						}
					}
				},

				properties: {
					id: {
						size: 50
					},

					summary: {

					}
				},
			};

			var numSummaryDataSource = datagrid.createDataSource({
				idProperty: 'id',
				type: 'local',
				param: numSummaryArray
			});

			this._numSummaryController.activate(numSummaryDataSource, numSummaryParam);

			datagrid.util.delay(1000, this.own(function() {
				this._numSummaryController.search({});
			}));
		},


		// --- Event Handler --- //

		'.gridCellFrame mousedown': function(context, $el) {
			var row = $el.data('h5DynGridRow');
			log.info('click row={0}', row);
		},

		'{window} resize': function() {
			this._columnController.refresh();
		},
		
		'{rootElement} gridMoveRowComplete': function(context) {
			var dataId = context.evArg.dataId;
			log.info('move dataId={0}', dataId);
		},


		// --- Private Method --- //

		_changeValue: function(context, cell, func) {
			
			var $target = $(context.event.target);

			var value = func($target.val());

			if (typeof value === 'undefined') {
				return;
			}

			var oldData = cell.editedData;
			var propertyName = cell.propertyName;

			var oldValue = oldData[propertyName];
			if (datagrid.util.deepEquals(oldValue, value)) {
				return;
			}

			var synchronizedDataSource = this._synchronizedController.getDataSource();

			var builder = synchronizedDataSource.commandBuilder();
			builder.replaceValue(oldData, propertyName, value);
			var command = builder.toCommand();

			// current cellの編集をデータソースに反映します
			synchronizedDataSource.edit(command);

			var numSummaryDataSource = this._numSummaryController.getDataSource();
			var dataSet = synchronizedDataSource.getReplacedDataSet();
			var sourceDataArray = synchronizedDataSource.getDataAccessor().getSourceDataArray();
			var summary = 0;
			for (var i = 0; i < sourceDataArray.length; i++) {
				var isEdit = false;
				var editedData;
				for ( var index in dataSet) {
					if (sourceDataArray[i].id === dataSet[index].edited.id) {
						isEdit = true;
						editedData = dataSet[index].edited;
						break;
					}
				}
				if (isEdit) {
					summary = summary + editedData.num;
				} else {
					summary = summary + sourceDataArray[i].num;
				}
			}

			var originSummary;
			if (numSummaryDataSource.hasChange()) {
				originSummary = numSummaryDataSource.getReplacedDataSet()[0].edited.summary;
			} else {
				originSummary = numSummaryDataSource.getDataAccessor().getSourceDataArray()[0].summary;
			}

			builder = numSummaryDataSource.commandBuilder();
			builder.replaceValue({
				id: '0',
				summary: originSummary
			}, 'summary', summary);
			command = builder.toCommand();

			//　連動Gridの変わるもデータソースに反映します
			numSummaryDataSource.edit(command);
		}

	};

	$(function() {
		h5.core.controller('body', pageController);
	});

})(jQuery);