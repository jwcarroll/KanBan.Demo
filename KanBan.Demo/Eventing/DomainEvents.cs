using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SignalR.Hubs;
using SignalR;
using KanBan.Demo.Models;

namespace KanBan.Demo.Eventing
{
    public static class DomainEventService
    {
        public static void PublishProjectCreated(Project newProject)
        {
            var context = GetContext();
            context.Clients.projectCreated(newProject);
        }

        public static void PublishUserStoryCreated(UserStory newUserStory)
        {
            var context = GetContext();
            context.Clients.userStoryCreated(newUserStory);
        }

        public static void PublishProjectDeleted(Project existingProject)
        {
            var context = GetContext();
            context.Clients.projectDeleted(existingProject);
        }

        public static void PublishUserStoryUpdated(UserStory userStory)
        {
            var context = GetContext();
            context.Clients.userStoryUpdated(userStory);
        }

        private static IHubContext GetContext()
        {
            return GlobalHost.ConnectionManager.GetHubContext<ProjectHub>();
        }
    }

    public class ProjectHub : Hub { }
}