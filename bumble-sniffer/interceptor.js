(function () {
  console.log("👑 Bumble DOM Sniffer Activated");

  const seenUsers = new Set();

  const observer = new MutationObserver(() => {
    const nameEl = document.querySelector('[data-testid="profile-name"]');
    const bioEl = document.querySelector('[data-testid="profile-about"]');
    const imgEls = document.querySelectorAll('img');

    if (!nameEl) return;

    const name = nameEl.textContent.trim();
    if (seenUsers.has(name)) return;

    seenUsers.add(name);

    const bio = bioEl?.textContent?.trim() || "No bio";
    const photos = [...imgEls]
      .map(el => el.src)
      .filter(src => src.includes("bumbcdn.com") && !src.includes("__size__"));

    const userId = `bumble-${Date.now()}-${Math.floor(Math.random() * 999999)}`;

    console.log("🧬 Bumble DOM profile:", { userId, name, bio, photos });

    // Send profile data to backend
    fetch("http://localhost:5001/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        name,
        bio,
        photos
      })
    });

    // Screenshot
    setTimeout(() => {
      const el = document.querySelector('[data-testid="match-card"]') || document.body;

      if (!el || typeof html2canvas !== "function") return;

      html2canvas(el).then(canvas => {
        canvas.toBlob(blob => {
          const form = new FormData();
          form.append("screenshot", blob, `${name}_${userId}.png`);
          form.append("userId", userId);

          fetch("http://localhost:5001/proof", {
            method: "POST",
            body: form
          });
        }, "image/png");
      });
    }, 1000);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
