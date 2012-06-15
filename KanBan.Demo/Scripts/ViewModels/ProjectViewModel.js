/// <reference path="../knockout-2.1.0.debug.js" />
/// <reference path="Messages.js" />
/// <reference path="Utils.js" />

var ProjectModel = function (initialOptions) {
    initialOptions = initialOptions || {};

    if (typeof (initialOptions) === "function") {
        initialOptions = { saved: initialOptions };
    }
    else if (!initialOptions.newProject && !initialOptions.saved) {
        initialOptions = { newProject: initialOptions };
    }

    var newProject = initialOptions.newProject || {};
    var saved = initialOptions.saved || function () { };

    var $this = this, isNewProject = !initialOptions.newProject;

    $this.Id = newProject.Id;
    $this.Name = ko.observable(newProject.Name)
        .enableValidation(function (newValue) {
            return !!newValue;
        }, "Project Name is required");

    $this.Queues = ko.observableArray(ko.utils.arrayMap(newProject.Queues, function (queue) {
        return new WorkQueueModel(queue, $this.Id);
    }));

    $this.isActive = ko.observable(false);

    $this.updateProject = function (result) {
        if ($this.isValid(result)) {
            var project = result.data;

            $this.Id = project.Id;
            $this.Name(project.Name);
            $this.Queues.removeAll();
            $this.Queues(ko.utils.arrayMap(project.Queues, function (queue) {
                return new WorkQueueModel(queue, $this.Id);
            }));

            if (saved) saved($this);
        }
        else {
            $this.updateValidationErrors(result.errors);
        }
    };

    $this.save = function (newValue) {
        var data = {
            Id: $this.Id,
            Name: $this.Name()
        };

        if (typeof (newValue) === "string") {
            data.Name = newValue;
        }

        if (isNewProject) {
            ProjectDataAccess.createProject(data, $this.updateProject);
        }
        else {
            ProjectDataAccess.updateProject(data, $this.updateProject);
        }
    };

    $this.addUserStory = function (userStory) {
        if (!userStory) return;

        var queue = _.find($this.Queues(), function (q) {
            return q && q.Name && q.Name() === userStory.WorkQueueName;
        });

        if (queue) {
            queue.addUserStory(userStory);
        }
    };

    ko.computed(function () {
        if (!$this.isActive()) return;

        ProjectDataAccess.getProjectUserStories($this.Id, function (result) {
            if (!$this.isValid(result)) return;

            _.each(result.data, $this.addUserStory);
        });
    });

    Utils.extendViewModel($this);
};
