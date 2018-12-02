//Author : unsuitable001
$(document).ready(function(){
    $.getJSON('https://api.github.com/orgs/openwisp/events', function(data) {
        

    var loopstart=0;
    var maxActShow=5;
    var loopend=loopstart+maxActShow;
    loopstart=ghApiHandler(data,loopstart,loopend);
    loopend=loopstart+maxActShow;
    $("#gh-act-load").click(function(){
        if(loopstart<29){
        loopstart=ghApiHandler(data,loopstart,loopend);
        loopend=loopstart+maxActShow;
        }
        else{
            alert('No more data to fetch!');
        }

    });
    
    });
    
    });


    //data handling function
    function ghApiHandler(data,j,k){

        for(var i=j; i<k; i++)
        {    
            var created = new Date(data[i].created_at);
            var now = new Date();
            var milliSecs = (now-created);
            var msSecs = 1000;
            var msMins = (msSecs * 60);
            var msHours = (msMins * 60);
            var numHours = Math.floor(milliSecs/msHours);
            var numMins = Math.floor((milliSecs - (numHours * msHours)) / msMins);
            var numSecs = Math.floor((milliSecs - (numHours * msHours) - (numMins * msMins))/ msSecs);
            if (numSecs < 10){
                numSecs = "0" + numSecs;
            }
            if (numMins < 10){
                numMins = "0" + numMins;
            }
            var span = (numHours + " Hours " + numMins + " Minutes " + numSecs  + " Seconds Ago");
        
            var fn = data[i].type;
    
            if(fn==="WatchEvent")
            {
                WatchEvent(data[i].actor.login,data[i].actor.avatar_url,data[i].repo.name,span);
            }
            else if(fn==="ForkEvent")
            {
                ForkEvent(data[i].actor.login,data[i].actor.avatar_url,data[i].repo.name,span);
            }
            else if(fn==="PushEvent")
            {
                PushEvent(data[i].actor.login,data[i].actor.avatar_url,data[i].repo.name,span);
            }
            else if(fn==="IssuesEvent")
            {
                IssuesEvent(data[i].actor.login,data[i].actor.avatar_url,data[i].repo.name,span,data[i].payload.action,data[i].payload.issue.title,data[i].payload.issue.html_url);
            }
            else if(fn==="IssueCommentEvent")
            {
                IssueCommentEvent(data[i].actor.login,data[i].actor.avatar_url,data[i].repo.name,span,data[i].payload.action,data[i].payload.issue.title,data[i].payload.issue.html_url);
            }
            else if(fn==="PullRequestEvent")
            {
                PullRequestEvent(data[i].actor.login,data[i].actor.avatar_url,data[i].repo.name,span,data[i].payload.action,data[i].payload.pull_request.title,data[i].payload.pull_request.html_url);
            }
            else if(fn==="PullRequestReviewCommentEvent")
            {
                PullRequestReviewCommentEvent(data[i].actor.login,data[i].actor.avatar_url,data[i].repo.name,span,data[i].payload.action,data[i].payload.pull_request.title,data[i].payload.pull_request.html_url);
            }
            else
            {
               defaultevent(data[i].actor.login,data[i].actor.avatar_url,data[i].repo.name,span); 
            }
        }
        return i;

    }




    //event handling functions
    
    function WatchEvent(id,avatar,repo,timespan){
        var e = $('<div class="ui segments"><div class="ui blue segment"><p><img class="ui avatar image" src="'
        +avatar+'"><i class="star icon"></i><a href="https://github.com/'
        +id+'">'
        +id+'</a> starred <a href="https://github.com/'
        +repo+'">'
        +repo+'</a></p></div><div class="ui secondary segment"><p class="tiny text">'
        +timespan+'</p><p align="right"><a href="https://github.com/'
        +repo+'" class="ui secondary basic button"><i class="github icon"></i> View on Github</a></p></div></div>');
        $('#gh-activity-content').append(e);
    
    }
    
    function ForkEvent(id,avatar,repo,timespan){
        var e = $('<div class="ui segments"><div class="ui black segment"><p><img class="ui avatar image" src="'
        +avatar+'"><i class="fork code icon"></i><a href="https://github.com/'
        +id+'">'
        +id+'</a> forked <a href="https://github.com/'
        +repo+'">'
        +repo+'</a></p></div><div class="ui secondary segment"><p class="tiny text">'
        +timespan+'</p><p align="right"><a href="https://github.com/'
        +repo+'" class="ui secondary basic button"><i class="github icon"></i> View on Github</a></p></div></div>');
        $('#gh-activity-content').append(e);
    
    }
    
    function PushEvent(id,avatar,repo,timespan){
        var e = $('<div class="ui segments"><div class="ui green segment"><p><img class="ui avatar image" src="'
        +avatar+'"><i class="sync icon"></i><a href="https://github.com/'
        +id+'">'
        +id+'</a> had a commit on <a href="https://github.com/'
        +repo+'">'
        +repo+'</a></p></div><div class="ui secondary segment"><p class="tiny text">'
        +timespan+'</p><p align="right"><a href="https://github.com/'
        +repo+'" class="ui secondary basic button"><i class="github icon"></i> View on Github</a></p></div></div>');
        $('#gh-activity-content').append(e);
    
    }
    
    function defaultevent(id,avatar,repo,timespan){
        var e = $('<div class="ui segments"><div class="ui red segment"><p><img class="ui avatar image" src="'
        +avatar+'"><i class="history icon"></i><a href="https://github.com/'
        +id+'">'
        +id+'</a> had an activity on <a href="https://github.com/'
        +repo+'">'
        +repo+'</a></p></div><div class="ui secondary segment"><p class="tiny text">'
        +timespan+'</p><p align="right"><a href="https://github.com/'
        +repo+'" class="ui secondary basic button"><i class="github icon"></i> View on Github</a></p></div></div>');
        $('#gh-activity-content').append(e);
    
    }
    
    function IssuesEvent(id,avatar,repo,timespan,action,title,url){
        var e = $('<div class="ui segments"><div class="ui yellow segment"><p><img class="ui avatar image" src="'
        +avatar+'"><i class="exclamation circle icon"></i><a href="https://github.com/'
        +id+'">'
        +id+'</a> '
        +action+' an issue <a href="https://github.com/'
        +repo+'">'
        +repo+'</a></p></div><div class="ui secondary segment"><p class="ui medium header">'
        +title+'</p><p class="tiny text">'
        +timespan+'</p><p align="right"><a href="'
        +url+'" class="ui secondary basic button"><i class="github icon"></i> View on Github</a></p></div></div>');
        $('#gh-activity-content').append(e);
    
    }
    
    function IssueCommentEvent(id,avatar,repo,timespan,action,title,url){
        var e = $('<div class="ui segments"><div class="ui purple segment"><p><img class="ui avatar image" src="'
        +avatar+'"><i class="comment icon"></i><a href="https://github.com/'
        +id+'">'+id+'</a> '
        +action+' a comment <a href="https://github.com/'
        +repo+'">'
        +repo+'</a></p></div><div class="ui secondary segment"><p class="ui medium header">'
        +title+'</p><p class="tiny text">'
        +timespan+'</p><p align="right"><a href="'
        +url+'" class="ui secondary basic button"><i class="github icon"></i> View on Github</a></p></div></div>');
        $('#gh-activity-content').append(e);
    
    }
    
    function PullRequestEvent(id,avatar,repo,timespan,action,title,url){
        var e = $('<div class="ui segments"><div class="ui pink segment"><p><img class="ui avatar image" src="'
        +avatar+'"><i class="plus icon"></i><a href="https://github.com/'
        +id+'">'
        +id+'</a> '
        +action+' a Pull Request <a href="https://github.com/'
        +repo+'">'
        +repo+'</a></p></div><div class="ui secondary segment"><p class="ui medium header">'
        +title+'</p><p class="tiny text">'
        +timespan+'</p><p align="right"><a href="'
        +url+'" class="ui secondary basic button"><i class="github icon"></i> View on Github</a></p></div></div>');
        $('#gh-activity-content').append(e);
    
    }
    
    function PullRequestReviewCommentEvent(id,avatar,repo,timespan,action,title,url){
        var e = $('<div class="ui segments"><div class="ui purple segment"><p><img class="ui avatar image" src="'
        +avatar+'"><i class="comment icon"></i><a href="https://github.com/'
        +id+'">'
        +id+'</a> '
        +action+' a comment on a Pull Request <a href="https://github.com/'
        +repo+'">'
        +repo+'</a></p></div><div class="ui secondary segment"><p class="ui medium header">'
        +title+'</p><p class="tiny text">'
        +timespan+'</p><p align="right"><a href="'
        +url+'" class="ui secondary basic button"><i class="github icon"></i> View on Github</a></p></div></div>');
        $('#gh-activity-content').append(e);
    
    }