import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

// Schema para cadastro
const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Nome é Obrigatório" }).max(50),
    email: z.string().email({ message: "Email inválido" }),
    password: z
      .string()
      .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Componente de cadastro
const SignUpForm = () => {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      const result = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: "/dashboard",
      });

      if (result.data) {
        alert("✅ Cadastro realizado com sucesso!");
        console.log("Usuário criado:", result.data);
        form.reset();
        // Redirecionar para dashboard ou login
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("❌ Erro ao realizar cadastro. Tente novamente.");
    }
  }

  // Renderização do componente
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro</CardTitle>
        <CardDescription>Faça seu cadastro para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Digite seu email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Digite sua senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirme sua senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Cadastrar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
