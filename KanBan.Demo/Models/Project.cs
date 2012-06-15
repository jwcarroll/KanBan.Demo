using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace KanBan.Demo.Models
{
    public class Project
    {
        public String Id { get; set; }

        [Required, StringLength(50, MinimumLength = 2)]
        public String Name { get; set; }

        public List<WorkQueue> Queues { get; set; }

        public static Project CreateNewProject(String name)
        {
            return new Project()
            {
                Name = name,
                Queues = new List<WorkQueue>{
                    new WorkQueue{Name = "Backlog"},
                    new WorkQueue{Name = "Working"},
                    new WorkQueue{Name = "Done"}
                }
            };
        }
    }
}