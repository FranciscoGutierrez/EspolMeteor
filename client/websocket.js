// Websocket = new WebSocket("ws://localhost:9000/test");
// Websocket = new WebSocket("ws://10.43.48.75/test");
Websocket = new WebSocket("ws://franciscogutierrez10-80.terminal.com/test");
Websocket.onopen    = function(evt) { onOpen(evt)    };
Websocket.onclose   = function(evt) { onClose(evt)   };
Websocket.onmessage = function(evt) { onMessage(evt) };
Websocket.onerror   = function(evt) { onError(evt)   };

function onOpen(evt) { console.log("ws:connected"); }
function onClose(evt) {
  $("#paperToast").attr("text","Connection lost, reconnecting... ");
  document.querySelector('#paperToast').show();
  console.log("ws:offline");
}
function onMessage(evt) {
  var recieved = JSON.parse(evt.data);
  Session.set("riskValue",recieved.risk);
  Session.set("qualityValue",recieved.quality);
  // console.log(recieved);
  $(document).ready(function() {
    if($(".loading-screen")) $(".loading-screen").fadeOut(300,function(){
      var grades = {courses: Session.get("courses"), student: Session.get("student")};
      Meteor.subscribe("grades", grades, function() {
        $(".loading-screen").remove();
      });
    });
  });
}

function onError(evt) { console.log("ws:error: " + evt.data); }
function doSend(message) {
  console.log("ws:doSend: " + message);
  Websocket.send(message);
  $("#paperToast").attr("text","Loading...");
  document.querySelector('#paperToast').show();
}

$(document).ready(function() {
  setInterval(function(){
    var string   = "";
    var request  = "";
    var dataTo   = Session.get('data-to');
    var dataFrom = Session.get('data-from');
    var courses  = Session.get('courses');
    var student  = Session.get('student');
    if(Websocket.readyState == 1) {
      if(courses) {
        // Append the courses
        for (var i=0; i<courses.length-1; i++){ string += '{"id": "'+courses[i]+'", "compliance": 5},'; }
        string += '{"id": "'+courses[courses.length-1]+'", "compliance": 5}';
        // Elaborate the request
        request = '{"requestId": "'+ Meteor.connection._lastSessionId +'",'+
        '"student": [{"id": '+ student +',"gpa": 7.0793,'+
        '"performance": 0.6,"compliance": 3}],'+
        '"courses": ['+ string + '],'+
        '"data": [{"from": '+ dataFrom +',"to": '+ dataTo +','+
        '"program": true,'+
        '"sylabus": true,'+
        '"evaluation": false,'+
        '"instructors": true,'+
        '"compliance": 2}]}';
        // Send the request through websocket
        Websocket.send(request);
        // console.log(request);
      }
    } else if (Websocket.readyState == 3) {
      $("#paperToast").attr("text","Connection lost, reconnecting... ");
      document.querySelector('#paperToast').show();
      Websocket = new WebSocket("ws://franciscogutierrez10-80.terminal.com/test");
      Websocket.onopen    = function(evt) { onOpen(evt)   };
      Websocket.onclose   = function(evt) { onClose(evt)  };
      Websocket.onmessage = function(evt) { onMessage(evt)};
      Websocket.onerror   = function(evt) { onError(evt)  };
    }
  }, 2000);
});
