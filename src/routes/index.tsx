import { createFileRoute } from "@tanstack/react-router";
import { Explorer } from "@/components/explorer";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <Explorer />;
}
