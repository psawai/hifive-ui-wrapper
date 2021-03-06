(function($) {
	var DATA_URL = './combobox.json';

	var comboboxLogic = {
		__name: 'sample1.ComboboxLogic',

		loadData: function() {
			return h5.ajax(DATA_URL, {
				dataType: 'json'
			});
		}
	};
	h5.core.expose(comboboxLogic);
})(jQuery);

(function($) {

	var comboboxSampleController = {

		__name: 'sample1.SampleController',

		/** コンボボックスコントローラ */
		_accountComboBoxController: h5.ui.components.combobox.ComboBoxController,

		__meta: {
			_accountComboBoxController: {
				rootElement: 'input[name="accountcode"]'
			}
		},

		_comboboxLogic: sample1.ComboboxLogic,

		__ready: function() {
			this._comboboxLogic.loadData().done(this.own(function(data) {
				this._accountComboBoxController.init({
					data: data.list,
					listPosition: h5.ui.components.combobox.LIST_POSITION_UPPER
				});
			}));
		},

		'#upper click': function() {
			this._accountComboBoxController.setListPosition(h5.ui.components.combobox.LIST_POSITION_UPPER);
		},

		'#lower click': function() {
			this._accountComboBoxController.setListPosition(h5.ui.components.combobox.LIST_POSITION_LOWER);
		}
	};

	h5.core.expose(comboboxSampleController);

})(jQuery);


// ---- Init ---- //
$(function() {
	h5.core.controller('body', sample1.SampleController);
});
;