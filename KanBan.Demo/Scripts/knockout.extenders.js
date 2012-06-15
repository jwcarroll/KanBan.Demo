/// <reference path="knockout-2.1.0.debug.js" />
/// <reference path="jquery-1.7.2.js" />

(function (observableProto, observable) {

    observableProto.validationStates = {
        none: "",
        warning: "warning",
        error: "error",
        success: "success"
    };

    observableProto.enableValidation = function (validator, msg) {
        var $this = this;

        $this.validationMessage = observable("");
        $this.validationState = observable(observableProto.validationStates.none);

        $this.validationMessage(msg || "");
        $this.validator = validator;
        $this.subscribe(function (newValue) {
            $this.validate.apply($this, [newValue]);
        });

        return $this;
    };

    observableProto.setWarning = function (msg) {
        setValidation(this, observableProto.validationStates.warning, msg);
    };

    observableProto.setError = function (msg) {
        setValidation(this, observableProto.validationStates.error, msg);
    };

    observableProto.setSuccess = function (msg) {
        setValidation(this, observableProto.validationStates.success, msg);
    };

    observableProto.clearValidation = function () {
        this.validationState(observableProto.validationStates.none);
    };

    observableProto.validate = function (newValue) {
        var value = newValue || this();
        var validationResult = getValidationState(this.validator(value));
        var shouldShow = validationResult !== observableProto.validationStates.none;

        this.validationState(validationResult);
    };

    observableProto.validator = function () {
        return true;
    };
    
    function getValidationState(result) {
        if (typeof result === "boolean") {
            return result ?
                   observableProto.validationStates.success :
                   observableProto.validationStates.error;
        }
        else {
            var hasResult = !!result;

            if (hasResult && isValidState(result))
                return result;

            return hasResult ?
                   observableProto.validationStates.error :
                   observableProto.validationStates.none;
        }
    };

    function isValidState(state) {
        return
        state === observableProto.validationStates.none ||
        state === observableProto.validationStates.warning ||
        state === observableProto.validationStates.error ||
        state === observableProto.validationStates.success;
    };

    function setValidation(target, state, msg) {
        state = state || target.validationState();
        msg = msg || target.validationMessage();

        target.validationState(state);
        target.validationMessage(msg);
    };

} (ko.observable['fn'], ko.observable));

(function (bindings) {
    bindings.validationStyle = {
        update: function(element, valueAccessor){
            var value = valueAccessor();

            if(!ko.isObservable(value)) return;

            var curState = ko.utils.unwrapObservable(value.validationState) || "";
            
            var states = value.validationStates;
            
            for(var state in states){
                ko.utils.toggleDomNodeCssClass(element, states[state], curState === states[state]);
            }
        }
    };

    bindings.validationMessage = {
        update: function(element, valueAccessor){
            var value = valueAccessor();

            if(!ko.isObservable(value)) return;

            //Text
            var state = ko.utils.unwrapObservable(value.validationState);
            var msg = ko.utils.unwrapObservable(value.validationMessage);

            element.innerText = msg;

            //Visibility
            var shouldShow = state === value.validationStates.error || 
                             state === value.validationStates.warning;

            var isCurrentlyVisible = !(element.style.display == "none");

            if (shouldShow && !isCurrentlyVisible)
                element.style.display = "";
            else if ((!shouldShow) && isCurrentlyVisible)
                element.style.display = "none";
        }
    };

    bindings.clickToEdit = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor();
            var options = {
                value: value.value || value,
                callback: value.callback || function(){}
            };

            var rawValue = ko.utils.unwrapObservable(options.value);

            var input = $("<input type='text' value='"+ rawValue +"' />");

            $(element).click(function(){
                $(this).hide().after(input);

                var eventHandled = false;
                var onValueChanged = function(){
                    if(eventHandled) return;
                    eventHandled = true;

                    var newValue = input.val();
                    
                    input.remove();
                    $(element).show();
                    options.callback(newValue);
                };

                input.bind({
                    keypress: function(event){
                        if (event.which == 13){
                            event.preventDefault();
                            onValueChanged();
                        }
                    },
                    blur: onValueChanged
                });

                input.focus();
            });
        }
    };

    bindings.sortable = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel){
            var value = valueAccessor();
            
            var options = { 
                relatedClass: value.relatedClass,
                exclude: value.exclude, 
                remove: value.remove || function(){}, 
                recieve: value.recieve || function(){}
            };

            $(element).sortable({
                connectWith: "." + options.relatedClass,
                cancel: "." + options.exclude,
                remove: function(event, ui){
                    var value = ko.dataFor(event.srcElement);

                    options.remove(value);
                },
                receive: function(event, ui){
                    var value = ko.dataFor(event.srcElement);

                    options.recieve(value);

                    $(event.srcElement.parentElement).remove();
                }
            });
        }
    };
} (ko.bindingHandlers));