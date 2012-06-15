using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace KanBan.Demo.Models
{
    public class WorkQueue
    {
        [Required, StringLength(50, MinimumLength = 2)]
        public String Name { get; set; }

        [Range(0, 99, ErrorMessage="Queue limit must be between 0 and 99")]
        public Int32? Limit { get; set; }
    }
}
