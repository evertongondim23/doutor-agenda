"use client";

// Force dynamic para evitar problemas de SSG
export const dynamic = "force-dynamic";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  Form,
  FormMessage,
  FormItem,
  FormField,
  FormControl,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

// Função auxiliar para fazer requisições autenticadas
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  // Verificar se há sessão ativa
  const session = await authClient.getSession();

  if (!session.data?.user) {
    throw new Error("Usuário não autenticado");
  }

  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  return fetch(url, { ...defaultOptions, ...options });
};

const clinicsSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nome da clínica deve ter pelo menos 3 caracteres" }),
});

const ClinicsFormPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const clinicForm = useForm<z.infer<typeof clinicsSchema>>({
    resolver: zodResolver(clinicsSchema),
    defaultValues: {
      name: "",
    },
  });

  // Verificar autenticação na inicialização
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();

        if (session.data?.user) {
          setIsAuthenticated(true);
        } else {
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        router.push("/login");
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const onSave = async (data: z.infer<typeof clinicsSchema>) => {
    console.log("🚀 Iniciando submissão do formulário...");
    setIsSubmitting(true);

    try {
      const response = await authenticatedFetch("/api/clinics", {
        method: "POST",
        body: JSON.stringify({ name: data.name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cadastrar clínica");
      }

      toast.success("Clínica cadastrada com sucesso!");

      // Aguardar um pouco para garantir que o toast seja exibido
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Erro ao cadastrar clínica:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar clínica. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log(
      "🔄 [FRONTEND] Cancelando operação, redirecionando para /dashboard",
    );
    router.push("/dashboard");
  };

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, não renderizar nada (já está redirecionando)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...clinicForm}>
          <form onSubmit={clinicForm.handleSubmit(onSave)}>
            <DialogHeader>
              <DialogTitle>Cadastro de clínicas</DialogTitle>
              <DialogDescription>
                Cadastre as clínicas que você atende.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <FormField
                  control={clinicForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="name">Nome da clínica</Label>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome da clínica"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={clinicForm.formState.isSubmitting}
              >
                {clinicForm.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {clinicForm.formState.isSubmitting
                  ? "Cadastrando..."
                  : "Criar Conta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClinicsFormPage;
