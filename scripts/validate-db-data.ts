import "dotenv/config";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const tables = [
    "user",
    "session",
    "account",
    "verification",
    "users",
    "users_to_clinics",
    "clinics",
    "doctors",
    "appointment",
    "patients",
  ];

  for (const table of tables) {
    try {
      const result = await pool.query(`SELECT COUNT(*) FROM \"${table}\"`);
      console.log(`${table}: ${result.rows[0].count} registros`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(`Erro ao consultar a tabela ${table}:`, e.message);
      } else {
        console.error(`Erro ao consultar a tabela ${table}:`, String(e));
      }
    }
  }

  // Exemplo de checagem de dados inconsistentes (pode ser expandido)
  // Exemplo: pacientes sem clínica válida
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM patients p LEFT JOIN clinics c ON p.clinic_id = c.id WHERE c.id IS NULL`,
    );
    console.log(`Pacientes sem clínica válida: ${result.rows[0].count}`);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(`Erro ao checar pacientes sem clínica:`, e.message);
    } else {
      console.error(`Erro ao checar pacientes sem clínica:`, String(e));
    }
  }

  await pool.end();
  process.exit(0);
}

main();
