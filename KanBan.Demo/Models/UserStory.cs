using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace KanBan.Demo.Models
{
    public class UserStory
    {
        public String Id { get; set; }

        public String ProjectId { get; set; }

        public String WorkQueueName { get; set; }

        [Required, StringLength(50, MinimumLength = 2)]
        public String Name { get; set; }

        public Boolean Ready { get; set; }
    }
}