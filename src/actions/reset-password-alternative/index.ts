"use server";

import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import { accountsTable, usersTable } from "@/db/schema";

// Armazenamento temporário para tokens de redefinição (em produção, isso deveria estar em um banco de dados)
// Formato: { [email]: { token: string, expiresAt: Date } }
const resetTokens: Record<string, { token: string; expiresAt: Date }> = {};

export async function requestPasswordResetAlternative(email: string) {
  try {
    // Verificar se o usuário existe
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (!user) {
      // Por segurança, não informamos se o email existe ou não
      return { 
        success: true,
        message: "Se o email estiver registrado, um link de redefinição será gerado."
      };
    }

    // Gerar um token único
    const token = uuidv4();
    
    // Definir expiração para 1 hora a partir de agora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Armazenar o token (em produção, isso seria no banco de dados)
    resetTokens[email] = { token, expiresAt };
    
    // Retornar o token para uso na interface (apenas para esta solução temporária)
    return { 
      success: true, 
      token,
      message: "Token de redefinição gerado com sucesso. Em um ambiente de produção, este token seria enviado por email."
    };
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return { error: "Falha ao solicitar redefinição de senha" };
  }
}

export async function resetPasswordAlternative(token: string, email: string, newPassword: string) {
  try {
    // Verificar se existe um token válido para este email
    const resetData = resetTokens[email];
    
    if (!resetData || resetData.token !== token || new Date() > resetData.expiresAt) {
      return { error: "Token inválido ou expirado" };
    }
    
    // Buscar o usuário
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    
    if (!user) {
      return { error: "Usuário não encontrado" };
    }
    
    // Buscar a conta do usuário
    const account = await db.query.accountsTable.findFirst({
      where: eq(accountsTable.userId, user.id),
    });
    
    if (!account) {
      return { error: "Conta não encontrada" };
    }
    
    // Atualizar a senha (em um sistema real, a senha seria hasheada)
    await db.update(accountsTable)
      .set({ password: newPassword })
      .where(eq(accountsTable.id, account.id));
    
    // Remover o token usado
    delete resetTokens[email];
    
    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "Falha ao redefinir senha" };
  }
}
