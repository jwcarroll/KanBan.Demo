/// <reference path="../knockout-2.1.0.debug.js" />
/// <reference path="Messages.js" />
/// <reference path="Utils.js" />

var ProjectListViewModel = function () {
    var $this = this;
    var _projects = ko.observableArray();

    $this.projects = ko.computed(function () {
        return _.sortBy(_projects(), function (project) {
            return project.Name();
        });
    });

    $this.selectedProject = ko.observable();

    $this.errorMessage = ko.observable("");
    $this.showError = ko.computed(function () {
        return $this.errorMessage() != "";
    });

    $this.newProject = ko.observable(new ProjectModel({
        saved: projectSaved
    }));

    $this.loadProjects = function () {
        ProjectDataAccess.getProjects(function (projectList) {
            _projects(ko.utils.arrayMap(projectList, function (project) {
                return new ProjectModel(project);
            }));
        });
    };

    $this.addProject = function (project) {
        if (!project) return;

        var existingProj = _.find(_projects(), function (p) {
            return p.Id === project.Id;
        });

        if (!existingProj) {
            _projects.push(new ProjectModel(project));
        }
    };

    $this.setSelectedProject = function (project) {
        var currentProject = $this.selectedProject();

        if (currentProject) currentProject.isActive(false);

        $this.selectedProject(project || _projects[0]);
        $this.selectedProject().isActive(true);
    };

    $this.deleteProject = function (project) {
        if (!project) return;

        var data = {
            id: project.Id
        };

        $this.errorMessage("");

        ProjectDataAccess.deleteProject(data, function (result) {
            if ($this.isValid(result)) {
                _projects.remove(function (project) {
                    return project.Id == result.data.Id;
                });
            }
            else {
                $this.errorMessage(result.errors[0].Value);
            }
        });
    };

    function projectSaved(project) {
        _projects.push(project);

        $this.errorMessage("");

        $this.newProject(new ProjectModel({
            saved: projectSaved
        }));
    }

    Messages.onProjectCreated($this.addProject);

    Messages.onProjectDeleted(function (project) {
        if (!project) return;

        _projects.remove(function (p) {
            return project && project.Id === p.Id;
        });

        var selectedProj = $this.selectedProject();

        if (selectedProj && selectedProj.Id === project.Id) {
            $this.selectedProject(undefined);
        }
    });

    Utils.extendViewModel($this);
};