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
	// SynchronizedController
	//=============================

	var synchronizedController = {

		/**
		 * @memberOf SynchronizedController
		 */
		__name: 'h5.ui.components.datagrid.wrapper.SynchronizedController',

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
			if (!param.relation) {
				return this._gridController.activate(dataSource, param);
			}

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

						// 連動列を計算するため、必要なパラメータを生成します
						var parameter = {};
						for (var i = 0, len2 = currentRelation.sourceColumn.length; i < len2; i++) {
							parameter[currentRelation.sourceColumn[i]] = data[currentRelation.sourceColumn[i]];
						}

						var oldData = data[currentRelation.relatedColumn];
						var newData = currentRelation.relativeFunction(parameter);

						// 連動列の値をデータソースに反映します
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
			return this._gridController.activate(dataSource, param);
		},

		/**
		 * グリッドコントローラを取得します。
		 * 
		 * @returns {GridController} グリッドコントローラ
		 */
		getGridController: function() {
			return this._gridController;
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
	// Expose to window
	//=============================

	h5.core.expose(synchronizedController);

})();