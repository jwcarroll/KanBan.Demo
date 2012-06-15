/// <reference path="../knockout-2.1.0.debug.js" />
/// <reference path="Messages.js" />
/// <reference path="Utils.js" />
/// <reference path="UserStoryViewModel.js" />

var WorkQueueModel = function (queue, projectId) {
    var $this = this;

    queue = queue || {};

    $this.Name = ko.observable(queue.Name);
    $this.Limit = ko.observable(queue.Name);
    $this.userStories = ko.observableArray([]);
    $this.projectId = projectId;

    $this.newStory = ko.observable(createNewStory());

    $this.addUserStory = function (userStory) {
        if (!userStory) return;

        var existingStory = findUserStory(userStory);
        userStory = Utils.unwrapViewModel(userStory);

        if (!existingStory) {
            userStory = new UserStoryModel(userStory);

            if (userStory.WorkQueueName() !== $this.Name()) {
                userStory.WorkQueueName($this.Name());
                userStory.save();
            }

            $this.userStories.push(userStory);
        }
    };

    $this.removeUserStory = function (userStory) {
        var existingStory = findUserStory(userStory);

        if (existingStory) {
            $this.userStories.remove(function (s) {
                return s.Id == existingStory.Id;
            });
        }
    };

    Messages.onUserStoryAdded(function (userStory) {
        if (!userStory) return;

        if (userStory.WorkQueueName === $this.Name() && userStory.ProjectId === $this.projectId) {
            $this.addUserStory(userStory);
        }
    });

    Messages.onUserStoryUpdated(function (userStory) {
        var existingUserStory = findUserStory(userStory);

        if (!existingUserStory && userStory.WorkQueueName === $this.Name() && userStory.ProjectId === $this.projectId) {
            $this.addUserStory(userStory);
        }
        else if (existingUserStory && existingUserStory.WorkQueueName() === userStory.WorkQueueName) {
            existingUserStory.updateFromUserStory(userStory);
        }
        else if (existingUserStory) {
            $this.removeUserStory(userStory);
        }
    });

    function findUserStory(userStory) {
        if (!userStory) return;

        return _.find($this.userStories(), function (s) {
            return s.Id === userStory.Id;
        });
    }

    function createNewStory() {
        return new UserStoryModel({
            ProjectId: $this.projectId,
            WorkQueueName: $this.Name
        }, storySaved);
    }

    function storySaved(story) {
        $this.addUserStory(story);
        $this.newStory(createNewStory());
    }
};