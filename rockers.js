(function(){
  var el = document.getElementById("rockerContent");
  if (!el) return;
  var x = new XMLHttpRequest();
  x.open("GET", "https://joelthebrave.github.io/events.json?" + Date.now());
  x.onload = function() {
    try {
      var data = JSON.parse(x.responseText);
      var found = null;
      for (var i = 0; i < data.length; i++) {
        if (data[i].title === "Rockers Reunion") {
          found = data[i];
          break;
        }
      }
      if (found) {
        var d = new Date(found.startDate + "T00:00:00");
        var dt = d.toLocaleDateString("en-GB", {day:"numeric",month:"long"});
        el.innerHTML = "<div class='rocker-date'>" + dt + "</div><div class='rocker-headline'>" + found.headline + "</div><div class='rocker-venue'>Earl Haig Club - Whitchurch</div>";
      } else {
        el.innerHTML = "<div class='no-rocker'>No Rockers Reunion scheduled</div>";
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
