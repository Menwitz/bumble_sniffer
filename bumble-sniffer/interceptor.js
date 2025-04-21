(function () {
  console.log("👑 Bumble React Sniffer Hook Initializing");

  const seenUsers = new Set();

  function tryIntercept() {
    const reactKey = Object.keys(window).find(k => /^__REACT_DEVTOOLS_GLOBAL_HOOK__$/.test(k) || /webpackChunk/.test(k));
    const reactRoot = document.querySelector("#main");

    if (!reactKey || !reactRoot) {
      console.log("⏳ React or Webpack not ready");
      return;
    }

    const origJSONParse = JSON.parse;

    JSON.parse = function (...args) {
      try {
        const data = origJSONParse.apply(this, args);

        if (data && typeof data === "object" && data.users && Array.isArray(data.users)) {
          for (const user of data.users) {
            if (!user || seenUsers.has(user.user_id)) continue;

            seenUsers.add(user.user_id);

            const payload = {
              userId: user.user_id,
              name: user.name,
              age: user.age,
              bio: user.bio,
              photos: (user.photos || []).map(p => p.url).filter(Boolean)
            };

            console.log("🧬 Bumble Profile (from JSON.parse):", payload);

            fetch("http://localhost:5001/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });

            setTimeout(() => {
              const el = document.querySelector('[data-testid="match-card"]') || document.body;
              if (!el || typeof html2canvas !== "function") return;

              html2canvas(el).then(canvas => {
                canvas.toBlob(blob => {
                  const form = new FormData();
                  form.append("screenshot", blob, `${user.name}_${user.user_id}.png`);
                  form.append("userId", user.user_id);

                  fetch("http://localhost:5001/proof", {
                    method: "POST",
                    body: form
                  });
                }, "image/png");
              });
            }, 1000);
          }
        }

        return data;
      } catch (err) {
        return origJSONParse.apply(this, args);
      }
    };

    console.log("✅ Bumble JSON.parse hook installed");
  }

  const interval = setInterval(() => {
    try {
      tryIntercept();
    } catch (_) {}
  }, 1000);
})();
