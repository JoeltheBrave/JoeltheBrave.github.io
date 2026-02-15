(function(){
  var tbody = document.querySelector("#dataTable tbody");
  if (!tbody) return;
  var x = new XMLHttpRequest();
  x.open("GET", "https://joelthebrave.github.io/events.json?" + Date.now());
  x.onload = function() {
    try {
      var data = JSON.parse(x.responseText);
      var html = "";
      var count = 0;
      for (var i = 0; i < data.length; i++) {
        if (count >= 10) break;
        var ev = data[i];
        var d = new Date(ev.startDate + "T00:00:00");
        var dt = d.toLocaleDateString("en-GB", {day:"numeric",month:"short"}).toUpperCase();
        var link = "";
        if (ev.isFree) {
          link = "<td class='ehc-action'><a href='" + ev.webLink + "' target='_blank' class='ehc-button'>View Event</a></td>";
        } else if (ev.tickets && ev.tickets.length > 0 && ev.tickets[0].url) {
          link = "<td class='ehc-action'><a href='" + ev.tickets[0].url + "' target='_blank' class='ehc-button tickets'>Tickets</a></td>";
        } else if (ev.webLink) {
          link = "<td class='ehc-action'><a href='" + ev.webLink + "' target='_blank' class='ehc-button'>View Event</a></td>";
        } else {
          link = "<td class='ehc-action'><span class='ehc-no-link'>Coming soon</span></td>";
        }
        html += "<tr><td class='ehc-date'>" + dt + "</td><td class='ehc-headline'>" + ev.headline + "</td>" + link + "</tr>";
        count++;
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
