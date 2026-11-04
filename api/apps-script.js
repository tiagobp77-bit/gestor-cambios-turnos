const { randomUUID } = require('node:crypto');
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygKJNFP05Ck8OcvfoBTHYzyvV0oNFQoONZMAu5ZlXuEYUcGgkUVAmepWtYSCgrcf0WCw/exec";
const STAGING_ORIGIN = "https://gestor-cambios-turnos-staging.vercel.app";
const ALLOWED_ORIGINS = new Set([STAGING_ORIGIN, 'https://gestor-cambios-turnos.vercel.app', 'https://turno-sync.vercel.app', 'https://turnosync-tiagobp77-bits-projects.vercel.app', 'https://turnosync-git-main-tiagobp77-bits-projects.vercel.app']);
const READ_ACTIONS = new Set(['checkDashboardCollision', 'getDashboard', 'getDoctors', 'getHistory', 'getTomorrowOrganization', 'getDraft', 'getHealth']);

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Vary', 'Origin');
  if (ALLOWED_ORIGINS.has(req.headers.origin)) res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Max-Age', '600');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({status:'error',code:'METHOD_NOT_ALLOWED',message:'Método no permitido'});

  const requestId = randomUUID();
  res.setHeader('X-TurnoSync-Request-Id', requestId);
  const actionValue = req.method === 'GET' ? req.query?.action : req.body?.action;
  const action = typeof actionValue === 'string' && /^[a-zA-Z]{1,40}$/.test(actionValue) ? actionValue : 'unknown';
  const readOnly = READ_ACTIONS.has(action);
  const started = Date.now();
  const controller = new AbortController();
  // Longer than the Apps Script document-lock wait; writes include audit/rollback.
  const timeoutMs = readOnly ? 60000 : 240000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const log = (level, fields) => console[level](JSON.stringify({event:'turnosync_backend',requestId,action,durationMs:Date.now()-started,...fields}));
  const fail = (status, code, message, extra = {}) => {
    log('error', {code,httpStatus:status,...extra});
    return res.status(status).json({status:'error',code,message,requestId,uncertain:!readOnly});
  };
  try {
    let upstreamUrl = APPS_SCRIPT_URL;
    const options = {method:req.method,redirect:'follow',signal:controller.signal,headers:{Accept:'application/json'}};
    if (req.method === 'GET') {
      const url = new URL(APPS_SCRIPT_URL);
      Object.entries(req.query || {}).forEach(([key,value]) => {
        if (Array.isArray(value)) value.forEach(item => url.searchParams.append(key,String(item)));
        else if (value !== undefined) url.searchParams.set(key,String(value));
      });
      upstreamUrl = url.toString();
    } else {
      options.headers['Content-Type'] = 'text/plain;charset=utf-8';
      options.body = JSON.stringify({...req.body,requestId});
    }
    const upstream = await fetch(upstreamUrl, options);
    if (!upstream.ok) {
      const auth = [401,403].includes(upstream.status);
      return fail(502,auth?'UPSTREAM_AUTH':'UPSTREAM_HTTP',auth?'Google rechazó el acceso al servicio. Contacta al administrador.':'Google no pudo completar la solicitud. Inténtalo de nuevo.',{upstreamStatus:upstream.status});
    }
    const body = await upstream.text();
    let data;
    try { data = JSON.parse(body); } catch { return fail(502,'UPSTREAM_INVALID_JSON','El servicio devolvió una respuesta inesperada. No se pudo confirmar el resultado.'); }
    if (!data || !['success','error','pending'].includes(data.status)) return fail(502,'UPSTREAM_INVALID_RESPONSE','El servicio no confirmó el resultado de la operación.');
    const code = typeof data.code === 'string' && /^[A-Z_]{1,60}$/.test(data.code) ? data.code : undefined;
    log(data.status === 'error' ? 'warn' : 'info',{code:code || data.status,httpStatus:200});
    return res.status(200).json({...data,requestId});
  } catch (error) {
    const timedOut = controller.signal.aborted;
    return fail(timedOut?504:502,timedOut?'UPSTREAM_TIMEOUT':'UPSTREAM_CONNECTION',timedOut?'El servicio tardó más de lo esperado. No se pudo confirmar el resultado.':'Se interrumpió la conexión con Google. No se pudo confirmar el resultado.',{errorType:timedOut?'timeout':'connection'});
  } finally { clearTimeout(timeout); }
};
