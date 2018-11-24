var api = "https://api.github.com/orgs/openwisp/";
repolist = [];

$(document).ready(function() {
    loadRepos();
    loadFeed();
});

$("#repoSearch").on("input",function(e){
    if ($(this).val() === "") {
        if ($("#repoSearchResults").attr("class").split(" ").find(e => e === "visible") !== undefined) {
            $("#repoSearchResults").removeClass("transition visible");
        }
    }
    else {
        if ($("#repoSearchResults").attr("class").split(" ").find(e => e === "visible") === undefined) {
            $("#repoSearchResults").addClass("transition visible");
        }

        $("#repoSearchResults").empty();
        matched = repolist.filter(obj => obj.name.match($(this).val()));
        if (matched.length == 0) {
            $("#repoSearchResults").append(
                `<a class="result">
                    <div class="content">
                        <div class="title">No results found</div>
                    </div>
                </a>`
            )

        }
        else for (let i = 0; i < matched.length; ++i) {
            $("#repoSearchResults").append(
                `<a href="${matched[i].html_url}" class="result">
                    <div class="content">
                        <div class="title">${matched[i].name}</div>
                    </div>
                </a>`
            )
        }
    }
});

function loadRepos() {
    let query = api + "repos";
    $.get(query, function(data) {
        data.forEach(function(obj) {
            repolist.push(obj);
            $("#repolist").append(
                `<a href="${obj.html_url}">
                    <i class="bookmark icon"></i>
                    ${obj.name}
                </a><br>`
            );
        });
    })
    .done(function() {
        $("#repolist .spacer").remove();
        $("#repolist div").removeClass("active").addClass("disabled");
    });
}

function loadFeed() {
    let query = api + "events";
    $.get(query, function(data) {
        let map = {};
        data.forEach(function(obj) {
            let avatarUrl = obj.actor.avatar_url;
            let userHandle = obj.actor.display_login;
            let userProfileUrl = `https://github.com/${obj.actor.login}`
            let timestamp = getElapsedTimestamp(obj.created_at);
            let {summary: actionSummary, details: actionDetails, meta: actionMeta} = getEventInfo(obj);

            if (!(obj.type in map)) map[obj.type] = 1;
            else map[obj.type]++;

            $(".feed").append(
                `<div class="event">
                    <div class="label">
                        <img src="${avatarUrl}">
                    </div>
                    <div class="content">
                        <div class="summary">
                            <a class="user" href=${userProfileUrl}>
                                ${userHandle}
                            </a> ${actionSummary}
                            <div class="date">
                                ${timestamp}
                            </div>
                        </div>
                        <div class="extra text">
                           <!-- For additional stuff --> 
                           ${actionDetails}
                        </div>
                        <div class="meta">
                            ${actionMeta}
                        </div>
                    </div>
                </div>
                <div class="ui divider"></div>`
            );
        });
        console.log(map);
        for (let key in map) {
            var splitKey = key.split(/(?=[A-Z])/);
            splitKey.pop();
            var formattedKey = splitKey.join(" ");
            if (map[key] > 1 && formattedKey[formattedKey.length-1] != 's')
                formattedKey += (formattedKey[formattedKey.length-1] == 'h' ? 'e' : '') + "s";
            $(".statistics").append(
                `<div class="ui column statistic">
                    <div class="value">
                        ${map[key]}
                    </div>
                    <div class="label">
                        ${formattedKey}
                    </div>
                </div>`
            );
        }
    })
    .done(function() {
      $(".feed-container .dimmer").removeClass("active").addClass("disabled");
    });
}

function getElapsedTimestamp(timestring) {
    let now = (new Date()).getTime();                     // in ms
    let eventTime = (new Date(timestring)).getTime();     // in ms 
    let elapsed = now - eventTime;                        // in ms

    // constants given in ms
    const timeUnits = [
        { name: "year", ms: 31557600000 },
        { name: "day", ms: 86400000 },
        { name: "hour", ms: 3600000 },
        { name: "minute", ms: 60000 },
        { name: "second", ms: 1000 }
    ];

    bestTimeUnit = timeUnits.find(unit => elapsed >= unit.ms);
    if (bestTimeUnit === undefined)
        return "less than a second ago";

    let diff = Math.round(elapsed/bestTimeUnit.ms);
    return diff + " " + bestTimeUnit.name + (diff == 1 ? "" : "s") + " ago";    
}

function getEventInfo(ev) {
    var eventInfo = {summary: ev.type, details: "", meta: ""};

    switch(ev.type) {
        case "CreateEvent":
            eventInfo.summary = `created a ${ev.payload.ref_type} in <a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a>`;
            eventInfo.details = `<div class="ui raised segment">
                                    <h3><a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a></h3>
                                    ${ev.payload.ref == null ? ev.payload.description : "New "+ev.payload.ref_type+": "+ev.payload.ref}
                                </div>`;
            break;
        case "DeleteEvent":
            eventInfo.summary = `deleted a ${ev.payload.ref_type} in <a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a>`;
            eventInfo.details = `<div class="ui raised segment">
                                    <h3><a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a></h3>
                                    Deleted ${ev.payload.ref}
                                </div>`;
            break;
        case "ForkEvent":
            eventInfo.summary = `forked <a href=${ev.payload.forkee.html_url}>${ev.payload.forkee.full_name}</a>
                                   from <a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a>`;
            eventInfo.details = `<div class="ui raised segment">
                                    <h3><a href=${ev.payload.forkee.html_url}>${ev.payload.forkee.full_name}</a></h3>
                                    ${ev.payload.forkee.description}
                                </div>`;
            eventInfo.meta = `<a class="like"><i class="star icon"></i> ${ev.payload.forkee.stargazers_count} stars</a>`
            break;
        case "IssueCommentEvent":
            eventInfo.summary = `${ev.payload.action} a comment in <a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a>`;
            eventInfo.details = `<div class="ui raised segment">
                                    <h3><a href=${ev.payload.issue.html_url}>${ev.payload.issue.title}</a></h3>
                                    <p>${ev.payload.comment.body}</p>
                                </div>`;
            ev.payload.issue.labels.forEach(function(label) {
                eventInfo.meta += `<a><i class="tag icon"></i> ${label.name}</a>`
            });
            break;
        case "IssuesEvent":
            eventInfo.summary = `${ev.payload.action} an issue in <a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a>`;
            eventInfo.details = `<div class="ui raised segment">
                                    <h3><a href=${ev.payload.issue.html_url}>${ev.payload.issue.title}</a></h3>
                                    <p>${ev.payload.issue.body}</p>
                                </div>`;
            ev.payload.issue.labels.forEach(function(label) {
                eventInfo.meta += `<a><i class="tag icon"></i> ${label.name}</a>`
            });
            break;
        case "PullRequestEvent":
            if (ev.payload.action == "review_requested")
                ev.payload.action = "requested a review for";
            else if (ev.payload.action == "review_request_removed")
                ev.payload.action = "removed a review request for";
            eventInfo.summary = `${ev.payload.action} a pull request in <a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a>`;
            eventInfo.details = `<div class="ui raised segment">
                                    <h3><a href=${ev.payload.pull_request.html_url}>${ev.payload.pull_request.title}</a></h3>
                                    ${ev.payload.pull_request.body}
                                </div>`;
            eventInfo.meta = `<a>#${ev.payload.pull_request.number} created on ${new Date(ev.payload.pull_request.created_at)}</a>`
            break;
        case "PullRequestReviewEvent":
            eventInfo.summary = `${ev.payload.action} a <a href="${ev.payload.review.html_url}>pull request review</a> in <a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a>`;
            eventInfo.details = `<div class="ui raised segment">
                                    <h3><a href=${ev.payload.pull_request.html_url}>${ev.payload.pull_request.title}</a></h3>
                                    ${ev.payload.pull_request.body}
                                </div>`;
            eventInfo.meta = `<a>#${ev.payload.pull_request.number} created on ${new Date(ev.payload.pull_request.created_at)}</a>`
            break;
        case "PullRequestReviewCommentEvent":
            eventInfo.summary = `${ev.payload.action} a <a href="${ev.payload.comment.html_url}">comment</a> on a pull request in <a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a>`;
            eventInfo.details = `<div class="ui raised segment">
                                    <blockquote style="border-left: .25em solid #dfe2e5; color: #6a737d; padding: 0 1em;">
                                        <h3><a href=${ev.payload.pull_request.html_url}>${ev.payload.pull_request.title}</a></h3>
                                        ${ev.payload.pull_request.body}
                                    </blockquote>
                                    <br>
                                    ${ev.payload.comment.body}
                                </div>`;
            eventInfo.meta = `<a>#${ev.payload.pull_request.number} created on ${new Date(ev.payload.pull_request.created_at)}</a>`
            break;
        case "PushEvent":
            eventInfo.summary = `pushed to ${ev.payload.ref} in <a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a>`;
            eventInfo.details = `<div class="ui raised segment">
                                    <h3><a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a></h3>
                                    ${ ev.payload.commits.reduce(
                                        (accumulator, curVal) => accumulator + curVal.message + "\n",
                                        ""
                                    ) }
                                </div>`;
            break;
        case "WatchEvent":
            eventInfo.summary = `started watching <a href=${"https://github.com/" + ev.repo.name}>${ev.repo.name}</a>`;
            break;
    }            

    return eventInfo;
}
