//Author : unsuitable001
$(document).ready(function(){
$.getJSON('https://api.github.com/orgs/openwisp/events', function(data) {
    
for(var i=0; i<data.length; i++)
{    
    //console.log(data[i].type)
    //console.log(data[i].actor.login)
    //console.log(data[i].actor.avatar_url)
    //console.log(data[i].repo.name)
    //console.log(data[i].payload.comment.body)
    //console.log("Item "+ i + "Finish")
    try{
    var created = new Date(data[i].created_at);
    var now = new Date()
    //var timespan = (now.getFullYear()-created.getFullYear()) + " Years " + (now.getMonth()-created.getMonth()) + " Months " + (now.getDay()-created.getDay()) + " Days " + (now.getHours()-created.getHours()) + " Hours " + (now.getMinutes()-created.getMinutes()) + " Minutes " + (now.getSeconds()-created.getSeconds()) + " ago";
    var timespan = (now.getHours()-created.getHours()) + " Hours Ago"
    var fn = window[data[i].type]
    fn(data[i].actor.login,data[i].actor.avatar_url,data[i].repo.name,timespan);
    //console.log(new Date(data[i].created_at));
    //console.log(new Date());
    //console.log(new Date()-new Date(data[i].created_at));
    //console.log(timespan)
    
    }
    catch{
        console.log("NF");
   }

    //var e = $('<div class="ui red segment"><p>Test</p></div>');
    //$('#gh-activity-content').append(e);
}


});

});

function WatchEvent(id,avatar,repo,timespan){
    var e = $('<div class="ui segments"><div class="ui blue segment"><p><img class="ui avatar image" src="'+avatar+'"><i class="star icon"></i><a href="https://github.com/'+id+'">'+id+'</a> starred <a href="https://github.com/'+repo+'">'+repo+'</a></p></div><div class="ui secondary segment"><p class="tiny text">'+timespan+'</p><p align="right"><a href="https://github.com/'+repo+'" class="ui secondary basic button"><i class="github icon"></i> View on Github</a></p></div></div>');
    $('#gh-activity-content').append(e);

};

function ForkEvent(id,avatar,repo,timespan){
    var e = $('<div class="ui segments"><div class="ui black segment"><p><img class="ui avatar image" src="'+avatar+'"><i class="fork code icon"></i><a href="https://github.com/'+id+'">'+id+'</a> forked <a href="https://github.com/'+repo+'">'+repo+'</a></p></div><div class="ui secondary segment"><p class="tiny text">'+timespan+'</p><p align="right"><a href="https://github.com/'+repo+'" class="ui secondary basic button"><i class="github icon"></i> View on Github</a></p></div></div>');
    $('#gh-activity-content').append(e);

};
