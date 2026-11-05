"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { PROMOTION_PAGES, colombiaInput, fromColombiaInput, promotionErrors, promotionState, type Promotion } from "../../lib/promotions";
import AdvertisingMetrics from "./advertising-metrics";
import PromotionModal from "../../components/promotion-modal";
import styles from "./advertising.module.css";

function newPromotion(): Promotion {
  const start = new Date(); start.setSeconds(0, 0);
  return { id: "", name: "", image_url: "", image_alt: "", target_url: "", button_label: "Habla con nosotros por WhatsApp", pages: ["/cursos"], enabled: false,
    starts_at: start.toISOString(), ends_at: new Date(start.getTime() + 86400000).toISOString(), delay_seconds: 2, priority: 10, version: 0 };
}
const imageTypes: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const formatDate = (date: string) => new Date(date).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "medium", timeStyle: "short" });

export default function AdvertisingPage() {
  const router = useRouter();
  const [access, setAccess] = useState("loading");
  const [records, setRecords] = useState<Promotion[]>([]);
  const [form, setForm] = useState<Promotion | null>(null);
  const [baseline, setBaseline] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [conflict, setConflict] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const lock = useRef(false);
  const dirty = form !== null && JSON.stringify(form) !== baseline;
  const dirtyRef = useRef(false); dirtyRef.current = dirty;

  useEffect(() => {
    let alive = true;
    async function authorize() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!alive) return;
        if (authError || !user) { router.replace("/admin/login"); return; }
        const { data, error: permissionError } = await supabase.from("admin_profiles").select("can_content,is_superadmin").eq("user_id", user.id).single();
        if (alive) setAccess(!permissionError && (data?.can_content || data?.is_superadmin) ? "allowed" : "denied");
      } catch { if (alive) setAccess("denied"); }
    }
    void authorize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setAccess("loading"); setRecords([]); setForm(null); router.replace("/admin/login"); }
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, [router]);
  useEffect(() => {
    function leave(event: BeforeUnloadEvent) { if (dirtyRef.current || lock.current) { event.preventDefault(); event.returnValue = ""; } }
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, []);
  useEffect(() => {
    if (access !== "allowed") return;
    let alive = true;
    void supabase.from("site_promotions").select("*").order("updated_at", { ascending: false }).limit(200).then(({ data, error: readError }) => {
      if (!alive) return;
      if (readError) { setError("El gestor de publicidad todavía no está habilitado. Ejecuta el SQL de instalación en Supabase y vuelve a cargar esta página."); return; }
      setRecords((data ?? []) as Promotion[]); setLoaded(true);
      const initial = (data?.[0] as Promotion | undefined) ?? newPromotion(); setForm(initial); setBaseline(JSON.stringify(initial));
    });
    return () => { alive = false; };
  }, [access]);

  function choose(record?: Promotion) {
    if (lock.current || (dirty && !window.confirm("¿Descartar los cambios sin guardar?"))) return;
    const next = record ?? newPromotion(); setForm(next); setBaseline(JSON.stringify(next)); setConflict(false); setError(""); setNotice(""); setPreview(false);
  }
  function change<K extends keyof Promotion>(key: K, value: Promotion[K]) {
    setForm(current => current ? { ...current, [key]: value } : current); setNotice(""); setError("");
  }
  function validate(current: Promotion) {
    const errors = promotionErrors(current);
    if (errors.length) { setError(errors.join(" ")); return false; }
    return true;
  }
  async function upload(file?: File) {
    if (!file || lock.current) return;
    const extension = imageTypes[file.type];
    if (!extension || file.size > 5 * 1024 * 1024) { setError("Usa una imagen JPG, PNG, WebP o AVIF de máximo 5 MB."); return; }
    lock.current = true; setBusy("upload"); setError("");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user || authError) throw new Error("Tu sesión venció. Ingresa de nuevo.");
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("site-promotions").upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error("No se pudo subir la imagen. Revisa tu conexión y que el módulo esté habilitado en Supabase.");
      const { data } = supabase.storage.from("site-promotions").getPublicUrl(path);
      change("image_url", data.publicUrl); setNotice("Imagen cargada. Guarda la campaña para aplicar el cambio.");
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo subir la imagen."); }
    finally { lock.current = false; setBusy(""); }
  }
  async function save() {
    if (!form || lock.current || conflict || !validate(form)) return;
    if (form.enabled && Date.parse(form.ends_at) <= Date.now()) { setError("Actualiza la fecha de retiro antes de activar esta campaña."); return; }
    if (form.enabled && !window.confirm("¿Guardar y activar esta campaña en las páginas y fechas seleccionadas? Los cambios guardados se reflejan en la web en aproximadamente un minuto.")) return;
    lock.current = true; setBusy("save"); setError(""); setNotice("");
    try {
      const { name, image_url, image_alt, target_url, button_label, pages, enabled, starts_at, ends_at, delay_seconds, priority } = form;
      const payload = { name: name.trim(), image_url: image_url.trim(), image_alt: image_alt.trim(), target_url: target_url.trim(), button_label: button_label.trim(), pages, enabled, starts_at, ends_at, delay_seconds, priority };
      const result = form.id ? await supabase.from("site_promotions").update(payload).eq("id", form.id).eq("version", form.version).select("*").maybeSingle()
        : await supabase.from("site_promotions").insert(payload).select("*").single();
      if (result.error) throw new Error("No se pudo guardar. Revisa tu conexión, tus permisos y las fechas.");
      if (!result.data) { setConflict(true); throw new Error("Otra persona modificó esta campaña. Tus cambios siguen en pantalla; recarga la versión guardada antes de continuar."); }
      const saved = result.data as Promotion;
      setRecords(current => [saved, ...current.filter(p => p.id !== saved.id)]); setForm(saved); setBaseline(JSON.stringify(saved));
      setNotice(saved.enabled ? "Campaña guardada. Se mostrará únicamente dentro de las fechas y páginas elegidas; actualización pública en aproximadamente un minuto." : "Campaña guardada y desactivada. No aparecerá en la web; una ventana ya abierta se retira en aproximadamente un minuto.");
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar."); }
    finally { lock.current = false; setBusy(""); }
  }
  async function reloadSaved() {
    if (!form?.id || lock.current || !window.confirm("¿Reemplazar tus cambios por la última versión guardada?")) return;
    lock.current = true; setBusy("reload");
    const { data, error: readError } = await supabase.from("site_promotions").select("*").eq("id", form.id).single();
    lock.current = false; setBusy("");
    if (readError) { setError("No pudimos recargar la campaña."); return; }
    setForm(data); setBaseline(JSON.stringify(data)); setConflict(false); setError("");
    setRecords(current => [data, ...current.filter(p => p.id !== data.id)]);
  }
  if (access !== "allowed") return <main className={styles.loading}><h1>{access === "loading" ? "Cargando publicidad…" : "Acceso no autorizado"}</h1><p>{access === "denied" ? "Necesitas permiso de contenidos o superadministrador." : "Estamos verificando tu sesión."}</p><a href="/admin">Volver al administrador</a></main>;

  return <main className={styles.page}>
    <header className={styles.header}><div><a href="/admin" onClick={e => { if (lock.current || (dirty && !window.confirm("¿Salir sin guardar los cambios?"))) e.preventDefault(); }}>← Centro de administración</a><span className={styles.eyebrow}>CAMPAÑAS Y NOVEDADES</span><h1>Publicidad y pop-ups</h1><p>Una imagen, un enlace y tus fechas. Prepara tus anuncios desde aquí.</p></div>
      <button type="button" className={styles.primary} disabled={Boolean(busy) || !loaded} onClick={() => choose()}>+ Nueva campaña</button></header>
    <AdvertisingMetrics />
    {error && <div className={styles.error} role="alert">{error}{conflict && <button type="button" onClick={() => void reloadSaved()} disabled={Boolean(busy)}>Recargar versión guardada</button>}</div>}
    {notice && <div className={styles.notice} role="status">{notice}</div>}
    <div className={styles.grid}><aside className={styles.sidebar}><h2>Mis campañas</h2><p className={styles.help}>Activas, programadas y anteriores.</p>
      {records.map(record => <button type="button" className={`${styles.campaign} ${form?.id === record.id ? styles.selected : ""}`} key={record.id} onClick={() => choose(record)} disabled={Boolean(busy)}><strong>{record.name}</strong><span>{promotionState(record)}</span><small>Hasta {formatDate(record.ends_at)}</small></button>)}
      {loaded && records.length === 0 && <p>Aún no hay campañas.</p>}
      <p className={styles.help}>Solo se muestra una promoción por visita y una vez por campaña en cada sesión. Si coinciden varias, se elige la de mayor prioridad.</p></aside>
      {form && <section className={styles.editor}><div className={styles.editorHeading}><div><h2>{form.id ? "Editar campaña" : "Nueva campaña"}</h2><span className={styles.status}>{dirty ? "Cambios sin guardar" : promotionState(form)}</span></div><button type="button" className={styles.secondary} disabled={Boolean(busy)} onClick={() => { if (validate(form)) setPreview(true); }}>Vista previa ↗</button></div>
        <fieldset disabled={Boolean(busy) || conflict} className={styles.fields}>
          <label>Nombre de la campaña<input value={form.name} maxLength={100} onChange={e => change("name", e.target.value)} placeholder="Por ejemplo: matrícula de noviembre" /></label>
          <div className={styles.imageBox}>{form.image_url ? <><img src={form.image_url} alt={form.image_alt || "Pieza de la campaña"} className={styles.thumbnail} /><span>La imagen se muestra completa, sin recortar.</span></> : <><strong>Tu próxima promoción empieza aquí</strong><p>Sube la pieza que te envíe el equipo.</p></>}
            <label className={styles.upload}>{busy === "upload" ? "Subiendo…" : "Subir o cambiar imagen"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; void upload(file); }} /></label><small>JPG, PNG, WebP o AVIF · Hasta 5 MB</small></div>
          <label>Dirección de la imagen<input value={form.image_url} maxLength={2048} onChange={e => change("image_url", e.target.value)} placeholder="Se completa al subir; también puedes pegar una URL HTTPS" /></label>
          <label>Descripción de la promoción<textarea value={form.image_alt} maxLength={300} rows={2} onChange={e => change("image_alt", e.target.value)} placeholder="Describe la oferta y sus condiciones principales." /><small>Se usa para lectores de pantalla y si la imagen no está disponible.</small></label>
          <div className={styles.two}><label>Enlace al hacer clic<input value={form.target_url} maxLength={2048} onChange={e => change("target_url", e.target.value)} placeholder="https://wa.me/…" /></label><label>Texto del botón<input value={form.button_label} maxLength={80} onChange={e => change("button_label", e.target.value)} /></label></div>
          <h3>¿Dónde debe aparecer?</h3><div className={styles.checks}>{PROMOTION_PAGES.map(([path, label]) => <label key={path}><input type="checkbox" checked={form.pages.includes(path)} onChange={e => change("pages", e.target.checked ? [...form.pages, path] : form.pages.filter(p => p !== path))} />{label}</label>)}</div>
          <p className={styles.help}>Se aplica a las páginas seleccionadas, sin incluir sus subpáginas. Nunca aparece dentro de administración, matrícula o pagos.</p>
          <h3>Programa la campaña</h3><p className={styles.help}>Todos los horarios son de Colombia (Bogotá, UTC-5).</p>
          <div className={styles.two}><label>Inicio<input type="datetime-local" value={colombiaInput(form.starts_at)} onChange={e => change("starts_at", fromColombiaInput(e.target.value))} /></label><label>Retirar automáticamente<input type="datetime-local" value={colombiaInput(form.ends_at)} onChange={e => change("ends_at", fromColombiaInput(e.target.value))} /></label></div>
          <div className={styles.two}><label>Espera antes de aparecer (segundos)<input type="number" min={0} max={30} value={form.delay_seconds} onChange={e => change("delay_seconds", Number(e.target.value))} /></label><label>Prioridad (0 a 100)<input type="number" min={0} max={100} value={form.priority} onChange={e => change("priority", Number(e.target.value))} /></label></div>
          <label className={styles.activation}><input type="checkbox" checked={form.enabled} onChange={e => change("enabled", e.target.checked)} /><span><strong>Activar campaña</strong><small>Al guardar, aparecerá solo en las fechas elegidas. Desmarca y guarda para retirarla.</small></span></label>
        </fieldset>
        <footer className={styles.saveBar}><p>{form.enabled ? "Se guardará activada, respetando las fechas." : "Se guardará desactivada."}</p><button type="button" className={styles.primary} onClick={() => void save()} disabled={Boolean(busy) || conflict || !dirty}>{busy === "save" ? "Guardando…" : "Guardar campaña"}</button></footer>
      </section>}
    </div>
    {preview && form && <PromotionModal key={form.image_url} campaign={form} preview onClose={() => setPreview(false)} />}
  </main>;
}

