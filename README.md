# bumble_sniffer

Current Landscape Bumble has:

Moved much of its frontend logic to bundled, obfuscated JS
Runs on a single-page React app, using dynamically compiled Webpack code
Executes fetches inside a Web Worker or a Service Worker
Implements a strict CSP with nonce-based script restrictions
Does not expose JSON profile data to window, fetch, React, or WebpackChunk in a conventional, interceptable way
All of this means: The raw JSON data never touches the page context you can access via your extension.
