(function () {
  const inject = (src) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(src);
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  };

  inject("html2canvas.min.js");
  inject("domScraper.js");
})();
