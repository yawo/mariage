/* Author: Yawo Guillaume Kpotufe
*/

$(document).ready(function() {   

    var socket = io.connect();
    
    $('#sender').bind('click', function() {
        socket.emit('message', 'Message Sent on ' + new Date());     
    });
    
    socket.on('server_message', function(data){
        $('#reciever').append('<li>' + data + '</li>');  
    });
    console.log("loaded");
    $('.carousel').carousel({  interval: 2000});
    $('.ajaxForm').ajaxForm(function(res,sth) { 
        console.log("Form sent",res,sth);
        $('.modal').modal('hide');
    });
    $(".closeModal").click(function(){
        $('.modal').modal('hide');
    });    
    $('.offline a').append("&nbsp;&nbsp;");
    $('.offline a').append($("<i class='icon-ok inline'/>"));
});