"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { getClinics } from "@/actions/get-clinics";
import { getSpecialties } from "@/actions/get-specialties";
import { getDoctorsBySpecialty } from "@/actions/get-doctors-by-specialty";
import { getAvailableSlots } from "@/actions/get-available-slots";
import { createPatientAppointment } from "@/actions/create-patient-appointment";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

// Tipos para os dados
type Doctor = {
  id: string;
  name: string;
  specialty: string;
  appointmentPriceInCents: number;
};

type Clinic = {
  id: string;
  name: string;
};

type TimeSlot = {
  time: string;
  available: boolean;
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const session = authClient.useSession();

  // Estados para armazenar dados do backend
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!session.data?.user) {
      router.push("/patient/login");
      return;
    }
    
    // Carregar clínicas disponíveis
    const fetchClinics = async () => {
      setLoadingClinics(true);
      try {
        const result = await getClinics();
        if (result.clinics) {
          setClinics(result.clinics);
        } else if (result.error) {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Erro ao carregar clínicas");
      } finally {
        setLoadingClinics(false);
      }
    };
    
    fetchClinics();
  }, [session.data, router]);

  // Carregar especialidades quando uma clínica for selecionada
  useEffect(() => {
    if (selectedClinic) {
      const fetchSpecialties = async () => {
        setLoadingSpecialties(true);
        try {
          const result = await getSpecialties(selectedClinic);
          if (result.specialties) {
            setSpecialties(result.specialties);
          } else if (result.error) {
            toast.error(result.error);
          }
        } catch (error) {
          toast.error("Erro ao carregar especialidades");
        } finally {
          setLoadingSpecialties(false);
        }
      };
      
      fetchSpecialties();
    }
  }, [selectedClinic]);

  // Carregar médicos quando uma especialidade for selecionada
  useEffect(() => {
    if (selectedClinic && selectedSpecialty) {
      const fetchDoctors = async () => {
        setLoadingDoctors(true);
        try {
          const result = await getDoctorsBySpecialty(selectedClinic, selectedSpecialty);
          if (result.doctors) {
            setDoctors(result.doctors);
          } else if (result.error) {
            toast.error(result.error);
          }
        } catch (error) {
          toast.error("Erro ao carregar médicos");
        } finally {
          setLoadingDoctors(false);
        }
      };
      
      fetchDoctors();
    }
  }, [selectedClinic, selectedSpecialty]);

  // Carregar horários disponíveis quando uma data for selecionada
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchTimeSlots = async () => {
        setLoadingSlots(true);
        try {
          const result = await getAvailableSlots({
            doctorId: selectedDoctor,
            date: selectedDate
          });
          
          if (result.slots) {
            setTimeSlots(result.slots);
          } else if (result.error) {
            toast.error(result.error);
          }
        } catch (error) {
          toast.error("Erro ao carregar horários disponíveis");
        } finally {
          setLoadingSlots(false);
        }
      };
      
      fetchTimeSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/patient/appointments");
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClinic || !selectedDoctor || !selectedDate || !selectedTime || !session.data?.user) {
      toast.error("Informações incompletas para agendamento");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Combinar data e hora selecionadas
      const appointmentDateTime = parse(
        selectedTime,
        "HH:mm",
        selectedDate
      );
      
      const result = await createPatientAppointment({
        doctorId: selectedDoctor,
        clinicId: selectedClinic,
        date: appointmentDateTime,
        patientName: session.data.user.name || "Paciente",
        patientEmail: session.data.user.email,
        patientPhone: "", // Idealmente, isso viria do perfil do paciente
        patientSex: "male", // Idealmente, isso viria do perfil do paciente
      });
      
      if (result.appointment) {
        toast.success("Consulta agendada com sucesso!");
        router.push("/patient/appointments");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro ao agendar consulta");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const selectedDoctorData = selectedDoctor
    ? doctors.find((d) => d.id === selectedDoctor)
    : null;

  // Se estiver carregando a sessão, mostra um indicador de carregamento
  if (session.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Button
        variant="ghost"
        className="mb-6 flex items-center"
        onClick={handleBack}
      >
        <ChevronLeftIcon className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <h1 className="mb-6 text-3xl font-bold">Agendar Consulta</h1>

      <div className="mb-8 flex justify-between">
        <div
          className={`flex flex-1 items-center justify-center ${
            step >= 1 ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            1
          </div>
          <span className="ml-2">Clínica</span>
        </div>
        <div
          className={`flex flex-1 items-center justify-center ${
            step >= 2 ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </div>
          <span className="ml-2">Médico</span>
        </div>
        <div
          className={`flex flex-1 items-center justify-center ${
            step >= 3 ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            3
          </div>
          <span className="ml-2">Data</span>
        </div>
        <div
          className={`flex flex-1 items-center justify-center ${
            step >= 4 ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 4 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            4
          </div>
          <span className="ml-2">Confirmação</span>
        </div>
      </div>

      <Card>
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Selecione a Clínica</CardTitle>
              <CardDescription>
                Escolha a clínica onde deseja realizar sua consulta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClinics ? (
                <div className="flex justify-center py-4">
                  <p>Carregando clínicas...</p>
                </div>
              ) : (
                <Select
                  value={selectedClinic || ""}
                  onValueChange={setSelectedClinic}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleNext}
                disabled={!selectedClinic || loadingClinics}
              >
                Continuar
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Selecione a Especialidade e o Médico</CardTitle>
              <CardDescription>
                Escolha a especialidade médica e o profissional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Especialidade
                </label>
                {loadingSpecialties ? (
                  <div className="flex justify-center py-4">
                    <p>Carregando especialidades...</p>
                  </div>
                ) : (
                  <Select
                    value={selectedSpecialty || ""}
                    onValueChange={setSelectedSpecialty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedSpecialty && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Médico
                  </label>
                  {loadingDoctors ? (
                    <div className="flex justify-center py-4">
                      <p>Carregando médicos...</p>
                    </div>
                  ) : (
                    <Select
                      value={selectedDoctor || ""}
                      onValueChange={setSelectedDoctor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um médico" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} - {formatCurrency(doctor.appointmentPriceInCents)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleNext}
                disabled={!selectedDoctor || loadingDoctors}
              >
                Continuar
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Selecione a Data e Horário</CardTitle>
              <CardDescription>
                Escolha o dia e horário para sua consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Data</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate || undefined}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(null); // Resetar o horário quando a data mudar
                      }}
                      initialFocus
                      disabled={(date) => {
                        // Desabilita datas passadas e finais de semana
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {selectedDate && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Horário
                  </label>
                  {loadingSlots ? (
                    <div className="flex justify-center py-4">
                      <p>Carregando horários disponíveis...</p>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="rounded-md bg-amber-50 p-4 text-center text-amber-800">
                      Não há horários disponíveis para esta data. Por favor, selecione outra data.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={
                            selectedTime === slot.time ? "default" : "outline"
                          }
                          className="text-center"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleNext}
                disabled={!selectedDate || !selectedTime || loadingSlots}
              >
                Continuar
              </Button>
            </CardFooter>
          </>
        )}

        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>Confirme sua Consulta</CardTitle>
              <CardDescription>
                Revise os detalhes da sua consulta antes de confirmar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Clínica</h3>
                  <p className="text-muted-foreground">
                    {clinics.find((c) => c.id === selectedClinic)?.name}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium">Médico</h3>
                  <p className="text-muted-foreground">
                    {selectedDoctorData?.name}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Especialidade</h3>
                  <p className="text-muted-foreground">
                    {selectedDoctorData?.specialty}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium">Data e Horário</h3>
                  <p className="text-muted-foreground">
                    {selectedDate &&
                      format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}{" "}
                    às {selectedTime}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium">Valor da Consulta</h3>
                  <p className="text-xl font-bold text-primary">
                    {selectedDoctorData &&
                      formatCurrency(selectedDoctorData.appointmentPriceInCents)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Confirmar Agendamento"}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
