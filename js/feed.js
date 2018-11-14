(function () {
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 0 }
  ];

  function timeSince(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const interval = intervals.find(i => i.seconds < seconds);
    const count = Math.floor(seconds / interval.seconds);
    return count + " " + interval.label + (count !== 1 ? "s" : "") + " ago";
  }

  function replaceURLsWithLinks(content) {
    return content.replace(/((http|https):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a> ');
  }

  $.getJSON("https://api.github.com/orgs/openwisp/events", function (result) {
    $.each(result, function (i, field) {
      var event, header, content, link, actionMap;

      switch (field.type) {
        case "IssuesEvent":
          actionMap = {
            "opened": "created a new issue in",
            "closed": "closed an issue in",
            "reopened": "reopened an issue in"
          }
          event = actionMap[field.payload.action];
          header = field.payload.issue.title;
          content = field.payload.body;
          link = field.payload.issue.html_url;
          break;
        case "PullRequestEvent":
          actionMap = {
            "opened": "created a new pull request in",
            "closed": "closed a pull request in",
            "merged": "merged a pull request in",
            "edited": "edited a pull request in",
            "reopened": "reopened a pull request in"
          }
          event = field.payload.pull_request.merged ? actionMap.merged : actionMap[field.payload.action];
          header = field.payload.pull_request.title;
          content = field.payload.pull_request.body;
          link = field.payload.pull_request.html_url;
          break;
        case "PullRequestReviewEvent":
          actionMap = {
            "submitted": "submitted a pull request review in",
            "edited": "edited a pull request review in",
            "dismissed": "resolved a pull request review in"
          }
          event = actionMap[field.payload.action];
          header = field.payload.pull_request.title;
          content = field.payload.review.body;
          link = field.payload.review.html_url;
          break;
        case "PullRequestReviewCommentEvent":
          actionMap = {
            "created": "reviewed a pull request in",
            "edited": "edited a review for a pull request in",
            "deleted": "deleted a pull request review in"
          }
          event = actionMap[field.payload.action];
          header = field.payload.pull_request.title;
          content = field.payload.comment.body;
          link = field.payload.comment.html_url;
          break;
        case "WatchEvent":
          event = "starred";
          header = "★ " + field.repo.name;
          content = "";
          link = "https://github.com/" + field.repo.name;
          break;
        case "IssueCommentEvent":
          event = "commented in";
          header = field.payload.issue.title;
          content = field.payload.comment.body;
          link = field.payload.comment.html_url;
          break;
        case "ForkEvent":
          event = "forked";
          header = field.repo.name;
          content = field.payload.forkee.description;
          link = field.payload.forkee.html_url;
          break;
        case "PushEvent":
          event = "pushed to";
          header = field.repo.name;
          content = ""; // undefined before and altered content message
          field.payload.commits.map(function (commit) {
            content += commit.message + "<br>";
          })
          link = field.payload.compare;
          break;
      }

      if (!event)
        return; // don't display if event not handled above

      $(".feed-container").append(
        $("<div/>", { "class": "event" }).append(
          $("<div/>", { "class": "label" }).append(
            $("<a/>", { "href": "https://github.com/" + field.actor.display_login }).append(
              $("<img>", { "src": field.actor.avatar_url })
            )
          )
        ).append(
          $("<div/>", { "class": "content" }).append(
            $("<div/>", { "class": "summary" }).append(
              $("<a/>", { "href": "https://github.com/" + field.actor.display_login }).text(field.actor.display_login)
            ).append(" " + event + " ").append(
              $("<a/>", { "href": "https://github.com/" + field.repo.name }).text(field.repo.name)
            ).append(
              $("<div/>", { "class": "date", "style": "font-size: 100%;" }).append(
                " " + timeSince(new Date(field.created_at))
              )
            ).append(
              $("<div/>", { "class": "ui small message" }).append(
                $("<div/>", { "class": "header" }).append(
                  $("<a/>", { "href": link, "style": "text-decoration: none;" }).append(
                    $("<h3/>").text(header)
                  )
                )
              ).append(
                content ? replaceURLsWithLinks(new showdown.Converter().makeHtml(content)) : ""
              )
            )
          ))
      ).append(
        $("<div/>", { "class": "ui divider" })
      );

      $(window).trigger("resize");
    });
  })
}());
