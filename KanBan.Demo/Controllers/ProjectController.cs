using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using KanBan.Demo.Models;
using KanBan.Demo.Eventing;

namespace KanBan.Demo.Controllers
{
    public class ProjectListController : RavenController
    {
        public ActionResult Index()
        {
            UserTracking.TrackUserVisit(HttpContext);

            return View();
        }

        [HttpGet, ActionName("Project")]
        [OutputCache(NoStore=true, Duration=0)]
        public ActionResult Projects()
        {
            var projects = RavenSession.Query<Project>()
                    .OrderBy(p => p.Name)
                    .ToList();

            return Json(projects, JsonRequestBehavior.AllowGet);
        }

        [HttpPost, ActionName("Project")]
        public ActionResult CreateProject(Project newProject)
        {
            var isValid = ModelState.IsValid && ValidateProject(newProject, ModelState);
            
            if (isValid)
            {
                newProject = Project.CreateNewProject(newProject.Name);

                RavenSession.Store(newProject);
                RavenSession.SaveChanges();

                DomainEventService.PublishProjectCreated(newProject);
            }
            
            return GetJsonResult(newProject);
        }

        [HttpPut, ActionName("Project")]
        public ActionResult UpdateProject(Project existingProject)
        {
            var isValid = ModelState.IsValid && ValidateProject(existingProject, ModelState);

            if (isValid)
            {
                RavenSession.Store(existingProject);
                RavenSession.SaveChanges();
            }

            return GetJsonResult(existingProject);
        }

        [HttpDelete, ActionName("Project")]
        public ActionResult DeleteProject(Project existingProject)
        {
            var isValid = DeleteProject(existingProject, ModelState);

            if (isValid)
            {
                ModelState.Clear();
                DomainEventService.PublishProjectDeleted(existingProject);
            }

            return GetJsonResult(existingProject);
        }

        [OutputCache(NoStore = true, Duration = 0)]
        public ActionResult UserStories(String Id)
        {
            var userStories = RavenSession.Query<UserStory>()
                .Where(us => us.ProjectId == Id)
                .ToList();

            return GetJsonResult(userStories, JsonRequestBehavior.AllowGet);
        }

        [HttpPost, ActionName("UserStory")]
        public ActionResult CreateUserStory(UserStory newUserStory)
        {
            if (ModelState.IsValid)
            {
                RavenSession.Store(newUserStory);
                RavenSession.SaveChanges();

                DomainEventService.PublishUserStoryCreated(newUserStory);
            }

            return GetJsonResult(newUserStory);
        }

        [HttpPut, ActionName("UserStory")]
        public ActionResult UpdateUserStory(UserStory userStory)
        {
            if (ModelState.IsValid)
            {
                RavenSession.Store(userStory);
                RavenSession.SaveChanges();

                DomainEventService.PublishUserStoryUpdated(userStory);
            }

            return GetJsonResult(userStory);
        }

        private JsonResult GetJsonResult(Object data, JsonRequestBehavior behavior = JsonRequestBehavior.DenyGet)
        {
            return Json(new
            {
                success = ModelState.IsValid,
                errors = GetModelStateErrors(ModelState),
                data
            }, behavior);
        }

        private Boolean DeleteProject(Project project, ModelStateDictionary modelState)
        {
            if (project == null)
            {
                modelState.AddModelError("this", "A project must be supplied for deletion");
                return false;
            }
            
            var existingProject = RavenSession.Load<Project>(project.Id);

            if (existingProject == null)
            {
                modelState.AddModelError("Id", "Project no longer exists");
                return false;
            }
            else
            {
                var associatedUserStories = RavenSession.Query<UserStory>()
                    .Where(us => us.ProjectId == existingProject.Id)
                    .ToList();

                if (associatedUserStories != null)
                {
                    associatedUserStories.ForEach(RavenSession.Delete);
                }
            }

            RavenSession.Delete(existingProject);
            RavenSession.SaveChanges();

            return true;
        }

        private bool ValidateProject(Project newProject, ModelStateDictionary modelState)
        {
            var isValid = true;

            if (newProject == null)
                isValid &= false;

            if (ProjectExists(newProject))
            {
                modelState.AddModelError("Name", String.Format("Project with same name already exists"));
                isValid &= false;
            }

            return isValid;
        }

        private Boolean ProjectExists(Project newProject)
        {
            return newProject != null &&
                (RavenSession.Query<Project>()
                .FirstOrDefault(p => p.Name == newProject.Name)) != null;
        }

        private IEnumerable<KeyValuePair<String, String>> GetModelStateErrors(ModelStateDictionary ModelState)
        {
            foreach (var state in ModelState)
            {
                foreach (var error in state.Value.Errors)
                {
                    yield return new KeyValuePair<String, String>(state.Key, error.ErrorMessage);
                }
            }
        }
    }
}
