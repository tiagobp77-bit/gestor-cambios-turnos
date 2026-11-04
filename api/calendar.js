function escapeIcs(value) {
  var text = String(value || "");
  var slash = String.fromCharCode(92);
  return text
    .split(String.fromCharCode(13)).join("")
    .split(String.fromCharCode(10)).join(slash + "n")
    .split(";").join(slash + ";")
    .split(",").join(slash + ",");
}

function isDateTime(value) {
  return typeof value === "string" &&
    value.length === 15 &&
    value.charAt(8) === "T" &&
    !Number.isNaN(Number(value.slice(0, 8) + value.slice(9)));
}

module.exports = function handler(req, res) {
  var text = req.query.text || "Turno";
  var dates = req.query.dates || "";
  var details = req.query.details || "";
  var location = req.query.location || "";
  var range = String(dates).split("/");
  var start = range[0];
  var end = range[1];

  if (!isDateTime(start) || !isDateTime(end)) {
    res.status(400).send("Fechas de calendario invalidas.");
    return;
  }

  var stamp = new Date().toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "");

  var ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TurnoSync//Calendario//ES",
    "CALSCALE:GREGORIAN",
    "X-WR-TIMEZONE:America/Bogota",
    "BEGIN:VEVENT",
    "UID:" + stamp + "@turnosync",
    "DTSTAMP:" + stamp,
    "DTSTART;TZID=America/Bogota:" + start,
    "DTEND;TZID=America/Bogota:" + end,
    "SUMMARY:" + escapeIcs(text),
    "DESCRIPTION:" + escapeIcs(details),
    "LOCATION:" + escapeIcs(location),
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join(String.fromCharCode(13, 10));

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="Turno_Asignado.ics"');
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(ics);
};
