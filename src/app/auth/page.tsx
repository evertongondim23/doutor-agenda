"use client";

// Force dynamic para evitar problemas de SSG
export const dynamic = "force-dynamic";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

// Schema para login
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
});

// Schema para cadastro
const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Nome é obrigatório" }).max(50),
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

export default function AuthPage() {
  const router = useRouter();

  // Formulário de login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Formulário de cadastro
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Função de login
  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      console.log("🚀 Iniciando login..."); // Debug
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      console.log("📊 Resultado do login:", result); // Debug

      if (result.data && result.data.user) {
        console.log("✅ Login bem-sucedido"); // Debug
        toast.success("Login feito com sucesso!");
        router.push("/dashboard");
      } else {
        console.log("❌ Login falhou - credenciais inválidas"); // Debug
        toast.error("Email ou senha incorreto");
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);
      console.log("❌ Mostrando toast de erro por exceção"); // Debug
      toast.error("Email ou senha incorreto");
    }
  };

  // Função de cadastro
  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    try {
      console.log("🚀 Iniciando cadastro..."); // Debug
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: "/dashboard",
      });

      console.log("📊 Resultado do cadastro:", result); // Debug

      if (result.data && result.data.user) {
        console.log("✅ Cadastro bem-sucedido"); // Debug
        toast.success("Cadastro realizado com sucesso!");
        console.log("Usuário criado:", result.data);
        registerForm.reset();
        router.push("/dashboard");
      } else if (result.error) {
        console.log("❌ Erro no cadastro:", result.error); // Debug

        // Verificar se é erro de email duplicado
        const errorMessage =
          result.error.message || result.error.toString() || "";

        if (
          errorMessage.toLowerCase().includes("email") &&
          (errorMessage.toLowerCase().includes("already") ||
            errorMessage.toLowerCase().includes("exists") ||
            errorMessage.toLowerCase().includes("duplicate") ||
            errorMessage.toLowerCase().includes("já existe") ||
            errorMessage.toLowerCase().includes("cadastrado"))
        ) {
          toast.error("Email já cadastrado");
        } else {
          toast.error("Erro ao realizar cadastro. Tente novamente.");
        }
      } else {
        console.log("❌ Cadastro falhou - motivo desconhecido"); // Debug
        toast.error("Erro ao realizar cadastro. Tente novamente.");
      }
    } catch (error: unknown) {
      console.error("❌ Exceção no cadastro:", error);
      console.log("❌ Tipo do erro:", typeof error); // Debug

      // Verificar se é erro de email duplicado na exceção
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : String(error);

      if (
        errorMessage.toLowerCase().includes("email") &&
        (errorMessage.toLowerCase().includes("already") ||
          errorMessage.toLowerCase().includes("exists") ||
          errorMessage.toLowerCase().includes("duplicate") ||
          errorMessage.toLowerCase().includes("já existe") ||
          errorMessage.toLowerCase().includes("cadastrado") ||
          errorMessage.toLowerCase().includes("unique constraint"))
      ) {
        console.log("🔍 Detectado erro de email duplicado"); // Debug
        toast.error("Email já cadastrado");
      } else {
        toast.error("Erro ao realizar cadastro. Tente novamente.");
      }
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/Logo.png"
            alt="Logo Dr. Agenda"
            width={137}
            height={28}
            priority
          />
        </div>

        {/* Abas de Login e Cadastro */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Criar conta</TabsTrigger>
          </TabsList>

          {/* Aba de Login */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Fazer Login</CardTitle>
                <CardDescription>
                  Digite suas credenciais para acessar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLogin)}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
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
                      control={loginForm.control}
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
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginForm.formState.isSubmitting}
                    >
                      {loginForm.formState.isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {loginForm.formState.isSubmitting
                        ? "Entrando..."
                        : "Entrar"}
                    </Button>
                  </form>
                </Form>

                {/* Links adicionais */}
                <div className="mt-4 space-y-2 text-center text-sm">
                  <p>Ou acesse diretamente:</p>
                  <div className="flex justify-center space-x-4">
                    <Link
                      href="/login"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Página de Login
                    </Link>
                    <span className="text-muted-foreground">•</span>
                    <Link
                      href="/signup"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Página de Cadastro
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Cadastro */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Preencha os dados abaixo para criar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegister)}
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite seu nome completo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
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
                      control={registerForm.control}
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
                      control={registerForm.control}
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
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerForm.formState.isSubmitting}
                    >
                      {registerForm.formState.isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {registerForm.formState.isSubmitting
                        ? "Cadastrando..."
                        : "Criar Conta"}
                    </Button>
                  </form>
                </Form>

                {/* Links adicionais */}
                <div className="mt-4 space-y-2 text-center text-sm">
                  <p>Ou acesse diretamente:</p>
                  <div className="flex justify-center space-x-4">
                    <Link
                      href="/login"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Página de Login
                    </Link>
                    <span className="text-muted-foreground">•</span>
                    <Link
                      href="/signup"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Página de Cadastro
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
