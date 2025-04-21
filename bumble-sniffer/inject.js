(function () {
  const script1 = document.createElement('script');
  script1.src = chrome.runtime.getURL('interceptor.js');
  script1.onload = () => script1.remove();
  (document.head || document.documentElement).appendChild(script1);

  const script2 = document.createElement('script');
  script2.src = chrome.runtime.getURL('html2canvas.min.js');
  script2.onload = function () { this.remove(); };
  (document.head || document.documentElement).appendChild(script2);

})();
