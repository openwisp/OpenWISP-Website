function createActivityFeed(options) {
  var intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 0 },
  ];

  function timeSince(date) {
    var seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    var interval = intervals.find((i) => i.seconds < seconds);
    var count =
      interval.seconds === 0 ? seconds : Math.floor(seconds / interval.seconds);
    return count + " " + interval.label + (count !== 1 ? "s" : "") + " ago";
  }

  function sanitizeAndConvertToHtml(content) {
    var sanitizedContent = content.replace(/<\/?[a-zA-Z]+>/g, (match) => {
      var allowed = ["<br>", "</br>", "<br/>", "<br />", "<code>", "</code>"];
      if (allowed.includes(match.toLowerCase())) {
        return match;
      } else {
        return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
    });
    var convertedHtmlContent = converter.makeHtml(sanitizedContent);
    return convertedHtmlContent;
  }

  var converter = new showdown.Converter();
  converter.setFlavor("github");
  converter.setOption({
    simplifiedAutoLink: true,
    emoji: true,
    tasklists: true,
    ghMentions: true,
    encodeEmails: true,
    openLinksInNewWindow: true,
  });

  if (!window.__githubApiPage) {
    window.__githubApiPage = 1;
  }

  $.getJSON(
    "https://api.github.com/orgs/openwisp/events?page=" +
      window.__githubApiPage,
    function (result) {
      $.each(result, function (i, field) {
        var eventType,
          header,
          icon,
          iconColor,
          content,
          link,
          actionMap,
          iconMap,
          iconColorMap;

        if (i === options.posts) return false;

        if (window.__githubApiPage === 10)
          // last page for all organizations
          $("#load-more").remove();

        switch (field.type) {
          case "IssuesEvent":
            actionMap = {
              opened: "opened an issue in",
              closed: "closed an issue in",
              reopened: "reopened an issue in",
            };
            iconMap = {
              opened: "octicon:issue-opened",
              closed: "octicon:issue-closed",
              reopened: "octicon:issue-reopened",
            };
            iconColorMap = {
              opened: "#1a7f37",
              closed: "#cb2431",
              reopened: "#1a7f37",
            };
            eventType = actionMap[field.payload.action];
            eventType = `${eventType} <code>${field.repo.name}</code>`;
            header = field.payload.issue.title;
            icon = iconMap[field.payload.action];
            iconColor = iconColorMap[field.payload.action];
            content = field.payload.body;
            link = field.payload.issue.html_url;
            break;
          case "PullRequestEvent":
            actionMap = {
              opened: "opened a pull request in",
              closed: "closed a pull request in",
              merged: "merged a pull request in",
              edited: "edited a pull request in",
              reopened: "reopened a pull request in",
            };
            iconMap = {
              opened: "octicon:git-pull-request",
              closed: "octicon:git-pull-request",
              merged: "octicon:git-merge",
              edited: "octicon:git-pull-request",
              reopened: "octicon:git-pull-request",
            };
            iconColorMap = {
              opened: "#1a7f37",
              closed: "#cb2431",
              merged: "#6f42c1",
              edited: "#24292e",
              reopened: "#1a7f37",
            };
            eventType = field.payload.pull_request.merged
              ? actionMap.merged
              : actionMap[field.payload.action];
            eventType = `${eventType} <code>${field.repo.name}</code>`;
            header = field.payload.pull_request.title;
            icon = field.payload.pull_request.merged
              ? iconMap.merged
              : iconMap[field.payload.action];
            iconColor = field.payload.pull_request.merged
              ? iconColorMap.merged
              : iconColorMap[field.payload.action];
            content = field.payload.pull_request.body;
            link = field.payload.pull_request.html_url;
            // ignore dependabot merges
            if (
              content &&
              content.indexOf(
                "<summary>Dependabot commands and options</summary>",
              ) > 1
            ) {
              content = "";
            }
            break;
          case "PullRequestReviewEvent":
            actionMap = {
              submitted: "reviewed a pull request in",
              created: "reviewed a pull request in",
              edited: "edited a pull request review in",
              dismissed: "resolved a pull request review in",
            };
            iconMap = {
              approved: "octicon:check-circle-fill-24",
              changes_requested: "octicon:file-diff-16",
              commented: "octicon:eye-16",
              dismissed: "octicon:x-circle-fill-12",
            };
            iconColorMap = {
              approved: "#1a7f37",
              changes_requested: "#cb2431",
              commented: "#636c76",
              dismissed: "#636c76",
            };
            eventType = actionMap[field.payload.action];
            eventType = `${eventType} <code>${field.repo.name}</code>`;
            header = field.payload.pull_request.title;
            icon = iconMap[field.payload.review.state];
            iconColor = iconColorMap[field.payload.review.state];
            content = field.payload.review.body;
            link = field.payload.review.html_url;
            break;
          case "PullRequestReviewCommentEvent":
            actionMap = {
              created: "reviewed a pull request in",
              edited: "edited a pull request review in",
              deleted: "deleted a pull request review from",
            };
            eventType = actionMap[field.payload.action];
            eventType = `${eventType} <code>${field.repo.name}</code>`;
            header = field.payload.pull_request.title;
            icon = "octicon:comment";
            iconColor = "#24292e";
            content = field.payload.comment.body;
            link = field.payload.comment.html_url;
            break;
          case "WatchEvent":
            eventType = `starred <code>${field.repo.name}</code>`;
            header = field.repo.name;
            icon = "octicon:star";
            iconColor = "#24292e";
            content = "";
            link = "https://github.com/" + field.repo.name;
            break;
          case "IssueCommentEvent":
            eventType = `replied to an issue in <code>${field.repo.name}</code>`;
            header = field.payload.issue.title;
            icon = "octicon:comment";
            iconColor = "#24292e";
            content = field.payload.comment.body;
            link = field.payload.comment.html_url;
            break;
          case "CommitCommentEvent":
            var hash = field.payload.comment.commit_id.substr(0, 7);
            eventType = `commented on commit <code>${hash}</code> in <code>${field.repo.name}</code>`;
            header = `${field.repo.name}@${hash}`;
            icon = "octicon:comment";
            iconColor = "#24292e";
            content = field.payload.comment.body;
            link = field.payload.comment.html_url;
            break;
          case "ForkEvent":
            eventType = `forked <code>${field.repo.name}</code>`;
            header = field.repo.name;
            icon = "octicon:repo-forked";
            iconColor = "#959da5";
            content = "";
            link = field.payload.forkee.html_url;
            break;
          case "PushEvent":
            eventType = `pushed to <code>${field.repo.name}</code>`;
            header = field.repo.name;
            icon = "octicon:repo-push";
            iconColor = "#24292e";
            content = null;
            content = ""; // undefined before and altered content message
            field.payload.commits.map(function (commit) {
              var hash = commit.sha.substr(0, 7),
                // only first line
                summary = commit.message.split("\n", 1)[0];
              content += `<code>${hash}</code> ${summary}<br>`;
            });
            link = field.payload.compare;
            break;
          case "DeleteEvent":
            eventType = `deleted ${field.payload.ref_type} <code>${field.payload.ref}</code> from <code>${field.repo.name}</code>`;
            header = `${field.repo.name}`;
            iconMap = {
              branch: "octicon:git-branch-16",
              tag: "octicon:tag-16",
            };
            icon = iconMap[field.payload.ref_type];
            iconColor = "#cb2431";
            content = "";
            link = `https://github.com/${field.repo.name}/`;
            break;
          case "CreateEvent":
            if (field.payload.ref_type === "repository") {
              eventType = `created ${field.payload.ref_type} <code>${field.repo.name}</code>`;
              header = field.repo.name;
              content = field.payload.description;
            } else {
              eventType = `created ${field.payload.ref_type} <code>${field.payload.ref}</code> in <code>${field.repo.name}</code>`;
              header = `${field.repo.name}`;
              content = "";
            }
            iconMap = {
              branch: "octicon:git-branch-16",
              tag: "octicon:tag-16",
              repository: "octicon:repo-16",
            };
            icon = iconMap[field.payload.ref_type];
            iconColor = "#1a7f37";
            link = `https://github.com/${field.repo.name}/`;
            break;
          case "ReleaseEvent":
            eventType = `${field.payload.action} <code>${field.payload.release.tag_name}</code> in <code>${field.repo.name}</code>`;
            header = `${field.payload.release.tag_name} ${field.repo.name}`;
            content = field.payload.release.body;
            icon = "octicon:feed-tag-16";
            iconColor = "#1a7f37";
            link = field.payload.release.html_url;
            break;
        }

        if (!eventType) return; // don't display if event not handled above

        if (!$(".feed-container div").length) $(".feed-container").html("");

        // Define a template using a template literal
        const template = `
<div class="card">
  <div class="card-content">
    <div class="media mb-0">
      <div class="media-left">
        <figure class="image is-48x48">
          <a href="https://github.com/${
            field.actor.display_login
          }" target="_blank">
            <img src="${field.actor.avatar_url}" />
          </a>
        </figure>
      </div>
      <div class="media-content">
        <p class="title is-5 is-size-6-mobile mb-1">
          <a href="https://github.com/${
            field.actor.display_login
          }" target="_blank">
            ${field.actor.display_login}
          </a>
        </p>
        <p class="subtitle is-6">
          ${eventType}
          <span class="date">${timeSince(new Date(field.created_at))}</span>
        </p>
      </div>
    </div>

    <div class="content text mt-3">
      <h3 class="title is-size-5 mb-0 pb-0">
        ${link ? `<a href="${link}" target="_blank">` : ""}
          <span class="iconify" data-icon="${icon}" style="color: ${iconColor};"></span>
          <span>${header}</span>

        ${link ? "</a>" : ""}
      </h3>
      ${
        content
          ? `<div class="mt-3">${sanitizeAndConvertToHtml(content)}</div>`
          : ""
      }
    </div>
  </div>
</div>
<hr />
`;

        // Insert the template into the DOM
        $(".feed-container").append(template);
      });

      if (options.loadMore) {
        $("#load-more").remove();
        $(".feed-container").append(`
          <button class="button with-text is-orange" id="load-more">
            <span class="fas fa-plus"></span>
            Load more
          </button>
        `);

        $("#load-more").click(() => {
          createActivityFeed({
            posts: 30,
            loadMore: true,
            addPage: true,
          });
          $("#load-more")
            .removeAttr("href")
            .removeClass("black")
            .addClass("gray");
        });
      }

      if (options.addPage) {
        window.__githubApiPage++;
      }

      $(window).trigger("resize");

      if (options.callback) {
        options.callback();
      }
    },
  );
}

const showLoading = function () {
    if ($(".loading-overlay").length) {
      return;
    }
    $("body").append(
      '<div class="loading-overlay"><div class="spinner"></div></div>',
    );
  },
  closeLoading = function () {
    var overlay = $(".loading-overlay");
    overlay.fadeOut(500, function () {
      overlay.remove();
    });
  };
