/// <reference path="../knockout-2.1.0.debug.js" />
/// <reference path="Messages.js" />
/// <reference path="Utils.js" />

var UserStoryModel = function (userStory, savedCallback) {
    var $this = this;
    var saved = savedCallback;

    userStory = userStory || {};

    $this.Id = userStory.Id;
    $this.ProjectId = userStory.ProjectId;
    $this.WorkQueueName = ko.observable(userStory.WorkQueueName || "Backlog");
    $this.Name = ko.observable(userStory.Name)
        .enableValidation(function (newValue) {
            return !!newValue;
        }, "User Story Name is required");

    $this.Ready = ko.observable(userStory.Ready || false);

    $this.save = function () {
        var data = {
            Id: $this.Id,
            ProjectId: $this.ProjectId,
            WorkQueueName: $this.WorkQueueName(),
            Name: $this.Name(),
            Ready: $this.Ready()
        };

        if ($this.Id)
            ProjectDataAccess.updateUserStory(data, $this.updateFromResults);
        else
            ProjectDataAccess.createUserStory(data, $this.updateFromResults);
    };

    $this.updateFromResults = function (result) {
        if ($this.isValid(result)) {
            $this.updateFromUserStory(result.data);

            if (saved) saved(result.data);
        }
        else {
            $this.updateValidationErrors(result.errors);
        }
    };

    $this.updateFromUserStory = function (usrStory) {
        if (!userStory) return;

        $this.Id = usrStory.Id;
        $this.ProjectId = usrStory.ProjectId;
        $this.WorkQueueName(usrStory.WorkQueueName || "Backlog");
        $this.Name(usrStory.Name);
        $this.Ready(usrStory.Ready || false);
    };

    $this.toggleReady = function () {
        $this.Ready(!$this.Ready());
        $this.save();
    };

    Utils.extendViewModel($this);
};