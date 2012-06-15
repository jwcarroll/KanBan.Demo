/// <reference path="../knockout-2.1.0.debug.js" />
/// <reference path="Messages.js" />
/// <reference path="Utils.js" />

var Messages = (function () {

    var messageBus = new ko.subscribable();

    var eventNames = {
        projectCreated: 'projectCreated',
        projectDeleted: 'projectDeleted',
        userStoryAdded: 'userStoryAdded',
        userStoryUpdated: 'userStoryUpdated'
    };

    var my = {
        onProjectCreated: createEvent(eventNames.projectCreated),
        onProjectDeleted: createEvent(eventNames.projectDeleted),
        onUserStoryAdded: createEvent(eventNames.userStoryAdded),
        onUserStoryUpdated: createEvent(eventNames.userStoryUpdated)
    };

    var projectHub = $.connection.projectHub;

    projectHub.projectCreated = createNotifier(eventNames.projectCreated);
    projectHub.projectDeleted = createNotifier(eventNames.projectDeleted);
    projectHub.userStoryCreated = createNotifier(eventNames.userStoryAdded);
    projectHub.userStoryUpdated = createNotifier(eventNames.userStoryUpdated);

    // Start the connection
    $.connection.hub.start();

    function createEvent(eventName) {
        var e = eventName;

        return function (callback, callbackTarget) {
            messageBus.subscribe(callback, callbackTarget, e);
        };
    }

    function createNotifier(eventName) {
        return function (data) {
            messageBus.notifySubscribers(data, eventName);
        };
    }

    return my;
} ());