using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Raven.Client.Document;
using Raven.Client.Indexes;
using System.Reflection;
using System.Configuration;

namespace KanBan.Demo.Data
{
    public static class DocStore
    {
        static DocStore()
        {
            Current = new DocumentStore { Url = ConfigurationManager.AppSettings["RAVENHQ_CONNECTION_STRING"] };
            Current.Initialize();
     
            IndexCreation.CreateIndexes(Assembly.GetCallingAssembly(), Current);
        }

        public static DocumentStore Current { get; private set; }
    }
}