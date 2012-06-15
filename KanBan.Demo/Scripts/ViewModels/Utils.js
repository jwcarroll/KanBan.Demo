/// <reference path="../knockout-2.1.0.debug.js" />
/// <reference path="Messages.js" />
/// <reference path="Utils.js" />

var Utils = (function () {
    var my = {
        unwrapViewModel: function (viewModel) {
            if (!viewModel) return;

            var plainObj = {};

            for (var propName in viewModel) {
                var hasOwn = viewModel.hasOwnProperty(propName);
                var value = viewModel[propName];

                if (hasOwn && ko.isObservable(value)) {
                    plainObj[propName] = ko.utils.unwrapObservable(value);
                }
                else if (hasOwn && typeof (value) !== 'function') {
                    plainObj[propName] = value;
                }
            }

            return plainObj;
        },
        extendViewModel: function (viewModel) {
            if (!viewModel) return;

            viewModel.isValid = function (result) {
                return result && result.success && result.data;
            };

            viewModel.updateValidationErrors = function (errors) {
                if (!errors) { return; }

                for (var i = 0; i < errors.length; i++) {
                    this.setPropertyValidation(errors[i]);
                }
            };

            viewModel.setPropertyValidation = function (error) {
                if (!error) { return; }

                var propName = error.Key;
                var msg = error.Value;
                var prop = this[propName];

                if (prop && ko.isObservable(prop)) {
                    prop.setError(msg);
                }
            };
        }
    };

    return my;
} ());