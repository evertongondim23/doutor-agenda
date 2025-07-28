"use client";

import { DollarSign, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
}

export default function PlanosPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de planos
    setTimeout(() => {
      setPlans([
        {
          id: "1",
          name: "Plano Básico",
          description: "Ideal para clínicas pequenas",
          price: 99.9,
          duration: "mensal",
          features: [
            "Até 5 médicos",
            "Agendamento online",
            "Histórico de pacientes",
            "Suporte por email",
          ],
        },
        {
          id: "2",
          name: "Plano Profissional",
          description: "Para clínicas em crescimento",
          price: 199.9,
          duration: "mensal",
          features: [
            "Até 15 médicos",
            "Agendamento online",
            "Histórico completo",
            "Relatórios avançados",
            "Suporte prioritário",
            "Integração com sistemas",
          ],
        },
        {
          id: "3",
          name: "Plano Enterprise",
          description: "Para grandes clínicas e hospitais",
          price: 399.9,
          duration: "mensal",
          features: [
            "Médicos ilimitados",
            "Todas as funcionalidades",
            "API personalizada",
            "Suporte 24/7",
            "Treinamento incluído",
            "Integração customizada",
          ],
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <PageLayout
      title="Planos"
      description="Escolha o plano ideal para sua clínica"
      headerAction={
        <Button
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => toast.info("Funcionalidade em desenvolvimento")}
        >
          <Plus className="h-4 w-4" />
          <span>Novo Plano</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {loading ? (
          <div className="py-12 text-center">
            <div className="text-lg">Carregando planos...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </CardTitle>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      R$ {plan.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      /{plan.duration}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full" variant="outline">
                    Selecionar Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
