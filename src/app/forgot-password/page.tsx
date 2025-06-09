"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";

import { requestPasswordReset } from "@/actions/reset-password";
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

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const result = await requestPasswordReset({
        email: data.email,
      });
      
      if (result.success) {
        setIsSubmitted(true);
        toast.success("Email de redefinição de senha enviado!");
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
          <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
          <CardDescription>
            {!isSubmitted 
              ? "Informe seu email para receber um link de redefinição de senha" 
              : "Verifique seu email para redefinir sua senha"}
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
                  {isLoading ? "Enviando..." : "Enviar link de redefinição"}
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
          <CardContent className="flex flex-col gap-4 text-center">
            <p className="mb-4">
              Se houver uma conta associada ao email <strong>{form.getValues().email}</strong>,
              você receberá um link para redefinir sua senha.
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique sua caixa de entrada e pasta de spam.
            </p>
            <Button asChild className="mt-4">
              <Link href="/authentication">Voltar para o login</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
