import Link from "next/link";

export default function PagoPendientePage() {
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
            color: "#b87900",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 22px",
            fontSize: "26px",
            fontWeight: 900,
          }}
        >
          …
        </div>

        <div
          style={{
            color: "#b87900",
            fontWeight: 900,
            textTransform: "uppercase",
            fontSize: "13px",
            letterSpacing: "0.5px",
            marginBottom: "10px",
          }}
        >
          Pago en proceso
        </div>

        <h1
          style={{
            fontSize: "clamp(34px, 5vw, 48px)",
            lineHeight: 1.05,
            margin: "0 0 18px",
            fontWeight: 900,
          }}
        >
          Estamos confirmando tu pago
        </h1>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.5,
            margin: "0 0 10px",
          }}
        >
          Tu transacción está siendo procesada.
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
          No necesitas realizar otro pago. Una vez Mercado Pago
          confirme la transacción, tu matrícula quedará registrada
          en IBRACO.
        </p>

        <Link
          href="/cursos"
          style={{
            display: "inline-block",
            background: "#111",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: "999px",
            fontWeight: 800,
            textDecoration: "none",
            minWidth: "170px",
          }}
        >
          Volver a cursos
        </Link>
      </section>
    </main>
  );
}