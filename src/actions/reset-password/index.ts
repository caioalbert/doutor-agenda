"use server";

import { auth } from "@/lib/auth";

interface RequestPasswordResetInput {
  email: string;
}

interface ResetPasswordInput {
  token: string;
  password: string;
}

export async function requestPasswordReset(input: RequestPasswordResetInput) {
  try {
    await auth.api.resetPassword.request({
      email: input.email,
      // Normalmente, você configuraria um URL para onde o usuário será redirecionado
      // após clicar no link de redefinição de senha no email
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return { error: "Falha ao solicitar redefinição de senha" };
  }
}

export async function resetPassword(input: ResetPasswordInput) {
  try {
    await auth.api.resetPassword.reset({
      token: input.token,
      password: input.password,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "Falha ao redefinir senha" };
  }
}
