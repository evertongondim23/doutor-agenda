"use client";

// Force dynamic para evitar problemas de SSG
export const dynamic = "force-dynamic";

import {
  Baby,
  Bone,
  Calendar,
  ChevronDown,
  DollarSign,
  Heart,
  Scan,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import PageLayout from "@/components/layout/PageLayout";
import Image from "next/image";

interface User {
  name: string;
  email: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatarImage?: string;
  appointmentPrice: number;
}

interface Appointment {
  id: string;
  patient: string;
  date: string;
  time: string;
  doctor: string;
  status: "Confirmado" | "Pendente" | "Cancelado";
}

interface Specialty {
  name: string;
  appointments: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    revenue: 31760,
    appointments: 203,
    patients: 45,
    doctors: 0, // Será carregado da API
  });

  // Doctors data - será carregado da API
  const [doctorsData, setDoctorsData] = useState<Doctor[]>([]);

  // Appointments data - permanece estático por enquanto
  const [appointments] = useState<Appointment[]>([
    {
      id: "1",
      patient: "Ana Silva",
      date: "2024-12-12",
      time: "09:00",
      doctor: "Dr. Lucas Moreira",
      status: "Confirmado",
    },
    {
      id: "2",
      patient: "Carlos Santos",
      date: "2024-12-12",
      time: "10:30",
      doctor: "Dr. Camila Ferreira",
      status: "Confirmado",
    },
    {
      id: "3",
      patient: "Maria Oliveira",
      date: "2024-12-12",
      time: "14:00",
      doctor: "Dr. Rafael Santos",
      status: "Confirmado",
    },
    {
      id: "4",
      patient: "João Costa",
      date: "2024-12-12",
      time: "15:30",
      doctor: "Dr. Mariana Almeida",
      status: "Confirmado",
    },
    {
      id: "5",
      patient: "Lucia Fernandes",
      date: "2024-12-12",
      time: "16:00",
      doctor: "Dr. Bruno de Oliveira",
      status: "Confirmado",
    },
  ]);

  // Weekly data for charts
  const weeklyData = [
    { day: "Seg", patients: 12, consultations: 8 },
    { day: "Ter", patients: 19, consultations: 12 },
    { day: "Qua", patients: 15, consultations: 10 },
    { day: "Qui", patients: 22, consultations: 15 },
    { day: "Sex", patients: 18, consultations: 14 },
    { day: "Sab", patients: 8, consultations: 6 },
    { day: "Dom", patients: 5, consultations: 3 },
  ];

  // Specialties data
  const specialties: Specialty[] = [
    {
      name: "Cardiologia",
      appointments: 12,
      color: "bg-red-500",
      icon: Heart,
    },
    {
      name: "Ginecologia",
      appointments: 8,
      color: "bg-pink-500",
      icon: User,
    },
    {
      name: "Pediatria",
      appointments: 15,
      color: "bg-blue-500",
      icon: Baby,
    },
    {
      name: "Dermatologia",
      appointments: 6,
      color: "bg-orange-500",
      icon: Scan,
    },
    {
      name: "Ortopedia",
      appointments: 10,
      color: "bg-gray-500",
      icon: Bone,
    },
  ];

  // Função para carregar médicos
  const loadDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      const result = await response.json();

      if (response.ok) {
        const doctors = result.doctors || [];
        setDoctorsData(doctors);

        // Atualizar métrica de médicos
        setMetrics((prev) => ({
          ...prev,
          doctors: doctors.length,
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar médicos:", error);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setUser({
            name: session.data.user.name || "Usuário",
            email: session.data.user.email || "",
          });

          // Verificar clínicas do usuário
          const response = await fetch("/api/clinics");
          const result = await response.json();

          if (response.ok && result.clinics.length === 0) {
            router.push("/clinics-form");
          } else {
            // Carregar dados dos médicos
            await loadDoctors();
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Erro ao obter sessão:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Logout realizado com sucesso!");
      router.push("/login");
    } catch (error) {
      console.error("Erro no logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Dashboard"
      description="Access a detailed overview of key metrics and patient outcomes"
      user={user || undefined}
      onLogout={handleLogout}
      headerAction={
        <Button variant="outline" className="flex items-center space-x-2">
          <span>Maio</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      }
    >
      {/* Metrics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-2">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Faturamento</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {metrics.revenue.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-2">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Agendamentos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.appointments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-purple-100 p-2">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.patients}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-orange-100 p-2">
                <Stethoscope className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Médicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.doctors}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Charts and Tables Section */}
        <div className="space-y-6 lg:col-span-2">
          {/* Patients Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-end justify-between space-x-2">
                {weeklyData.map((data) => (
                  <div
                    key={data.day}
                    className="flex flex-1 flex-col items-center"
                  >
                    <div className="mb-2 flex w-full flex-col space-y-1">
                      <div
                        className="w-full rounded-sm bg-blue-500"
                        style={{
                          height: `${(data.patients / 20) * 100}%`,
                          minHeight: "8px",
                        }}
                      />
                      <div
                        className="w-full rounded-sm bg-green-500"
                        style={{
                          height: `${(data.consultations / 10) * 100}%`,
                          minHeight: "4px",
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{data.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-sm bg-blue-500" />
                  <span>Pacientes</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-sm bg-green-500" />
                  <span>Consultas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Paciente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Doutor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {appointment.patient}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {appointment.date}, {appointment.time}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {appointment.doctor}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            • {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Doctors */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Stethoscope className="mr-2 h-5 w-5" />
                  Médicos
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorsData.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-gray-500">
                      Nenhum médico cadastrado
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push("/medicos")}
                    >
                      Cadastrar médico
                    </Button>
                  </div>
                ) : (
                  doctorsData.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="flex items-center space-x-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                        {doctor.avatarImage ? (
                          <Image
                            src={doctor.avatarImage}
                            alt={doctor.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Stethoscope className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {doctor.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doctor.specialty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          R$ {doctor.appointmentPrice?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Especialidades</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {specialties.map((specialty) => {
                  const IconComponent = specialty.icon;
                  return (
                    <div
                      key={specialty.name}
                      className="flex items-center space-x-3"
                    >
                      <div className="flex flex-1 items-center space-x-2">
                        <div className={`rounded p-1 ${specialty.color}`}>
                          <IconComponent className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-900">
                          {specialty.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {specialty.appointments} agend.
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
