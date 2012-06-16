using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Caching;

namespace KanBan.Demo.Models
{
    public static class UserTracking
    {
        private const String ReturningUser_Cookie = "ReturningUser";
        
        public static void TrackUserVisit(HttpContextBase context)
        {
            if (context == null) return;

            if (IsFirstVisit(context))
            {
                var cookie = new HttpCookie(ReturningUser_Cookie);
                cookie.Expires = DateTime.Now.AddYears(10);
                cookie.Values.Add("IsNewUser", (true).ToString());
                cookie.Values.Add("uid", GetUserTrackingKey(context));
                context.Response.AppendCookie(cookie);

                InitializeTrackingInfo(GetUserTrackingKey(context));
            }
            else if (!IsReturningUser(context))
            {
                var cookie = new HttpCookie(ReturningUser_Cookie);
                cookie.Expires = DateTime.Now.AddYears(10);
                cookie.Values.Add("IsNewUser", (false).ToString());
                cookie.Values.Add("uid", GetUserTrackingKey(context));
                context.Response.AppendCookie(cookie);
            }
        }

        public static Boolean IsFirstVisit(HttpContextBase context = null)
        {
            context = context ?? GetCurrentContext();
            if (context == null) return false;

            var cookie = context.Request.Cookies[ReturningUser_Cookie];

            return cookie == null;
        }

        public static Boolean IsReturningUser(HttpContextBase context = null)
        {
            context = context ?? GetCurrentContext();
            if (context == null) return false;

            var cookie = context.Request.Cookies[ReturningUser_Cookie];

            return cookie != null && String.Equals(cookie.Values["IsNewUser"], (false).ToString());
        }

        public static int UserStoriesAdded {
            get { return GetTrackingInfo().UserStoriesAdded; }
            set { GetTrackingInfo().UserStoriesAdded = value; }
        }

        public static int UserStoriesModified {
            get { return GetTrackingInfo().UserStoriesModified; }
            set { GetTrackingInfo().UserStoriesModified = value; }
        }

        public static string UserConnectionId {
            get { return GetTrackingInfo().ConnectionId; }
            set { GetTrackingInfo().ConnectionId = value; }
        }

        private static TrackingInfo GetTrackingInfo()
        {
            var context = GetCurrentContext();

            if (context == null) return null;

            var key = GetUserTrackingKey(context);

            if (context.Cache[key] == null)
            {
                InitializeTrackingInfo(key);
            }

            return (TrackingInfo)context.Cache[key];
        }

        private static void InitializeTrackingInfo(String key)
        {
            var context = GetCurrentContext();

            if (context != null)
            {
                context.Cache.Add(key, new TrackingInfo(), null, Cache.NoAbsoluteExpiration, TimeSpan.FromMinutes(10), CacheItemPriority.Normal, null);
            }
        }

        private static HttpContextBase GetCurrentContext()
        {
            var context = HttpContext.Current;

            if (context == null) return null;

            return new HttpContextWrapper(context);
        }

        private static string GetUserTrackingKey(HttpContextBase context = null)
        {
            context = context ?? GetCurrentContext();
            if (context == null) return null;

            var cookie = context.Request.Cookies[ReturningUser_Cookie];

            return (cookie == null ? Guid.NewGuid() : new Guid(cookie.Values["uid"])).ToString();
        }

    }

    [Serializable]
    public class TrackingInfo
    {
        public String ConnectionId { get; set; }
        public Int32 UserStoriesAdded { get; set; }
        public Int32 UserStoriesModified { get; set; }
    }
}