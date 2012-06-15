/// <reference path="../knockout-2.1.0.debug.js" />
/// <reference path="Messages.js" />
/// <reference path="Utils.js" />

var ProjectDataAccess = (function () {
    var my = {
        projectUrl: '',
        userStoriesUrl: '',
        userStoryUrl: '',
        getProjects: function (callback) {
            $.getJSON(my.projectUrl, callback);
        },
        createProject: function (project, callback) {
            $.post(my.projectUrl, project, callback);
        },
        updateProject: function (project, callback) {
            $.ajax({
                type: 'PUT',
                url: my.projectUrl,
                data: project,
                success: callback,
                dataType: 'json'
            });
        },
        deleteProject: function (project, callback) {
            $.ajax({
                type: 'DELETE',
                url: my.projectUrl,
                data: project,
                success: callback,
                dataType: 'json'
            });
        },
        getProjectUserStories: function (projectId, callback) {
            $.getJSON(my.userStoriesUrl, { Id: projectId }, callback);
        },
        createUserStory: function (userStory, callback) {
            $.post(my.userStoryUrl, userStory, callback);
        },
        updateUserStory: function (userStory, callback) {
            $.ajax({
                type: 'PUT',
                url: my.userStoryUrl,
                data: userStory,
                success: callback,
                dataType: 'json'
            });
        }
    };

    return my;
} ());