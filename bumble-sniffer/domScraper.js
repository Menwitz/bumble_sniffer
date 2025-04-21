(function () {
    console.log("👑 Bumble DOM Sniffer Activated");
  
    const seen = new Set();
  
    const observer = new MutationObserver(() => {
      const nameEl = document.querySelector('[data-testid="profile-name"]');
      const bioEl = document.querySelector('[data-testid="profile-about"]');
      const card = document.querySelector('[data-testid="match-card"]');
      const imgs = Array.from(card?.querySelectorAll("img") || []);
  
      if (!nameEl || seen.has(nameEl.textContent.trim())) return;
  
      const name = nameEl.textContent.trim();
      const bio = bioEl?.textContent.trim() || "";
      const photoURLs = imgs.map(img => img.src).filter(src => src.includes("bumbcdn.com"));
  
      if (!photoURLs.length) return;
  
      const userId = `bumble-${Date.now()}-${Math.floor(Math.random() * 99999)}`;
      seen.add(name);
  
      const payload = {
        userId,
        name,
        bio,
        photos: photoURLs
      };
  
      console.log("🧬 Captured profile:", payload);
  
      fetch("http://localhost:5001/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
  
      setTimeout(() => {
        if (typeof html2canvas !== "function") return;
  
        html2canvas(card || document.body).then(canvas => {
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
  