/**
 * Trigger a browser download for a generated Blob (.ics calendar files).
 *
 * Inside a sandboxed preview iframe, `<a download>` clicks are silently
 * blocked (no `allow-downloads` in the sandbox) — the button would appear
 * dead. When we detect we're framed we instead open the blob URL in a new
 * tab: the browser downloads the non-renderable type (text/calendar) there,
 * so the download still reaches the user. Outside iframes the classic
 * anchor-click download runs as before.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const revoke = (delay: number) =>
    window.setTimeout(() => URL.revokeObjectURL(url), delay);

  let framed = false;
  try {
    framed = window.self !== window.top;
  } catch {
    framed = true; // cross-origin window.top access throws → we're framed
  }

  if (framed) {
    const tab = window.open(url, "_blank", "noopener,noreferrer");
    if (tab) {
      revoke(60_000); // keep the blob alive until the new tab has fetched it
      return;
    }
    // Popups blocked too — fall through and attempt the direct download.
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  revoke(1000);
}
