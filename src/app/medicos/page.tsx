"use client";

export const dynamic = "force-dynamic";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Pencil,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import PageLayout from "@/components/layout/PageLayout";

interface User {
  name: string;
  email: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatarImage?: string;
  availabilityFromWeekday: string;
  availabilityToWeekday: string;
  availabilityFromTime: string;
  availabilityToTime: string;
  appointmentPrice: number;
}

const doctorSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  specialty: z.string().min(1, { message: "Especialidade é obrigatória" }),
  avatarImage: z.string().optional(),
  availabilityFromWeekday: z
    .string()
    .min(1, { message: "Dia inicial é obrigatório" }),
  availabilityToWeekday: z
    .string()
    .min(1, { message: "Dia final é obrigatório" }),
  availabilityFromTime: z
    .string()
    .min(1, { message: "Horário inicial é obrigatório" }),
  availabilityToTime: z
    .string()
    .min(1, { message: "Horário final é obrigatório" }),
  appointmentPrice: z
    .number()
    .min(0.01, { message: "Valor da consulta é obrigatório" }),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

const weekdays = [
  { value: "monday", label: "Segunda-feira" },
  { value: "tuesday", label: "Terça-feira" },
  { value: "wednesday", label: "Quarta-feira" },
  { value: "thursday", label: "Quinta-feira" },
  { value: "friday", label: "Sexta-feira" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const specialties = [
  "Cardiologia",
  "Dermatologia",
  "Ginecologia",
  "Neurologia",
  "Oftalmologia",
  "Ortopedia",
  "Pediatria",
  "Psiquiatria",
  "Urologia",
  "Clínica Geral",
];

export default function MedicosPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      specialty: "",
      avatarImage: "",
      availabilityFromWeekday: "",
      availabilityToWeekday: "",
      availabilityFromTime: "",
      availabilityToTime: "",
      appointmentPrice: 0,
    },
  });

  useEffect(() => {
    const getSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setUser({
            name: session.data.user.name || "Usuário",
            email: session.data.user.email || "",
          });
          await loadDoctors();
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

  const loadDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      if (!response.ok) {
        const text = await response.text();
        console.error(
          "Erro ao carregar médicos (status)",
          response.status,
          text,
        );
        toast.error("Erro ao carregar médicos");
        return;
      }
      const result = await response.json();
      setDoctors(result.doctors || []);
    } catch (error) {
      console.error("Erro ao carregar médicos:", error);
      toast.error("Erro ao carregar médicos");
    }
  };

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

  // Função para processar upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Verificar tamanho do arquivo (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
      form.setValue("avatarImage", result);
    };
    reader.readAsDataURL(file);
  };

  // Função para remover imagem
  const removeImage = () => {
    setAvatarPreview("");
    form.setValue("avatarImage", "");
    // Limpar o input file
    const fileInput = document.getElementById(
      "avatar-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Ao abrir o modal para editar
  function handleEditDoctor(doctor: Doctor) {
    setEditingDoctor(doctor);
    setIsDialogOpen(true);
    // Preencher o formulário com os dados do médico
    form.reset({
      name: doctor.name,
      specialty: doctor.specialty,
      avatarImage: doctor.avatarImage || "",
      availabilityFromWeekday: doctor.availabilityFromWeekday,
      availabilityToWeekday: doctor.availabilityToWeekday,
      availabilityFromTime: doctor.availabilityFromTime,
      availabilityToTime: doctor.availabilityToTime,
      appointmentPrice: doctor.appointmentPrice,
    });
    setAvatarPreview(doctor.avatarImage || "");
  }

  // Ao abrir o modal para adicionar
  function handleAddDoctor() {
    setEditingDoctor(null);
    setIsDialogOpen(true);
    form.reset({
      name: "",
      specialty: "",
      avatarImage: "",
      availabilityFromWeekday: "",
      availabilityToWeekday: "",
      availabilityFromTime: "",
      availabilityToTime: "",
      appointmentPrice: 0,
    });
    setAvatarPreview("");
  }

  // Fechar modal limpa edição
  useEffect(() => {
    if (!isDialogOpen) {
      setEditingDoctor(null);
    }
  }, [isDialogOpen]);

  // Submissão do formulário: criar ou editar
  const onSubmit = async (data: DoctorFormData) => {
    setIsSubmitting(true);
    try {
      let response;
      if (editingDoctor) {
        response = await fetch(`/api/doctors/${editingDoctor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        response = await fetch("/api/doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      if (!response.ok) {
        const text = await response.text();
        console.error(
          editingDoctor
            ? "Erro ao editar médico (status)"
            : "Erro ao cadastrar médico (status)",
          response.status,
          text,
        );
        throw new Error(
          editingDoctor
            ? `Erro ao editar médico: ${text}`
            : `Erro ao cadastrar médico: ${text}`,
        );
      }
      toast.success(
        editingDoctor
          ? "Médico editado com sucesso!"
          : "Médico cadastrado com sucesso!",
      );
      form.reset();
      setAvatarPreview("");
      setIsDialogOpen(false);
      await loadDoctors();
    } catch (error) {
      console.error(
        editingDoctor ? "Erro ao editar médico:" : "Erro ao cadastrar médico:",
        error,
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : editingDoctor
            ? "Erro ao editar médico. Tente novamente."
            : "Erro ao cadastrar médico. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatWeekday = (weekday: string) => {
    const day = weekdays.find((w) => w.value === weekday);
    return day ? day.label : weekday;
  };

  const formatSchedule = (doctor: Doctor) => {
    if (doctor.availabilityFromWeekday === doctor.availabilityToWeekday) {
      return formatWeekday(doctor.availabilityFromWeekday);
    }
    return `${formatWeekday(doctor.availabilityFromWeekday)} a ${formatWeekday(doctor.availabilityToWeekday)}`;
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
      title="Médicos"
      description="Access a detailed overview of key metrics and patient outcomes"
      user={user || undefined}
      onLogout={handleLogout}
      headerAction={
        <div className="flex items-center space-x-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Adicionar médico</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDoctor ? "Editar Médico" : "Cadastrar Médico"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados do médico para adicionar à clínica
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Completo</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Dr. João Silva"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="specialty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Especialidade</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a especialidade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {specialties.map((specialty) => (
                                    <SelectItem
                                      key={specialty}
                                      value={specialty}
                                    >
                                      {specialty}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="avatarImage"
                        render={() => (
                          <FormItem>
                            <FormLabel>Foto do Médico (opcional)</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                <div className="flex w-full items-center justify-center">
                                  <label
                                    htmlFor="avatar-upload"
                                    className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                                  >
                                    {avatarPreview ? (
                                      <div className="relative">
                                        <Image
                                          src={avatarPreview}
                                          alt="Preview"
                                          width={96}
                                          height={96}
                                          className="h-24 w-24 rounded-full object-cover"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                          onClick={removeImage}
                                        >
                                          ×
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg
                                          className="mb-4 h-8 w-8 text-gray-500"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                          />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500">
                                          <span className="font-semibold">
                                            Clique para enviar
                                          </span>{" "}
                                          ou arraste e solte
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          PNG, JPG ou JPEG (MAX. 5MB)
                                        </p>
                                      </div>
                                    )}
                                    <input
                                      id="avatar-upload"
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                    />
                                  </label>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="availabilityFromWeekday"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dia Inicial</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o dia" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {weekdays.map((day) => (
                                    <SelectItem
                                      key={day.value}
                                      value={day.value}
                                    >
                                      {day.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="availabilityToWeekday"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dia Final</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o dia" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {weekdays.map((day) => (
                                    <SelectItem
                                      key={day.value}
                                      value={day.value}
                                    >
                                      {day.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="availabilityFromTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horário Inicial</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="availabilityToTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horário Final</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="appointmentPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor da Consulta (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="200.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting
                            ? editingDoctor
                              ? "Salvando..."
                              : "Salvando..."
                            : editingDoctor
                              ? "Salvar Alterações"
                              : "Salvar Médico"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
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

        {/* Doctors Grid */}
        <main className="flex-1 p-6">
          {doctors.length === 0 ? (
            <div className="py-12 text-center">
              <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhum médico cadastrado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando um médico à sua clínica.
              </p>
              <div className="mt-6">
                <Button onClick={handleAddDoctor}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Médico
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        {doctor.avatarImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={doctor.avatarImage}
                            alt={doctor.name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <Stethoscope className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {doctor.name}
                      </h3>
                      <p className="mt-1 flex items-center justify-center text-sm text-blue-600">
                        <MapPin className="mr-1 h-3 w-3" />
                        {doctor.specialty}
                      </p>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{formatSchedule(doctor)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>
                          Das {doctor.availabilityFromTime} às{" "}
                          {doctor.availabilityToTime}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>R${doctor.appointmentPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <div className="group relative">
                        <Button
                          type="button"
                          variant="ghost"
                          className="rounded-full border border-blue-400 p-2 text-blue-600 shadow-none transition-colors duration-150 hover:border-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                          onClick={() => handleEditDoctor(doctor)}
                          aria-label="Editar médico"
                          tabIndex={0}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <span className="pointer-events-none absolute -top-8 right-0 z-10 hidden rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                          Editar médico
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => setSelectedDoctor(doctor)}
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      <Dialog
        open={!!selectedDoctor}
        onOpenChange={(open) => !open && setSelectedDoctor(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Resumo do Médico</DialogTitle>
          </DialogHeader>
          {selectedDoctor && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                {selectedDoctor.avatarImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedDoctor.avatarImage}
                    alt={selectedDoctor.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <Stethoscope className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDoctor.name}
                </h3>
                <p className="text-blue-600">{selectedDoctor.specialty}</p>
              </div>
              <div className="w-full space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatSchedule(selectedDoctor)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Das {selectedDoctor.availabilityFromTime} às{" "}
                    {selectedDoctor.availabilityToTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>R${selectedDoctor.appointmentPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
