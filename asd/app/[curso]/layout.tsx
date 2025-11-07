import { getCourse } from "@/lib/api";
import { GraduationCap } from "lucide-react";
import { notFound } from "next/navigation";
import Navigation from "./_components/navigation";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { curso: string };
}) {
  const course = await getCourse(params.curso);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <GraduationCap className="h-6 w-6 mr-2" />
            <span className="font-bold text-lg">Planejador de Grade</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Navigation curso={params.curso} />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        {children}
      </main>
    </div>
  );
}
