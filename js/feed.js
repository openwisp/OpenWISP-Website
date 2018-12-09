function createActivityFeed(options) {
  var intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 0 }
  ];

  function timeSince(date) {
    var seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    var interval = intervals.find(i => i.seconds < seconds);
    var count = Math.floor(seconds / interval.seconds);
    return count + " " + interval.label + (count !== 1 ? "s" : "") + " ago";
  }

  var converter = new showdown.Converter();
  converter.setFlavor("github");
  converter.setOption({
    simplifiedAutoLink: true,
    emoji: true,
    tasklists: true,
    ghMentions: true,
    encodeEmails: true,
    openLinksInNewWindow: true
  });

  if (!window.__githubApiPage) {
    window.__githubApiPage = 1;
  }

  $.getJSON("https://api.github.com/orgs/openwisp/events?page=" + window.__githubApiPage, function (result) {
    $.each(result, function (i, field) {
      var eventType, header, icon, iconColor, content, link, actionMap, iconMap;

      if (i === options.posts)
        return false;

      if (window.__githubApiPage === 10) // last page for all organizations 
        $("#loadMore").remove();

      if (field.actor.display_login === "coveralls")
        return; // don't display if comment is from coveralls

      switch (field.type) {
        case "IssuesEvent":
          actionMap = {
            "opened": "created a new issue in",
            "closed": "closed an issue in",
            "reopened": "reopened an issue in"
          }
          iconMap = {
            "opened": "octicon:issue-opened",
            "closed": "octicon:issue-closed",
            "reopened": "octicon:issue-reopened"
          }
          iconColorMap = {
            "opened": "#2cbe4e",
            "closed": "#cb2431",
            "reopened": "#2cbe4e"
          }
          eventType = actionMap[field.payload.action];
          header = field.payload.issue.title;
          icon = iconMap[field.payload.action];
          iconColor = iconColorMap[field.payload.action];
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
          iconMap = {
            "opened": "octicon:git-pull-request",
            "closed": "octicon:git-pull-request",
            "merged": "octicon:git-merge",
            "edited": "octicon:git-pull-request",
            "reopened": "octicon:git-pull-request",
          }
          iconColorMap = {
            "opened": "#2cbe4e",
            "closed": "#cb2431",
            "merged": "#6f42c1",
            "edited": "#24292e",
            "reopened": "#2cbe4e"
          }
          eventType = field.payload.pull_request.merged ? actionMap.merged : actionMap[field.payload.action];
          header = field.payload.pull_request.title;
          icon = field.payload.pull_request.merged ? iconMap.merged : iconMap[field.payload.action];
          iconColor = field.payload.pull_request.merged ? iconColorMap.merged : iconColorMap[field.payload.action];
          content = field.payload.pull_request.body;
          link = field.payload.pull_request.html_url;
          break;
        case "PullRequestReviewEvent":
          actionMap = {
            "submitted": "submitted a pull request review in",
            "edited": "edited a pull request review in",
            "dismissed": "resolved a pull request review in"
          }
          eventType = actionMap[field.payload.action];
          header = field.payload.pull_request.title;
          icon = "octicon:comment";
          iconColor = "#24292e";
          content = field.payload.review.body;
          link = field.payload.review.html_url;
          break;
        case "PullRequestReviewCommentEvent":
          actionMap = {
            "created": "reviewed a pull request in",
            "edited": "edited a review for a pull request in",
            "deleted": "deleted a pull request review in"
          }
          eventType = actionMap[field.payload.action];
          header = field.payload.pull_request.title;
          icon = "octicon:comment";
          iconColor = "#24292e";
          content = field.payload.comment.body;
          link = field.payload.comment.html_url;
          break;
        case "WatchEvent":
          eventType = "starred";
          header = field.repo.name;
          icon = "octicon:star";
          iconColor = "#24292e";
          content = "";
          link = "https://github.com/" + field.repo.name;
          break;
        case "IssueCommentEvent":
          eventType = "commented in";
          header = field.payload.issue.title;
          icon = "octicon:comment";
          iconColor = "#24292e";
          content = field.payload.comment.body;
          link = field.payload.comment.html_url;
          break;
        case "ForkEvent":
          eventType = "forked";
          header = field.repo.name;
          icon = "octicon:repo-forked";
          iconColor = "#959da5"
          content = field.payload.forkee.description;
          link = field.payload.forkee.html_url;
          break;
        case "PushEvent":
          eventType = "pushed to";
          header = field.repo.name;
          icon = "octicon:repo-push";
          iconColor = "#24292e";
          content = ""; // undefined before and altered content message
          field.payload.commits.map(function (commit) {
            content += commit.message + "<br>";
          })
          link = field.payload.compare;
          break;
      }

      if (!eventType)
        return; // don't display if event not handled above

      $(".feed-container").append(
        $("<div/>", { "class": "event" }).append(
          $("<div/>", { "class": "label" }).append(
            $("<a/>", { "href": "https://github.com/" + field.actor.display_login, "target": "_blank" }).append(
              $("<img>", { "src": field.actor.avatar_url })
            )
          )
        ).append(
          $("<div/>", { "class": "content" }).append(
            $("<div/>", { "class": "summary" }).append(
              $("<a/>", { "href": "https://github.com/" + field.actor.display_login, "target": "_blank" }).text(field.actor.display_login)
            ).append(" " + eventType + " ").append(
              $("<a/>", { "href": "https://github.com/" + field.repo.name, "target": "_blank" }).text(field.repo.name)
            ).append(
              $("<div/>", { "class": "date", "style": "font-size: 100%;" }).append(
                " " + timeSince(new Date(field.created_at))
              )
            ).append(
              $("<div/>", { "class": "ui small message" }).append(
                $("<div/>", { "class": "header" }).append(
                  $("<a/>", { "href": link, "style": "text-decoration: none;", "target": "_blank" }).append(
                    $("<span/>", { "class": "iconify", "data-icon": icon, "style": "color: " + iconColor })
                  ).append(
                    $("<span/>").text(" " + header)
                  )
                )
              ).append(
                content ? converter.makeHtml(content) : ""
              )
            )
          ))
      ).append(
        $("<div/>", { "class": "ui divider" })
      );
    });

    if (options.loadMore) {
      $(".feed-container").append(
        $("<button/>", { "class": "ui button big black", "id": "loadMore" }).text("Load more")
      )

      $("#loadMore").click(function () {
        createActivityFeed({ "posts": 30, "loadMore": true, "addPage": true });
        $("#loadMore").remove();
      });
    }

    if (options.addPage) {
      window.__githubApiPage++;
    }

    $(window).trigger("resize");
  })
}
