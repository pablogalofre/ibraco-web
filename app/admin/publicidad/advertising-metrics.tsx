"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import styles from "./metrics.module.css";

type Row = { campaign_id: string | null; name: string; page: string; views: number; image_clicks: number; button_clicks: number; whatsapp_clicks: number; clicked_views: number };
type Report = { rows: Row[]; generated_at: string; tracking_started_at: string | null };
const today = () => new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 10);
const monthStart = () => today().slice(0, 8) + "01";
const number = (value: number) => value.toLocaleString("es-CO");
const percentage = (clicks: number, views: number) => views ? `${(100 * clicks / views).toLocaleString("es-CO", { maximumFractionDigits: 1 })}%` : "—";
const time = (date: string) => new Date(date).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" });
function totals(rows: Row[]) { return rows.reduce((sum, row) => ({ views: sum.views + Number(row.views), clicks: sum.clicks + Number(row.image_clicks) + Number(row.button_clicks), whatsapp: sum.whatsapp + Number(row.whatsapp_clicks), clickedViews: sum.clickedViews + Number(row.clicked_views) }), { views: 0, clicks: 0, whatsapp: 0, clickedViews: 0 }); }
export default function AdvertisingMetrics() {
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [report, setReport] = useState<Report | null>(null);
  const [range, setRange] = useState({ from: "", to: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  async function refresh(start: string, end: string) {
    const seq = ++request.current;
    if (!start || !end || end < start || (Date.parse(end) - Date.parse(start)) / 86400000 > 365) { setError("Elige un rango válido de hasta 366 días."); return; }
    setBusy(true); setError("");
    try {
      const { data, error: problem } = await supabase.rpc("site_interaction_report", { p_from: start, p_to: end });
      if (request.current !== seq) return;
      if (problem || !data || !Array.isArray(data.rows)) { setError("No pudimos consultar las métricas. Verifica tu conexión y que se haya ejecutado el SQL de medición con tu usuario autorizado."); return; }
      setReport(data as Report); setRange({ from: start, to: end });
    } catch { if (request.current === seq) setError("No pudimos conectar. Intenta actualizar el reporte."); }
    finally { if (request.current === seq) setBusy(false); }
  }
  useEffect(() => { void refresh(monthStart(), today()); return () => { request.current++; }; }, []);
  const rows = report?.rows ?? [];
  const summary = totals(rows);
  const campaigns = Array.from(new Set(rows.filter(row => row.campaign_id).map(row => row.campaign_id))).map(id => {
    const matching = rows.filter(row => row.campaign_id === id);
    return { id, name: matching[0].name, ...totals(matching), image: matching.reduce((n, row) => n + Number(row.image_clicks), 0), button: matching.reduce((n, row) => n + Number(row.button_clicks), 0) };
  });
  const pages = Array.from(new Set(rows.map(row => row.page))).sort().map(page => ({ page, ...totals(rows.filter(row => row.page === page)) }));
  const pending = from !== range.from || to !== range.to;
  function exportCsv() {
    if (!report) return;
    const safe = (value: unknown) => '"' + String(value ?? "").replace(/^[=+@-]/, "'$&").replace(/"/g, '""') + '"';
    const records: unknown[][] = [["Desde (Colombia)", "Hasta (Colombia)", "Campaña", "Página", "Visualizaciones", "Clics imagen", "Clics botón", "Clics WhatsApp flotante", "Vistas con clic en el período", "CTR (%)"]];
    for (const row of rows) records.push([range.from, range.to, row.name, row.page, row.views, row.image_clicks, row.button_clicks, row.whatsapp_clicks, row.clicked_views, row.views ? (100 * row.clicked_views / row.views).toFixed(2) : ""]);
    const url = URL.createObjectURL(new Blob(["\ufeff" + records.map(record => record.map(safe).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `IBRACO-publicidad-${range.from}-${range.to}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className={styles.panel} aria-label="Resultados de publicidad">
    <div className={styles.heading}><div><span className={styles.eyebrow}>DEL ANUNCIO A LA CONVERSACIÓN</span><h2>Resultados de publicidad</h2><p>Consulta el interés que generan las campañas y el botón de WhatsApp.</p></div><button type="button" onClick={exportCsv} disabled={!report || busy || rows.length === 0}>Descargar CSV</button></div>
    <form className={styles.filters} onSubmit={event => { event.preventDefault(); void refresh(from, to); }}><label>Desde<input type="date" value={from} onChange={event => setFrom(event.target.value)} required /></label><label>Hasta<input type="date" value={to} onChange={event => setTo(event.target.value)} required /></label><button type="submit" disabled={busy}>{busy ? "Consultando…" : "Actualizar métricas"}</button><small>Fechas inclusivas · Hora de Colombia</small></form>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {report && <><p className={styles.caption}>Mostrando {range.from} a {range.to} · Consultado: {time(report.generated_at)}{pending ? " · Cambiaste las fechas: pulsa Actualizar métricas." : ""}{error ? " · Se conserva la última consulta correcta." : ""}</p>
      <div className={styles.cards}><article><span>Visualizaciones de pop-ups</span><strong>{number(summary.views)}</strong></article><article><span>Clics en pop-ups</span><strong>{number(summary.clicks)}</strong></article><article><span>Porcentaje de clics · CTR</span><strong>{percentage(summary.clickedViews, summary.views)}</strong></article><article><span>Clics WhatsApp flotante</span><strong>{number(summary.whatsapp)}</strong></article></div>
      {rows.length === 0 ? <p className={styles.empty}>Todavía no hay eventos registrados en este período. La medición empieza al instalar esta actualización; no recupera clics anteriores.</p> : <>
        <h3>Por campaña</h3><div className={styles.tableWrap}><table><thead><tr><th>Campaña</th><th>Visualizaciones</th><th>Clics imagen</th><th>Clics botón</th><th>Total clics</th><th>CTR</th></tr></thead><tbody>{campaigns.map(row => <tr key={row.id}><th scope="row">{row.name}</th><td>{number(row.views)}</td><td>{number(row.image)}</td><td>{number(row.button)}</td><td>{number(row.clicks)}</td><td>{percentage(row.clickedViews, row.views)}</td></tr>)}{campaigns.length === 0 && <tr><td colSpan={6}>Sin interacciones de pop-ups en estas fechas.</td></tr>}</tbody></table></div>
        <h3>Por página</h3><div className={styles.tableWrap}><table><thead><tr><th>Página</th><th>Visualizaciones pop-ups</th><th>Clics pop-ups</th><th>Clics WhatsApp flotante</th></tr></thead><tbody>{pages.map(row => <tr key={row.page}><th scope="row">{row.page}</th><td>{number(row.views)}</td><td>{number(row.clicks)}</td><td>{number(row.whatsapp)}</td></tr>)}</tbody></table></div>
      </>}
    </>}
    <p className={styles.caption}>CTR: porcentaje de visualizaciones que tuvieron un clic, con ambos eventos dentro del rango elegido. Imagen y botón se cuentan por separado. Cada apertura registra una vista y como máximo un clic. WhatsApp flotante cuenta pulsaciones, no personas únicas. Las vistas previas no se cuentan. Los clics no confirman mensajes enviados ni ventas. No se suman los clics del pop-up al contador de WhatsApp flotante.</p>
    <p className={styles.caption}>Conteos orientativos: bloqueadores, falta de conexión o tráfico automatizado pueden afectar las cifras. Actualiza para consultar los últimos eventos.{report?.tracking_started_at ? ` Primer evento registrado: ${time(report.tracking_started_at)}.` : ""}</p>
  </section>;
}
