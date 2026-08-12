const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygKJNFP05Ck8OcvfoBTHYzyvV0oNFQoONZMAu5ZlXuEYUcGgkUVAmepWtYSCgrcf0WCw/exec";

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ status: "error", message: "Método no permitido" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    let upstreamUrl = APPS_SCRIPT_URL;
    const options = {
      method: req.method,
      redirect: "follow",
      signal: controller.signal,
      headers: { Accept: "application/json" }
    };

    if (req.method === "GET") {
      const url = new URL(APPS_SCRIPT_URL);
      Object.entries(req.query || {}).forEach(([key, value]) => {
        if (Array.isArray(value)) value.forEach(item => url.searchParams.append(key, String(item)));
        else if (value !== undefined) url.searchParams.set(key, String(value));
      });
      upstreamUrl = url.toString();
    } else {
      options.headers["Content-Type"] = "text/plain;charset=utf-8";
      options.body = JSON.stringify(req.body || {});
    }

    const upstream = await fetch(upstreamUrl, options);
    const body = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "";

    if (!upstream.ok) {
      return res.status(502).json({ status: "error", message: "El backend de Google no respondió correctamente" });
    }

    if (!contentType.includes("application/json")) {
      try {
        JSON.parse(body);
      } catch {
        return res.status(502).json({ status: "error", message: "Respuesta inesperada del backend" });
      }
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).send(body);
  } catch (error) {
    const message = error && error.name === "AbortError"
      ? "El backend tardó demasiado en responder"
      : "No fue posible conectar con el backend";
    return res.status(502).json({ status: "error", message });
  } finally {
    clearTimeout(timeout);
  }
}
