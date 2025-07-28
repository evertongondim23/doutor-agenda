"use client";

import {
  Calendar,
  CheckCircle,
  DollarSign,
  ExternalLink,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";

interface Appointment {
  id: string;
  patient: string;
  date: string;
  doctor: string;
  specialty: string;
  value: number;
  status: string;
}

export default function AgendamentosPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    doctorId: "",
    patientId: "",
    date: "",
    time: "",
    status: "confirmado",
  });

  interface Doctor {
    id: string;
    name: string;
    specialty: string;
  }

  interface Patient {
    id: string;
    name: string;
    email: string;
    phone: string;
    sex: string;
    birthDate: string;
    cpf: string;
    rg: string;
    address: string;
  }

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, []);

  // Resetar formulário ao abrir/fechar modal
  useEffect(() => {
    if (!isDialogOpen) {
      setForm({
        doctorId: "",
        patientId: "",
        date: "",
        time: "",
        status: "confirmado",
      });
    }
  }, [isDialogOpen]);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Erro ao buscar agendamentos");
      const data = await res.json();
      setAppointments(data.appointments || []);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDoctors() {
    const res = await fetch("/api/doctors");
    if (res.ok) {
      const data = await res.json();
      setDoctors(data.doctors || []);
    }
  }

  async function fetchPatients() {
    const res = await fetch("/api/patients");
    if (res.ok) {
      const data = await res.json();
      setPatients(data.patients || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!form.doctorId || !form.patientId || !form.date || !form.time) {
        toast.error("Preencha todos os campos obrigatórios.");
        setSubmitting(false);
        return;
      }
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao criar agendamento");
      toast.success("Agendamento criado com sucesso!");
      setIsDialogOpen(false);
      setForm({
        doctorId: "",
        patientId: "",
        date: "",
        time: "",
        status: "confirmado",
      });
      fetchAppointments();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast.error("Erro ao criar agendamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageLayout
      title="Agendamentos"
      description="Access a detailed overview of key metrics and patient outcomes"
      headerAction={
        <Button
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Agendar consulta</span>
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-lg bg-white p-6 shadow-sm">
        {loading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : (
          <table className="min-w-full table-auto text-left text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="px-4 py-2 font-semibold">PACIENTE</th>
                <th className="px-4 py-2 font-semibold">DATA</th>
                <th className="px-4 py-2 font-semibold">MÉDICO</th>
                <th className="px-4 py-2 font-semibold">ESPECIALIDADE</th>
                <th className="px-4 py-2 font-semibold">VALOR</th>
                <th className="px-4 py-2 font-semibold">STATUS</th>
                <th className="px-4 py-2 font-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr
                  key={a.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{a.patient}</td>
                  <td className="px-4 py-2">{a.date}</td>
                  <td className="px-4 py-2">{a.doctor}</td>
                  <td className="px-4 py-2">{a.specialty}</td>
                  <td className="px-4 py-2">R${a.value.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                      <CheckCircle className="h-3 w-3" /> {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <a
                      href="#"
                      className="text-blue-600 hover:underline"
                      title="Ver detalhes"
                    >
                      <ExternalLink className="inline h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal de agendamento */}
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDialogOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
            role="dialog"
            aria-modal="true"
          >
            <h2 className="mb-4 text-lg font-semibold">Novo Agendamento</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  htmlFor="doctor-select"
                >
                  Médico
                </label>
                <select
                  id="doctor-select"
                  className="w-full rounded border px-3 py-2"
                  value={form.doctorId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, doctorId: e.target.value }))
                  }
                  required
                  autoFocus
                >
                  <option value="">Selecione</option>
                  {doctors.map((d: Doctor) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  htmlFor="patient-select"
                >
                  Paciente
                </label>
                <select
                  id="patient-select"
                  className="w-full rounded border px-3 py-2"
                  value={form.patientId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, patientId: e.target.value }))
                  }
                  required
                >
                  <option value="">Selecione</option>
                  {patients.map((p: Patient) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label
                    className="mb-1 block text-sm font-medium"
                    htmlFor="date-input"
                  >
                    Data
                  </label>
                  <input
                    id="date-input"
                    type="date"
                    className="w-full rounded border px-3 py-2"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="flex-1">
                  <label
                    className="mb-1 block text-sm font-medium"
                    htmlFor="time-input"
                  >
                    Hora
                  </label>
                  <input
                    id="time-input"
                    type="time"
                    className="w-full rounded border px-3 py-2"
                    value={form.time}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, time: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  htmlFor="status-select"
                >
                  Status
                </label>
                <select
                  id="status-select"
                  className="w-full rounded border px-3 py-2"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="confirmado">Confirmado</option>
                  <option value="pendente">Pendente</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  aria-label="Cancelar"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  aria-label="Salvar agendamento"
                >
                  {submitting ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
