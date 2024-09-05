addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Get the client's IP address
  const clientIP = request.headers.get('cf-connecting-ip')
  
  // Check if the client's IP address is available
  if (!clientIP) {
    return new Response('Unable to determine client IP', { status: 500 })
  }

  // Fetch WHOIS data
  const whoisResponse = await fetch(`https://json.geoiplookup.io/${clientIP}`)
  const whoisData = await whoisResponse.json()

  // Check the 'Accept' header to determine if the request is from a browser
  const acceptHeader = request.headers.get('Accept')
  if (acceptHeader && acceptHeader.includes('text/html')) {
    // Return an HTML response with Tailwind CSS styling for terminal theme
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your IP Address</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body {
            background-color: #1a1a1a;
            color: #00ff00;
            font-family: 'Courier New', Courier, monospace;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .terminal {
            background-color: #000;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
            max-width: 100%;
            text-align: left;
            overflow: hidden;
          }
          .terminal-header {
            background-color: #333;
            border-bottom: 1px solid #555;
            display: flex;
            align-items: center;
            padding: 5px;
          }
          .terminal-header div {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 5px;
          }
          .terminal-header .close {
            background-color: #ff5f56;
          }
          .terminal-header .minimize {
            background-color: #ffbd2e;
          }
          .terminal-header .maximize {
            background-color: #27c93f;
          }
          .terminal-header p {
            margin: 0;
            flex-grow: 1;
            text-align: center;
            color: #fff;
          }
          .terminal-content {
            padding: 10px;
            background-color: #1e1e1e;
            color: #00ff00;
          }
          .terminal-content p {
            margin: 5px 0;
          }
          .copy-button {
            color: #00ff00;
            cursor: pointer;
          }
          .copy-button svg {
            vertical-align: middle;
          }
        </style>
      </head>
      <body>
        <section class="max-w-screen-lg mx-auto p-2 md:p-6 my-4 md:my-6 lg:my-8">
          <div class="terminal">
            <div class="terminal-header">
              <div class="close"></div>
              <div class="minimize"></div>
              <div class="maximize"></div>
              <p>Terminal</p>
            </div>
            <div class="terminal-content">
              <p class="pb-2">$ curl ip.masdzub.com</p>
              <p class="pb-2 text-sm md:text-2xl lg:text-4xl text-teal-500">
                ${clientIP}
                <button id="copy" class="copy-button" aria-label="copy IP address" data-clipboard-text="${clientIP}">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"></path>
                  </svg>
                </button>
              </p>
              <p class="pt-2">$ whois ${clientIP}</p>
              <p class="pt-2">
                ASN: ${whoisData.asn} <br>
                Colo: ${whoisData.continent_code} <br>
                Country: ${whoisData.country_code} <br>
                City: ${whoisData.city} <br>
                Continent: ${whoisData.continent_name} <br>
                Latitude: ${whoisData.latitude} <br>
                Longitude: ${whoisData.longitude} <br>
                Region: ${whoisData.region} <br>
                RegionCode: ${whoisData.region_code} <br>
                Timezone: ${whoisData.timezone}<br>
              </p>
            </div>
          </div>
        </section>
        <script>
          document.getElementById('copy').addEventListener('click', function() {
            const textToCopy = this.getAttribute('data-clipboard-text');
            navigator.clipboard.writeText(textToCopy).then(() => {
              alert('IP address copied to clipboard');
            });
          });
        </script>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })
  } else {
    // Return a plain text response for non-browser requests
    return new Response(clientIP, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}
