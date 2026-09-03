"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { supabase } from "../../../lib/supabase";

type Order = {
  id: number;
  order_number: string;
  order_status: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  document_type: string | null;
  document_number: string | null;
  course_name: string | null;
  amount: number | null;
  currency: string | null;
  payment_status: string | null;
  payment_reference: string | null;
  q10_status: string | null;
  created_at: string;
};

export default function ContabilidadPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: adminProfile, error: profileError } =
        await supabase
          .from("admin_profiles")
          .select("can_accounting, is_superadmin")
          .eq("user_id", session.user.id)
          .single();

      if (
        profileError ||
        !adminProfile ||
        (!adminProfile.can_accounting &&
          !adminProfile.is_superadmin)
      ) {
        router.replace("/admin");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          order_status,
          first_name,
          last_name,
          email,
          phone,
          document_type,
          document_number,
          course_name,
          amount,
          currency,
          payment_status,
          payment_reference,
          q10_status,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando órdenes:", error);
        setErrorMessage("No fue posible cargar los pagos.");
        setLoading(false);
        return;
      }

      setOrders((data || []) as Order[]);
      setLoading(false);
    }

    loadOrders();
  }, [router]);

  const stats = useMemo(() => {
    const paid = orders.filter(
      (order) =>
        order.payment_status === "paid" ||
        order.order_status === "paid"
    );

    const pending = orders.filter(
      (order) =>
        order.payment_status === "pending" &&
        order.order_status === "pending"
    );

    const failed = orders.filter(
      (order) =>
        order.payment_status === "failed" ||
        order.order_status === "payment_failed"
    );

    const revenue = paid.reduce(
      (total, order) => total + Number(order.amount || 0),
      0
    );

    return {
      revenue,
      paid: paid.length,
      pending: pending.length,
      failed: failed.length,
    };
  }, [orders]);

  function money(value: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function date(value: string) {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function paymentLabel(status: string | null) {
    if (status === "paid") return "Pagado";
    if (status === "failed") return "Fallido";
    return "Pendiente";
  }

  function q10Label(status: string | null) {
    if (status === "completed") return "Registrado";
    if (status === "failed") return "Error";
    return "Pendiente";
  }

  function downloadExcel() {
    const rows = orders.map((order) => ({
      Fecha: date(order.created_at),
      Pedido: order.order_number,
      Nombre: order.first_name || "",
      Apellido: order.last_name || "",
      "Tipo documento": order.document_type || "",
      Documento: order.document_number || "",
      Email: order.email || "",
      Teléfono: order.phone || "",
      Curso: order.course_name || "",
      Valor: Number(order.amount || 0),
      Moneda: order.currency || "COP",
      "Estado del pago": paymentLabel(order.payment_status),
      "Referencia Mercado Pago": order.payment_reference || "",
      "Estado Q10": q10Label(order.q10_status),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = [
      { wch: 22 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
      { wch: 30 },
      { wch: 18 },
      { wch: 30 },
      { wch: 16 },
      { wch: 10 },
      { wch: 18 },
      { wch: 32 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Contabilidad"
    );

    const today = new Date().toISOString().slice(0, 10);

    XLSX.writeFile(
      workbook,
      `IBRACO_Contabilidad_${today}.xlsx`
    );
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "1500px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <p
          style={{
            color: "#009c4b",
            fontWeight: 800,
            marginBottom: "6px",
          }}
        >
          IBRACO
        </p>

        <h1
          style={{
            fontSize: "36px",
            margin: 0,
          }}
        >
          Contabilidad
        </h1>

        <p style={{ color: "#666", marginTop: "8px" }}>
          Control de ventas, pagos y matrículas.
        </p>

        <button
          type="button"
          onClick={downloadExcel}
          disabled={orders.length === 0}
          style={{
            marginTop: "18px",
            background: "#009c4b",
            color: "#fff",
            border: "none",
            borderRadius: "30px",
            padding: "13px 22px",
            fontSize: "14px",
            fontWeight: 800,
            cursor:
              orders.length === 0
                ? "not-allowed"
                : "pointer",
            opacity: orders.length === 0 ? 0.5 : 1,
          }}
        >
          Descargar Excel
        </button>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <StatCard
          title="Recaudo aprobado"
          value={money(stats.revenue)}
        />

        <StatCard
          title="Ventas pagadas"
          value={String(stats.paid)}
        />

        <StatCard
          title="Pendientes"
          value={String(stats.pending)}
        />

        <StatCard
          title="Fallidas"
          value={String(stats.failed)}
        />
      </section>

      {loading && <p>Cargando pagos...</p>}

      {errorMessage && (
        <p style={{ color: "#b42318" }}>
          {errorMessage}
        </p>
      )}

      {!loading && !errorMessage && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "18px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1100px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f7f7f7",
                  textAlign: "left",
                }}
              >
                <Th>Fecha</Th>
                <Th>Pedido</Th>
                <Th>Alumno</Th>
                <Th>Curso</Th>
                <Th>Valor</Th>
                <Th>Pago</Th>
                <Th>Referencia MP</Th>
                <Th>Q10</Th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  style={{
                    borderTop: "1px solid #eee",
                  }}
                >
                  <Td>{date(order.created_at)}</Td>

                  <Td>
                    <strong>
                      {order.order_number}
                    </strong>
                  </Td>

                  <Td>
                    <strong>
                      {order.first_name}{" "}
                      {order.last_name}
                    </strong>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#777",
                        marginTop: "3px",
                      }}
                    >
                      {order.email}
                    </div>
                  </Td>

                  <Td>
                    {order.course_name || "—"}
                  </Td>

                  <Td>
                    <strong>
                      {money(
                        Number(order.amount || 0)
                      )}
                    </strong>
                  </Td>

                  <Td>
                    <StatusBadge
                      status={
                        order.payment_status
                      }
                      label={paymentLabel(
                        order.payment_status
                      )}
                    />
                  </Td>

                  <Td>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#555",
                      }}
                    >
                      {order.payment_reference ||
                        "—"}
                    </span>
                  </Td>

                  <Td>
                    <StatusBadge
                      status={order.q10_status}
                      label={q10Label(
                        order.q10_status
                      )}
                    />
                  </Td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#777",
                    }}
                  >
                    Todavía no hay ventas
                    registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: "18px",
        padding: "22px",
      }}
    >
      <div
        style={{
          color: "#666",
          fontSize: "14px",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 900,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Th({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      style={{
        padding: "16px",
        fontSize: "13px",
        color: "#555",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td
      style={{
        padding: "16px",
        fontSize: "14px",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: string | null;
  label: string;
}) {
  let background = "#fff3cd";
  let color = "#856404";

  if (
    status === "paid" ||
    status === "completed"
  ) {
    background = "#e6f6ec";
    color = "#137333";
  }

  if (status === "failed") {
    background = "#fdecec";
    color = "#b42318";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "7px 11px",
        borderRadius: "999px",
        background,
        color,
        fontSize: "12px",
        fontWeight: 800,
      }}
    >
      {label}
    </span>
  );
}
