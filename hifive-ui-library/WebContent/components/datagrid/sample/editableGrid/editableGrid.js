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

	function myFunc(param) {
		return param.price * param.num;
	}

	function myFunc1(param) {
		var result = param.old_price / param.price;
		return parseFloat(result.toFixed(2));
	}

	function edit(context, $el, cell, controller, func) {
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

		var dataSource = controller.getDataSource();

		var builder = dataSource.commandBuilder();
		builder.replaceValue(oldData, propertyName, value);
		var command = builder.toCommand();

		dataSource.edit(command);
	}

	var pageController = {

		// --- Metadata --- //

		__name: 'PageController',

		__meta: {
			_columnController: {
				rootElement: '#grid'
			},

			_summaryController: {
				rootElement: '#summary'
			}
		},

		// --- Child Controller --- //

		_columnController: datagrid.wrapper.ColumnController,

		_summaryController: datagrid.wrapper.SummaryController,


		// --- Life Cycle Method --- //

		__ready: function() {

			var names = ['Taro', 'Hanako', 'Jiro'];
			var sourceArray = [];
			var summaryArray = [];
			var sum = 0;
			for (var i = 0; i < 10000; i++) {
				var price = random(100) + 1;
				var old_price = random(100) + 1;
				var num = random(10) + 1;
				sum = sum + num;
				sourceArray.push({
					id: String(i),
					name: randomValue(names),
					old_price: old_price,
					price: price,
					num: num,
					total: myFunc({
						price: price,
						num: num
					}),
					rate: myFunc1({
						old_price: old_price,
						price: price
					})
				});
			}
			summaryArray.push({
				id: '0',
				summary: sum
			});

			var param = {
				searcher: {
					type: 'all'
				},

				mapper: {
					type: 'property',
					param: {
						direction: 'vertical',
						visibleProperties: {
							header: ['_select', 'id'],
							main: ['name', 'old_price', 'price', 'num', 'hoge', 'total', 'rate']
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
						changeHandler: function(context, $el, cell) {
							this.trigger('valueChange', {
								context: context,
								$el: $el,
								cell: cell,
								func: parseInt
							});
						},
						sortable: true
					},

					hoge: {
						size: 150,
						toValue: function() {
							return 'hoge';
						},

						sortable: true,
						sortProperty: 'id'
					}
				},

				relation: [{
					sourceColumn: ['price', 'num'],
					relatedColumn: 'total',
					relativeFunction: myFunc
				}, {
					sourceColumn: ['old_price', 'price'],
					relatedColumn: 'rate',
					relativeFunction: myFunc1
				}]
			};

			var dataSource = datagrid.wrapper.createDataSource({
				idProperty: 'id',
				type: 'local',
				param: sourceArray
			});

			this._columnController.activate(dataSource, param);

			datagrid.util.delay(1000, this.own(function() {
				this._columnController.search({});
			}));

			var param1 = {
				searcher: {
					type: 'all'
				},

				mapper: {
					type: 'property',
					param: {
						direction: 'vertical',
						visibleProperties: {
							header: ['_select', 'id'],
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

					summary: {

					}
				},
			};

			var dataSource1 = datagrid.wrapper.createDataSource({
				idProperty: 'id',
				type: 'local',
				param: summaryArray
			});

			this._summaryController.activate(dataSource1, param1);

			datagrid.util.delay(1000, this.own(function() {
				this._summaryController.search({});
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

		'{rootElement} valueChange': function(context) {
			var cell = context.evArg.cell;
			var $el = context.evArg.$el;
			var con = context.evArg.context;
			var func = context.evArg.func;
			edit(con, $el, cell, this._columnController, func);
			var dataSource = this._summaryController.getDataSource();
			var dataSource1 = this._columnController.getDataSource();
			var dataSet = dataSource1.getReplacedDataSet();
			var sourceDataArray = dataSource1.getDataAccessor().getSourceDataArray();
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
			if (dataSource.hasChange()) {
				originSummary = dataSource.getReplacedDataSet()[0].edited.summary;
			} else {
				originSummary = dataSource.getDataAccessor().getSourceDataArray()[0].summary;
			}
			var builder = dataSource.commandBuilder();
			builder.replaceValue({
				id: '0',
				summary: originSummary
			}, 'summary', summary);
			var command = builder.toCommand();
			dataSource.edit(command);
		}

	};

	$(function() {
		window.controller = h5.core.controller('body', pageController);
	});

})(jQuery);