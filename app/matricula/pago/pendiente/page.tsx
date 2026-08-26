import Link from "next/link";

export default function PagoPendientePage() {
  return (
    <main className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <div className="text-6xl mb-6">⏳</div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          PAGO EN PROCESO
        </h1>

        <p className="text-lg md:text-xl mb-4">
          Recibimos tu solicitud de pago.
        </p>

        <p className="text-base md:text-lg text-gray-600 mb-10">
          Mercado Pago está procesando la transacción. Una vez confirmada,
          tu matrícula quedará registrada.
        </p>

        <Link
          href="/cursos"
          className="inline-block bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition"
        >
          Volver a cursos
        </Link>
      </div>
    </main>
  );
}