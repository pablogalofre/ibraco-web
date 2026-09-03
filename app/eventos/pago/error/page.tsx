import Link from "next/link";

export default function EventoPagoErrorPage() {
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
            background: "#fdecec",
            color: "#d93025",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 22px",
            fontSize: "30px",
            fontWeight: 900,
          }}
        >
          ×
        </div>

        <div
          style={{
            color: "#d93025",
            fontWeight: 900,
            textTransform: "uppercase",
            fontSize: "13px",
            letterSpacing: "0.5px",
            marginBottom: "10px",
          }}
        >
          Pago no completado
        </div>

        <h1
          style={{
            fontSize: "clamp(34px, 5vw, 48px)",
            lineHeight: 1.05,
            margin: "0 0 18px",
            fontWeight: 900,
          }}
        >
          No pudimos completar tu pago
        </h1>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.5,
            margin: "0 0 10px",
          }}
        >
          La transacción fue rechazada o cancelada.
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
          No te preocupes. Puedes regresar al evento e intentar nuevamente con
          el mismo u otro medio de pago.
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
          Si ves un cobro en tu medio de pago, verifica primero el estado de la
          transacción en Mercado Pago.
        </p>
      </section>
    </main>
  );
}