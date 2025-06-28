import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-center">
        <Image
          src="/logo.png"
          alt="Logo Doutor Agenda"
          width={200}
          height={80}
          priority
        />
      </div>

      <div className="mx-auto max-w-md rounded-lg border bg-white p-6 shadow-md">
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Digite seu nome completo"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              className="w-full"
            />
          </div>

          <Button className="w-full" type="submit">
            Enviar
          </Button>
        </form>
      </div>

      <div className="mt-6 flex justify-center">
        <a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button className="bg-green-600 hover:bg-green-700">
            <FaWhatsapp className="mr-2 h-5 w-5" />
            Fale conosco no WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
