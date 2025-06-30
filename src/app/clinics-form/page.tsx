"use client";

// Force dynamic para evitar problemas de SSG
export const dynamic = "force-dynamic";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

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

const clinicsFormSchema = z.object({
  name: z.string().min(1, { message: "Nome da clínica é obrigatório" }),
});

type ClinicsFormData = z.infer<typeof clinicsFormSchema>;

const ClinicsFormPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicsFormData>({
    resolver: zodResolver(clinicsFormSchema),
  });

  const onSubmit = async (data: ClinicsFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/clinics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: data.name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cadastrar clínica");
      }

      toast.success("Clínica cadastrada com sucesso!");
      router.push("/dashboard");
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
    router.push("/dashboard");
  };

  return (
    <Dialog open={true}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cadastro de clínicas</DialogTitle>
            <DialogDescription>
              Cadastre as clínicas que você atende.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Nome da clínica</Label>
              <Input
                id="name"
                placeholder="Digite o nome da clínica"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default ClinicsFormPage;
