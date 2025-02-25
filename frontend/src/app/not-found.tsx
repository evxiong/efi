import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto mt-16 flex w-full max-w-7xl flex-col items-center justify-center px-4 text-gray-900 sm:px-6">
        <div className="mb-6 text-center text-3xl font-light">
          Page not found
        </div>
        <Button variant="outline" asChild>
          <Link href="/">Return home</Link>
        </Button>
      </section>
    </div>
  );
}
