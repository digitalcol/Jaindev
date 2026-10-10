import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/preview")({
  component: PreviewPage,
});

function PreviewPage() {
  return (
    <iframe
      title="jaindev preview"
      src="/preview/index.html"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
        background: "#f5f6f0",
        zIndex: 50,
      }}
    />
  );
}
