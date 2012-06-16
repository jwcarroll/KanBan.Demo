using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SignalR.Hubs;
using SignalR;
using KanBan.Demo.Models;
using System.Threading.Tasks;

namespace KanBan.Demo.Eventing
{
    public static class DomainEventService
    {
        public static void PublishProjectCreated(Project newProject)
        {
            var context = GetContext();
            context.Clients.projectCreated(newProject);

            PublishUserMessage(UserMessages.FirstProject, true);
        }

        public static void PublishUserStoryCreated(UserStory newUserStory)
        {
            var context = GetContext();
            context.Clients.userStoryCreated(newUserStory);

            UserTracking.UserStoriesAdded++;

            if (UserTracking.UserStoriesAdded >= 3)
            {
                PublishUserMessage(UserMessages.AddedUserStories, true);
            }
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

            UserTracking.UserStoriesModified++;

            if (UserTracking.UserStoriesModified >= 3)
            {
                PublishUserMessage(UserMessages.UpdatedUserStories, true);
            }
        }

        public static void PublishUserMessage(String message, Boolean ignoreReturningUsers)
        {
            if(ignoreReturningUsers && UserTracking.IsReturningUser(CurrentHttpContext))
                return;

            var context = GetContext();
            context.Clients[UserTracking.UserConnectionId].sendUserMessage(message);
        }

        private static HttpContextBase CurrentHttpContext
        {
            get
            {
                return new HttpContextWrapper(HttpContext.Current);
            }
        }

        private static IHubContext GetContext()
        {
            return GlobalHost.ConnectionManager.GetHubContext<ProjectHub>();
        }
    }

    public class ProjectHub : Hub
    {
        public System.Threading.Tasks.Task AckServer()
        {
            UserTracking.UserConnectionId = Context.ConnectionId;
            var context = new HttpContextWrapper(HttpContext.Current);

            return Task.Factory.StartNew(() =>
            {
                if (UserTracking.IsReturningUser(context)) return;

                Caller.sendUserMessage(UserMessages.Welcome);
            });
        }
    }
}