/* ------ h5.ui.components.datagrid.wrapper ------ */
(function() {
	'use strict';

	// =========================================================================
	//
	// Namespace
	//
	// =========================================================================

	var NAMESPACE = 'h5.ui.components.datagrid.wrapper';

	// =========================================================================
	//
	// Cache
	//
	// =========================================================================

	var datagrid = h5.ui.components.datagrid;

	//=============================
	// ColumnController
	//=============================

	var columnController = {

		/**
		 * @memberOf ColumnController
		 */
		__name: 'h5.ui.components.datagrid.wrapper.ColumnController',

		// --- Child Controller --- //

		_gridController: datagrid.GridController,

		// --- Public Method --- //

		/**
		 * このコントローラを起動します。
		 * 
		 * @param {DataSource} dataSource
		 * @param {GridControllerParam} param
		 * @returns {Promise} 起動を待つ Promise
		 */
		activate: function(dataSource, param) {
			if (param.relation !== undefined) {
				for (var idx = 0, len = param.relation.length; idx < len; idx++) {
					var relation = param.relation[idx];

					param.properties[relation.relatedColumn] = {
						toValue: function(data, cell) {
							var currentRelation;

							for (var j = 0, len1 = param.relation.length; j < len1; j++) {
								if (param.relation[j].relatedColumn === cell.propertyName) {
									currentRelation = param.relation[j];
								}
							}

							var parameter = {};
							for (var i = 0, len2 = currentRelation.sourceColumn.length; i < len2; i++) {
								parameter[currentRelation.sourceColumn[i]] = data[currentRelation.sourceColumn[i]];
							}

							var oldData = data[currentRelation.relatedColumn];
							var newData = currentRelation.relativeFunction(parameter);

							if (oldData !== newData) {
								var builder = dataSource.commandBuilder();
								builder.replaceValue(data, currentRelation.relatedColumn, newData);
								var command = builder.toCommand();
								dataSource.edit(command);
							}

							return newData;
						},

						sortable: true
					};
				}
			}
			return this._gridController.activate(dataSource, param);
		},

		/**
		 * 検索します。
		 * 
		 * @param {Object} param
		 * @param [filter]
		 * @param [sort]
		 */
		search: function(param, filter, sort) {
			this._gridController.search(param, filter, sort);
		},

		/**
		 * グリッドを再描画します。
		 */
		refresh: function() {
			this._gridController.refresh();
		},

		/**
		 * 参照しているデータソースを返します。
		 * 
		 * @returns {DataSource} データソース
		 */
		getDataSource: function() {
			return this._gridController.getDataSource();
		}

	};

	//=============================
	// SummaryController
	//=============================

	var summaryController = {

		/**
		 * @memberOf SummaryController
		 */
		__name: 'h5.ui.components.datagrid.wrapper.SummaryController',

		// --- Child Controller --- //

		_gridController: datagrid.GridController,

		// --- Public Method --- //

		/**
		 * このコントローラを起動します。
		 * 
		 * @param {DataSource} dataSource
		 * @param {GridControllerParam} param
		 * @returns {Promise} 起動を待つ Promise
		 */
		activate: function(dataSource, param) {
			return this._gridController.activate(dataSource, param);
		},

		/**
		 * 検索します。
		 * 
		 * @param {Object} param
		 * @param [filter]
		 * @param [sort]
		 */
		search: function(param, filter, sort) {
			this._gridController.search(param, filter, sort);
		},

		/**
		 * グリッドを再描画します。
		 */
		refresh: function() {
			this._gridController.refresh();
		},

		/**
		 * 参照しているデータソースを返します。
		 * 
		 * @returns {DataSource} データソース
		 */
		getDataSource: function() {
			return this._gridController.getDataSource();
		}

	};

	//=============================
	// Function
	//=============================

	/**
	 * @memberOf h5.ui.components.datagrid.wrapper
	 * @param param パラメータ
	 * @returns {DataSource} データソース
	 */
	function createDataSource(param) {
		return datagrid.createDataSource(param);
	}

	// =========================================================================
	//
	// Body
	//
	// =========================================================================

	var exports = {
		createDataSource: createDataSource
	};

	//=============================
	// Expose to window
	//=============================

	h5.u.obj.expose(NAMESPACE, exports);
	h5.core.expose(columnController);
	h5.core.expose(summaryController);

})();