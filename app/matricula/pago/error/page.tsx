import Link from "next/link";

export default function PagoErrorPage() {
  return (
    <main className="min-h-screen bg-[#F8F5E9] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white rounded-[28px] p-8 md:p-12 text-center shadow-sm">
        <div className="text-6xl mb-6">!</div>

        <div className="text-red-600 font-black uppercase text-sm mb-3">
          Pago no completado
        </div>

        <h1 className="text-4xl md:text-6xl font-black leading-none mb-6">
          NO PUDIMOS CONFIRMAR TU PAGO
        </h1>

        <p className="text-lg md:text-xl mb-4">
          Tu matrícula todavía no ha sido confirmada.
        </p>

        <p className="text-base md:text-lg text-gray-600 mb-10">
          El pago pudo haber sido rechazado, cancelado o no completado.
          Puedes regresar al curso e intentarlo nuevamente.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cursos"
            className="inline-block bg-[#FFD800] text-black px-8 py-4 rounded-full font-bold"
          >
            Intentar nuevamente
          </Link>

          <Link
            href="/"
            className="inline-block border border-black px-8 py-4 rounded-full font-bold"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}