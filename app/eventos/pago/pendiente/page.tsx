import Link from "next/link";

export default function EventoPagoPendientePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f5e9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "680px",
          background: "#fff",
          borderRadius: "28px",
          padding: "48px 38px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#fff4cc",
            color: "#9a7200",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 22px",
            fontSize: "28px",
            fontWeight: 900,
          }}
        >
          …
        </div>

        <div
          style={{
            color: "#9a7200",
            fontWeight: 900,
            textTransform: "uppercase",
            fontSize: "13px",
            letterSpacing: "0.5px",
            marginBottom: "10px",
          }}
        >
          Pago pendiente
        </div>

        <h1
          style={{
            fontSize: "clamp(34px, 5vw, 48px)",
            lineHeight: 1.05,
            margin: "0 0 18px",
            fontWeight: 900,
          }}
        >
          Estamos esperando la confirmación de tu pago
        </h1>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.5,
            margin: "0 0 10px",
          }}
        >
          Mercado Pago todavía está procesando la transacción.
        </p>

        <p
          style={{
            fontSize: "16px",
            lineHeight: 1.55,
            color: "#666",
            margin: "0 auto 30px",
            maxWidth: "520px",
          }}
        >
          Tu registro quedará confirmado cuando recibamos la aprobación del
          pago. No es necesario realizar otro pago mientras la transacción
          continúe pendiente.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/eventos"
            style={{
              display: "inline-block",
              background: "#ffd400",
              color: "#111",
              padding: "14px 24px",
              borderRadius: "999px",
              fontWeight: 900,
              textDecoration: "none",
              minWidth: "190px",
            }}
          >
            Volver a eventos
          </Link>

          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#111",
              padding: "14px 24px",
              borderRadius: "999px",
              border: "1px solid #111",
              fontWeight: 800,
              textDecoration: "none",
              minWidth: "170px",
            }}
          >
            Volver al inicio
          </Link>
        </div>

        <p
          style={{
            marginTop: "30px",
            marginBottom: 0,
            color: "#888",
            fontSize: "13px",
          }}
        >
          Cuando Mercado Pago confirme la transacción, el sistema actualizará
          automáticamente el estado de tu pedido.
        </p>
      </section>
    </main>
  );
}