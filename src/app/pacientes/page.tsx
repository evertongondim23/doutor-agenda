"use client";

import { ExternalLink, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface Patient {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  sex: string;
  birthDate: string;
  rg: string;
  address: string;
}

// Defina emptyPatient fora do componente para garantir referência estável
const emptyPatient = {
  name: "",
  email: "",
  birthDate: "",
  rg: "",
  address: "",
  city: "",
  sex: "male",
};

export default function PacientesPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<Patient>(emptyPatient);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    setLoading(true);
    try {
      const res = await fetch("/api/patients");
      if (!res.ok) throw new Error("Erro ao buscar pacientes");
      const data = await res.json();
      setPatients(data.patients || []);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }

  // Resetar formulário ao abrir/fechar modal
  useEffect(() => {
    if (!isDialogOpen) {
      setForm(emptyPatient);
    }
  }, [isDialogOpen]);

  // Adicionar esc listener para fechar modal
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsDialogOpen(false);
        setSelectedPatient(null);
      }
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">dr</span>
            </div>
            <span className="font-semibold text-gray-900">agenda</span>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Menu Principal
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push("/agendamentos")}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Agendamentos
              </button>
              <button
                onClick={() => router.push("/medicos")}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Médicos
              </button>
              <div
                onClick={() => router.push("/pacientes")}
                className="flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600"
              >
                Pacientes
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Outros
            </h3>
            <button className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Planos
            </button>
          </div>
        </nav>
        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
              <span className="text-xs font-medium">CC</span>
            </div>
            <div>
              <p className="font-medium">Clínica Care</p>
              <p className="text-xs">mail@example.com</p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm text-gray-500">
                Menu Principal &gt;{" "}
                <span className="text-blue-600">Pacientes</span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Pacientes
              </h1>
              <p className="text-sm text-gray-600">
                Access a detailed overview of key metrics and patient outcomes
              </p>
            </div>
            <Button
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setIsDialogOpen(true);
                setEditMode(false);
                setForm(emptyPatient);
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar paciente</span>
            </Button>
          </div>
        </header>
        {/* Table */}
        <main className="flex-1 p-6">
          <div className="overflow-x-auto rounded-lg bg-white p-6 shadow-sm">
            {loading ? (
              <div className="py-8 text-center">Carregando...</div>
            ) : (
              <table className="min-w-full table-auto text-left text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="px-4 py-2 font-semibold">NOME</th>
                    <th className="px-4 py-2 font-semibold">E-MAIL</th>
                    <th className="px-4 py-2 font-semibold">
                      DATA DE NASCIMENTO
                    </th>
                    <th className="px-4 py-2 font-semibold">RG</th>
                    <th className="px-4 py-2 font-semibold">ENDEREÇO</th>
                    <th className="px-4 py-2 font-semibold">CIDADE</th>

                    <th className="px-4 py-2 font-semibold">SEXO</th>
                    <th className="px-4 py-2 font-semibold"> </th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{p.name}</td>
                      <td className="px-4 py-2">{p.email}</td>
                      <td className="px-4 py-2">
                        {p.birthDate
                          ? new Date(p.birthDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2">{p.rg || "-"}</td>
                      <td className="px-4 py-2">{p.address || "-"}</td>
                      <td className="px-4 py-2">{p.city || "-"}</td>

                      <td className="px-4 py-2 font-semibold">
                        {p.sex === "male" ? "Masculino" : "Female"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <a
                          href="#"
                          className="text-blue-600 hover:underline"
                          title="Ver detalhes"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedPatient(p);
                            setEditMode(false);
                          }}
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
        </main>
        {/* Modal de cadastro/edição */}
        {(isDialogOpen || selectedPatient) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsDialogOpen(false);
                setSelectedPatient(null);
                setEditMode(false);
              }
            }}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-md flex-col rounded-lg bg-white shadow-lg"
              role="dialog"
              aria-modal="true"
            >
              <div className="border-b px-6 pt-6 pb-2">
                <h2 className="text-lg font-semibold">
                  {editMode || isDialogOpen
                    ? editMode
                      ? "Editar Paciente"
                      : "Novo Paciente"
                    : "Detalhes do Paciente"}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {editMode || isDialogOpen ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSubmitting(true);
                      try {
                        const payload =
                          editMode && selectedPatient
                            ? { ...selectedPatient }
                            : { ...form };
                        const url = "/api/patients";
                        const method = editMode ? "PUT" : "POST";
                        const res = await fetch(url, {
                          method,
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                        if (!res.ok)
                          throw new Error(
                            editMode
                              ? "Erro ao editar paciente"
                              : "Erro ao criar paciente",
                          );
                        toast.success(
                          editMode
                            ? "Paciente editado com sucesso!"
                            : "Paciente cadastrado com sucesso!",
                        );
                        setIsDialogOpen(false);
                        setSelectedPatient(null);
                        setEditMode(false);
                        setForm(emptyPatient);
                        fetchPatients();
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      } catch (error) {
                        toast.error(
                          editMode
                            ? "Erro ao editar paciente."
                            : "Erro ao criar paciente.",
                        );
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        className="mb-1 block text-sm font-medium"
                        htmlFor="name-input"
                      >
                        Nome
                      </label>
                      <input
                        id="name-input"
                        type="text"
                        className="w-full rounded border px-3 py-2"
                        value={
                          editMode && selectedPatient
                            ? selectedPatient.name
                            : form.name
                        }
                        onChange={(e) =>
                          editMode && selectedPatient
                            ? setSelectedPatient((sp) =>
                                sp ? { ...sp, name: e.target.value } : sp,
                              )
                            : setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-sm font-medium"
                        htmlFor="email-input"
                      >
                        E-mail
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        className="w-full rounded border px-3 py-2"
                        value={
                          editMode && selectedPatient
                            ? selectedPatient.email
                            : form.email
                        }
                        onChange={(e) =>
                          editMode && selectedPatient
                            ? setSelectedPatient((sp) =>
                                sp ? { ...sp, email: e.target.value } : sp,
                              )
                            : setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-sm font-medium"
                        htmlFor="birthDate-input"
                      >
                        Data de nascimento
                      </label>
                      <input
                        id="birthDate-input"
                        type="date"
                        className="w-full rounded border px-3 py-2"
                        value={
                          editMode && selectedPatient
                            ? selectedPatient.birthDate
                            : form.birthDate
                        }
                        onChange={(e) =>
                          editMode && selectedPatient
                            ? setSelectedPatient((sp) =>
                                sp ? { ...sp, birthDate: e.target.value } : sp,
                              )
                            : setForm((f) => ({
                                ...f,
                                birthDate: e.target.value,
                              }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-sm font-medium"
                        htmlFor="rg-input"
                      >
                        RG
                      </label>
                      <input
                        id="rg-input"
                        type="text"
                        className="w-full rounded border px-3 py-2"
                        value={
                          editMode && selectedPatient
                            ? selectedPatient.rg
                            : form.rg
                        }
                        onChange={(e) =>
                          editMode && selectedPatient
                            ? setSelectedPatient((sp) =>
                                sp ? { ...sp, rg: e.target.value } : sp,
                              )
                            : setForm((f) => ({ ...f, rg: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-sm font-medium"
                        htmlFor="address-input"
                      >
                        Endereço
                      </label>
                      <input
                        id="address-input"
                        type="text"
                        className="w-full rounded border px-3 py-2"
                        value={
                          editMode && selectedPatient
                            ? selectedPatient.address
                            : form.address
                        }
                        onChange={(e) =>
                          editMode && selectedPatient
                            ? setSelectedPatient((sp) =>
                                sp ? { ...sp, address: e.target.value } : sp,
                              )
                            : setForm((f) => ({
                                ...f,
                                address: e.target.value,
                              }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-sm font-medium"
                        htmlFor="sex-select"
                      >
                        Sexo
                      </label>
                      <select
                        id="sex-select"
                        className="w-full rounded border px-3 py-2"
                        value={
                          editMode && selectedPatient
                            ? selectedPatient.sex
                            : form.sex
                        }
                        onChange={(e) =>
                          editMode && selectedPatient
                            ? setSelectedPatient((sp) =>
                                sp ? { ...sp, sex: e.target.value } : sp,
                              )
                            : setForm((f) => ({ ...f, sex: e.target.value }))
                        }
                        required
                      >
                        <option value="female">Feminino</option>
                        <option value="male">Masculino</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setSelectedPatient(null);
                          setEditMode(false);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <b>Nome:</b> {selectedPatient?.name}
                    </div>
                    <div>
                      <b>E-mail:</b> {selectedPatient?.email}
                    </div>
                    <div>
                      <b>Data de nascimento:</b>{" "}
                      {selectedPatient?.birthDate
                        ? new Date(
                            selectedPatient.birthDate,
                          ).toLocaleDateString()
                        : "-"}
                    </div>
                    <div>
                      <b>RG:</b> {selectedPatient?.rg || "-"}
                    </div>
                    <div>
                      <b>Endereço:</b> {selectedPatient?.address || "-"}
                    </div>
                    <div>
                      <b>Sexo:</b>{" "}
                      {selectedPatient?.sex === "male"
                        ? "Masculino"
                        : "Feminino"}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedPatient(null);
                          setEditMode(false);
                        }}
                      >
                        Fechar
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => setEditMode(true)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Tem certeza que deseja excluir este paciente?",
                            )
                          ) {
                            setSubmitting(true);
                            try {
                              const res = await fetch("/api/patients", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  id: selectedPatient?.id,
                                }),
                              });
                              if (!res.ok)
                                throw new Error("Erro ao excluir paciente");
                              toast.success("Paciente excluído com sucesso!");
                              setSelectedPatient(null);
                              setEditMode(false);
                              fetchPatients();
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (error) {
                              toast.error("Erro ao excluir paciente.");
                            } finally {
                              setSubmitting(false);
                            }
                          }
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
