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

interface User {
  name: string;
  email: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  appointments: number;
  avatar: string;
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

  // Dados de exemplo para demonstração
  const metrics = {
    revenue: 31760,
    appointments: 203,
    patients: 45,
    doctors: 12,
  };

  const doctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Lucas Moreira",
      specialty: "Cardiologista",
      appointments: 52,
      avatar: "👨‍⚕️",
    },
    {
      id: "2",
      name: "Dr. Camila Ferreira",
      specialty: "Ginecologista",
      appointments: 45,
      avatar: "👩‍⚕️",
    },
    {
      id: "3",
      name: "Dr. Rafael Santos",
      specialty: "Pediatra",
      appointments: 38,
      avatar: "👨‍⚕️",
    },
    {
      id: "4",
      name: "Dr. Mariana Almeida",
      specialty: "Dermatologia",
      appointments: 35,
      avatar: "👩‍⚕️",
    },
  ];

  const appointments: Appointment[] = [
    {
      id: "1",
      patient: "Ana Souza",
      date: "02/05/25",
      time: "09:00",
      doctor: "Dr. Lucas Moreira",
      status: "Confirmado",
    },
    {
      id: "2",
      patient: "João Martins",
      date: "03/05/25",
      time: "14:30",
      doctor: "Dr. Lucas Moreira",
      status: "Confirmado",
    },
    {
      id: "3",
      patient: "Camila Borges",
      date: "04/05/25",
      time: "11:15",
      doctor: "Dr. Rafael Santos",
      status: "Confirmado",
    },
    {
      id: "4",
      patient: "Lucas Fernandes",
      date: "05/05/25",
      time: "16:45",
      doctor: "Dr. Camila Ferreira",
      status: "Confirmado",
    },
    {
      id: "5",
      patient: "Beatriz Costa",
      date: "06/05/25",
      time: "08:00",
      doctor: "Dr. Bruno de Oliveira",
      status: "Confirmado",
    },
  ];

  const specialties: Specialty[] = [
    {
      name: "Cardiologia",
      appointments: 52,
      color: "text-red-500",
      icon: Heart,
    },
    {
      name: "Ginecologia",
      appointments: 45,
      color: "text-pink-500",
      icon: User,
    },
    { name: "Pediatria", appointments: 38, color: "text-blue-500", icon: Baby },
    {
      name: "Dermatologia",
      appointments: 35,
      color: "text-orange-500",
      icon: Scan,
    },
    { name: "Ortopedia", appointments: 33, color: "text-gray-500", icon: Bone },
  ];

  const weeklyData = [
    { day: "Dom", patients: 12, consultations: 3 },
    { day: "Seg", patients: 15, consultations: 5 },
    { day: "Ter", patients: 18, consultations: 7 },
    { day: "Qua", patients: 15, consultations: 5 },
    { day: "Qui", patients: 17, consultations: 6 },
    { day: "Sex", patients: 19, consultations: 8 },
    { day: "Sáb", patients: 16, consultations: 6 },
  ];

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
              <div className="flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600">
                <Calendar className="mr-3 h-4 w-4" />
                Dashboard
              </div>
              <button className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Calendar className="mr-3 h-4 w-4" />
                Agendamentos
              </button>
              <button className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Stethoscope className="mr-3 h-4 w-4" />
                Médicos
              </button>
              <button className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Users className="mr-3 h-4 w-4" />
                Pacientes
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Outros
            </h3>
            <button className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <DollarSign className="mr-3 h-4 w-4" />
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
              <p className="text-xs">clinica@example.com</p>
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
                Menu Principal &gt; Dashboard
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Access a detailed overview of key metrics and patient outcomes
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Maio</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {/* Metrics Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-lg bg-green-100 p-2">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Faturamento
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">
                      Pacientes
                    </p>
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
                        <span className="text-xs text-gray-600">
                          {data.day}
                        </span>
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
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                          {doctor.avatar}
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
                            {doctor.appointments} agend.
                          </p>
                        </div>
                      </div>
                    ))}
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
                            <IconComponent
                              className={`h-4 w-4 ${specialty.color}`}
                            />
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
        </main>
      </div>
    </div>
  );
}
