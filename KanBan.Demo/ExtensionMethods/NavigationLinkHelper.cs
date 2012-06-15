using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace KanBan.Demo.ExtensionMethods {
   public static class NavigationLinkHelper {

      public static MvcHtmlString NavigationListItem(this HtmlHelper htmlHelper, string linkText, string actionName, string controllerName) {
         return NavigationListItem(htmlHelper, linkText, actionName, controllerName, new RouteValueDictionary(), new RouteValueDictionary());
      }

      public static MvcHtmlString NavigationListItem(this HtmlHelper htmlHelper, string linkText, string actionName, string controllerName, RouteValueDictionary routeValues, IDictionary<string, object> htmlAttributes) {
         if (String.IsNullOrEmpty(linkText)) {
            throw new ArgumentException("Link Text cannot be null or empty", "linkText");
         }

         var tagBuilder = new TagBuilder("li");
         
         if (IsCurrent(htmlHelper, actionName, controllerName)) {
            tagBuilder.AddCssClass("active");
         }

         tagBuilder.InnerHtml = GenerateLink(htmlHelper, linkText, actionName, controllerName, routeValues, htmlAttributes);

         return new MvcHtmlString(tagBuilder.ToString(TagRenderMode.Normal));
      }

      private static string GenerateLink(HtmlHelper htmlHelper, string linkText, string actionName, string controllerName, RouteValueDictionary routeValues, IDictionary<string, object> htmlAttributes) {
         string url = UrlHelper.GenerateUrl(null, actionName, controllerName, null, null, null, routeValues, htmlHelper.RouteCollection, htmlHelper.ViewContext.RequestContext, true);
         
         var tagBuilder = new TagBuilder("a") {
            InnerHtml = (!String.IsNullOrEmpty(linkText)) ? HttpUtility.HtmlEncode(linkText) : String.Empty
         };

         tagBuilder.MergeAttributes(htmlAttributes);
         tagBuilder.MergeAttribute("href", url);

         return tagBuilder.ToString(TagRenderMode.Normal);
      }

      public static bool IsCurrent(HtmlHelper htmlHelper, string actionName, string controllerName) {
         var currentController = htmlHelper.ViewContext.Controller.ValueProvider.GetValue("controller").RawValue as String;
         var currentAction = htmlHelper.ViewContext.Controller.ValueProvider.GetValue("action").RawValue as String;

         return String.Equals(currentAction, actionName) &&
                String.Equals(currentController, controllerName);
      }
   }
}