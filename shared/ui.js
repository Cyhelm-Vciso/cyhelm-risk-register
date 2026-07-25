export const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[character]));

export async function askAi(prompt, target) {
  target.textContent = "Asking the configured provider…";
  try {
    const response = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt }) });
    const payload = await response.json();
    target.textContent = response.ok ? payload.content : payload.error;
  } catch {
    target.textContent = "AI is unavailable. The deterministic workflow remains fully usable.";
  }
}

export function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}


