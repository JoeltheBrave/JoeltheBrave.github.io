(function(){
  var tbody = document.querySelector("#sundayTable tbody");
  if (!tbody) return;
  var x = new XMLHttpRequest();
  x.open("GET", "https://joelthebrave.github.io/events.json?" + Date.now());
  x.onload = function() {
    try {
      var data = JSON.parse(x.responseText);
      var today = new Date();
      today.setHours(0,0,0,0);
      var sundays = [];
      for (var i = 0; i < data.length; i++) {
        var d = new Date(data[i].startDate + "T00:00:00");
        if (d.getDay() === 0 && d >= today) {
          sundays.push(data[i]);
        }
      }
      sundays.sort(function(a,b){ return new Date(a.startDate) - new Date(b.startDate); });
      sundays = sundays.slice(0, 5);
      if (sundays.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3' class='s-cell'>No upcoming Sunday events</td></tr>";
        return;
      }
      var html = "";
      for (var j = 0; j < sundays.length; j++) {
        var ev = sundays[j];
        var dt = new Date(ev.startDate + "T00:00:00").toLocaleDateString("en-GB", {day:"numeric",month:"long"});
        var name = (ev.headline || "").replace(/^Sunday Sessions With\s+/i, "").trim();
        var link = "";
        if (ev.isFree) {
          link = "<a href='" + ev.webLink + "' target='_blank' class='s-btn'>Visit Event</a>";
        } else if (ev.tickets && ev.tickets.length > 0 && ev.tickets[0].url) {
          link = "<a href='" + ev.tickets[0].url + "' target='_blank' class='s-btn s-btn-accent'>Tickets</a>";
        } else if (ev.webLink) {
          link = "<a href='" + ev.webLink + "' target='_blank' class='s-btn'>Visit Event</a>";
        } else {
          link = "<span class='s-cell' style='color:#888'>No link</span>";
        }
        html += "<tr><td class='s-cell s-date'>" + dt + "</td><td class='s-cell s-name'>" + name + "</td><td class='s-cell'>" + link + "</td></tr>";
      }
      tbody.innerHTML = html;
    } catch(e) {
      tbody.innerHTML = "<tr><td colspan='3'>Error: " + e.message + "</td></tr>";
    }
  };
  x.onerror = function() {
    tbody.innerHTML = "<tr><td colspan='3'>Failed to fetch events</td></tr>";
  };
  x.send();
})();
