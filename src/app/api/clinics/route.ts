import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/bd";
import { appUsersTable, clinicsTable, usersToClinicsTable } from "@/bd/schema";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nome da clínica é obrigatório" },
        { status: 400 },
      );
    }

    // Verificar sessão
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      console.error("❌ [API CLINICS POST] Usuário não autenticado");
      return NextResponse.json(
        { error: "Não autorizado - sessão inválida" },
        { status: 401 },
      );
    }

    console.log("✅ [API CLINICS POST] Usuário autenticado:", session.user.id);

    // Garantir que o usuário existe na appUsersTable
    await db
      .insert(appUsersTable)
      .values({ id: session.user.id })
      .onConflictDoNothing();

    // Inserir clínica
    const [clinic] = await db
      .insert(clinicsTable)
      .values({
        name,
        userId: session.user.id,
      })
      .returning();

    console.log("🏥 [API CLINICS POST] Clínica criada:", clinic);
    // Associar usuário à clínica
    await db.insert(usersToClinicsTable).values({
      userId: session.user.id,
      clinicId: clinic.id,
    });

    console.log("✅ [API CLINICS POST] Sucesso completo!");
    return NextResponse.json({ success: true, clinic });
  } catch (error) {
    console.error("💥 [API CLINICS POST] Erro:", error);
    return NextResponse.json(
      {
        error:
          "Erro interno do servidor: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar sessão
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Garantir que o usuário existe na appUsersTable
    await db
      .insert(appUsersTable)
      .values({ id: session.user.id })
      .onConflictDoNothing();

    // Buscar clínicas do usuário
    const clinics = await db.query.usersToClinicsTable.findMany({
      where: eq(usersToClinicsTable.userId, session.user.id),
      with: {
        clinic: true,
      },
    });

    return NextResponse.json({ clinics });
  } catch (error) {
    console.error("💥 [API CLINICS GET] Erro:", error);
    return NextResponse.json(
      {
        error:
          "Erro interno do servidor: " +
          (error instanceof Error ? error.message : "Unknown"),
      },
      { status: 500 },
    );
  }
}
