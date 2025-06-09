"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { resetPasswordAlternative } from "@/actions/reset-password-alternative";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordAlternativePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email,
      token: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const result = await resetPasswordAlternative(
        data.token,
        data.email,
        data.password
      );
      
      if (result.success) {
        setIsSuccess(true);
        toast.success("Senha redefinida com sucesso!");
        // Redirecionar para a página de login após alguns segundos
        setTimeout(() => {
          router.push("/authentication");
        }, 3000);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao redefinir a senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Redefinir Senha (Alternativo)</CardTitle>
          <CardDescription>
            {!isSuccess 
              ? "Insira o token e defina uma nova senha" 
              : "Sua senha foi redefinida com sucesso"}
          </CardDescription>
        </CardHeader>
        
        <div className="rounded-md bg-amber-50 mx-6 p-4 mb-4">
          <p className="text-sm text-amber-800">
            <strong>Nota:</strong> Esta é uma solução temporária apenas para testes. Em um ambiente de produção, o token seria validado automaticamente através do link enviado por email.
          </p>
        </div>
        
        {!isSuccess ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token de redefinição</FormLabel>
                      <FormControl>
                        <Input placeholder="Cole o token aqui" {...field} />
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
                      <FormLabel>Nova senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
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
                      <FormLabel>Confirmar nova senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Redefinindo..." : "Redefinir senha"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        ) : (
          <CardContent className="text-center">
            <p className="mb-4">
              Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login.
            </p>
            <Button asChild>
              <Link href="/authentication">Ir para o login</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
