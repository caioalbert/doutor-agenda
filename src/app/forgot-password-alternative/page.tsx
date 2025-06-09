"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";

import { requestPasswordResetAlternative } from "@/actions/reset-password-alternative";
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
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordAlternativePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const result = await requestPasswordResetAlternative(data.email);
      
      if (result.success) {
        setIsSubmitted(true);
        if (result.token) {
          setResetToken(result.token);
        }
        toast.success("Token de redefinição gerado com sucesso!");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao solicitar redefinição de senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Esqueci minha senha (Alternativo)</CardTitle>
          <CardDescription>
            {!isSubmitted 
              ? "Informe seu email para gerar um token de redefinição de senha" 
              : "Token de redefinição gerado"}
          </CardDescription>
        </CardHeader>
        
        {!isSubmitted ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Gerando token..." : "Gerar token de redefinição"}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/authentication" className="text-primary hover:underline">
                    Voltar para o login
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        ) : (
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-md bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                <strong>Nota:</strong> Esta é uma solução temporária apenas para testes. Em um ambiente de produção, o token seria enviado por email.
              </p>
            </div>
            
            {resetToken && (
              <div className="mt-4">
                <p className="mb-2 font-medium">Token de redefinição:</p>
                <div className="overflow-x-auto rounded-md bg-gray-100 p-3">
                  <code className="text-sm">{resetToken}</code>
                </div>
                <p className="mt-4 text-sm">
                  Use este token na página de redefinição de senha:
                </p>
                <div className="mt-2">
                  <Link 
                    href={`/reset-password-alternative?email=${encodeURIComponent(form.getValues().email)}`}
                    className="text-primary hover:underline"
                  >
                    Ir para página de redefinição de senha
                  </Link>
                </div>
              </div>
            )}
            
            <Button asChild className="mt-4">
              <Link href="/authentication">Voltar para o login</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
