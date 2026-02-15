(function(){
  var el = document.getElementById("jamContent");
  if (!el) return;
  var x = new XMLHttpRequest();
  x.open("GET", "https://joelthebrave.github.io/events.json?" + Date.now());
  x.onload = function() {
    try {
      var data = JSON.parse(x.responseText);
      var today = new Date();
      today.setHours(0,0,0,0);
      var found = null;
      for (var i = 0; i < data.length; i++) {
        var d = new Date(data[i].startDate + "T00:00:00");
        var diff = (d - today) / 86400000;
        if (d.getDay() === 1 && diff >= 0 && diff < 7) {
          found = data[i];
          break;
        }
      }
      if (found) {
        var dt = new Date(found.startDate + "T00:00:00").toLocaleDateString("en-GB", {day:"numeric",month:"long"});
        el.innerHTML = "<div class='jam-date'>" + dt + "</div><div class='jam-headline'>" + found.headline + "</div><div class='jam-venue'>Earl Haig Club - Whitchurch</div>";
      } else {
        var day = today.getDay();
        var diff2 = (day === 0) ? 1 : (day === 1) ? 0 : (8 - day);
        var monday = new Date(today);
        monday.setDate(today.getDate() + diff2);
        var mdt = monday.toLocaleDateString("en-GB", {day:"numeric",month:"long"});
        el.innerHTML = "<div class='no-event'>No jam on " + mdt + "</div>";
      }
    } catch(e) {
      el.textContent = "Error: " + e.message;
    }
  };
  x.onerror = function() {
    el.textContent = "Failed to fetch events";
  };
  x.send();
})();
