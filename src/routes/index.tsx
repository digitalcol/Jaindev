import { createFileRoute } from "@tanstack/react-router";
import { SanghApp } from "@/components/sangh-app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <SanghApp mode="public" />;
}
