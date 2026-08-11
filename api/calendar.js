function escapeIcs(value) {
  return String(value || "")
    .replace(/\/g, "\\")
    .replace(/\r?\n/g, "\n")
    .replace(/;/g, "\;")
    .replace(/,/g, "\,");
}

function isDateTime(value) {
  return /^\d{8}T\d{6}$/.test(value);
}

export default function handler(req, res) {
  const { text = "Turno", dates = "", details = "", location = "" } = req.query;
  const [start, end] = String(dates).split("/");

  if (!isDateTime(start) || !isDateTime(end)) {
    res.status(400).send("Fechas de calendario inválidas.");
    return;
  }

  const stamp = new Date().toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

  const ics = [
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
  ].join("\r\n");

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="Turno_Asignado.ics"');
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(ics);
}
