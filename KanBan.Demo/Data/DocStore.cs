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
        private const Int32 URL = 0;
        private const Int32 API_KEY = 1;

        static DocStore()
        {
            Current = new DocumentStore {
                Url = GetConnectionStringPart("Url=", URL),
                ApiKey = GetConnectionStringPart("ApiKey=", API_KEY)
            };

            Current.Initialize();
     
            IndexCreation.CreateIndexes(Assembly.GetCallingAssembly(), Current);
        }

        //Wonky little hack to handle AppHarbor
        private static string GetConnectionStringPart(String prefix, Int32 index)
        {
            var connectionString = ConfigurationManager.AppSettings["RAVENHQ_CONNECTION_STRING"];
            var parts = connectionString.Split(';');

            return parts[index].Replace(prefix, String.Empty);
        }

        public static DocumentStore Current { get; private set; }
    }
}