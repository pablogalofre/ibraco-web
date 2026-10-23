"use client";
import { useState, type FormEvent } from "react";
import { consultation } from "../lib/course-catalog";
export default function LevelConsultation() {
 const [ready, setReady] = useState(false);
 function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message = `Hola, soy ${String(form.get("name") || "").trim()}. Estoy en ${form.get("country")}. Mi objetivo es ${form.get("objective")}. Quiero orientación sobre la prueba de nivel y cómo inscribirme.`;
  setReady(true);
  window.location.assign(consultation(message));
 }
 return <form className="test-card qa-contact" onSubmit={submit}>
  <label htmlFor="level-name">Nombre</label><input id="level-name" name="name" autoComplete="name" required maxLength={120} placeholder="Tu nombre" />
  <label htmlFor="level-country">País</label><select id="level-country" name="country">{["Colombia","México","Estados Unidos","Otro país"].map(value => <option key={value}>{value}</option>)}</select>
  <label htmlFor="level-objective">Objetivo</label><select id="level-objective" name="objective">{["Aprender desde cero","Mejorar mi nivel","Prepararme para Celpe-Bras","Portugués para empresa","Portugués para mi hijo(a)","Viajar o estudiar en Brasil"].map(value => <option key={value}>{value}</option>)}</select>
  <p style={{fontSize:14,margin:0}}>Continuarás en WhatsApp con tus datos para recibir orientación de IBRACO.</p>
  <button className="btn btn-primary" type="submit">Consultar mi nivel</button>
  {ready && <p role="status">Abriendo WhatsApp para enviar tu consulta.</p>}
 </form>;
}
