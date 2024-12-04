/* eslint-disable no-undef */
document.addEventListener('htmx:afterSwap', function (event) {
  if (event.detail.target.id === 'webhook-list') {
    setupWebhookListeners()
  }
})

function setupWebhookListeners() {
  const webhookItems = document.querySelectorAll('.webhook-item')
  webhookItems.forEach((item) => {
    item.addEventListener('click', function () {
      const webhookId = this.dataset.id
      fetchWebhookDetails(webhookId)
    })
  })
}

function fetchWebhookDetails(id) {
  fetch(`/api/requests/${id}`)
    .then((response) => response.json())
    .then((data) => {
      displayWebhookDetails(data)
    })
    .catch((error) => console.error('Error:', error))
}

function displayWebhookDetails(webhook) {
  const detailsDiv = document.getElementById('webhook-details')
  const datetime = luxon.DateTime.fromISO(webhook.createdAt).toLocaleString(
    luxon.DateTime.DATETIME_FULL
  )

  detailsDiv.innerHTML = `
        <h2 class="text-xl font-bold mb-2">Webhook Details</h2>
        <p><strong>ID:</strong> ${webhook.id}</p>
        <p><strong>Method:</strong> ${webhook.method}</p>
        <p><strong>URL:</strong> ${webhook.url}</p>
        <p><strong>Created At:</strong> ${datetime}</p>
        <h3 class="text-lg font-semibold mt-4 mb-2">Headers:</h3>
        <pre class="bg-gray-100 p-2 rounded">${JSON.stringify(webhook.headers, null, 2)}</pre>
        <h3 class="text-lg font-semibold mt-4 mb-2">Body:</h3>
        <div class="relative">
            <pre id="webhookBody" class="bg-gray-100 p-2 rounded">${JSON.stringify(webhook.body, null, 2)}</pre>
            <button id="copyBodyBtn" class="absolute top-2 right-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm">
                Copy Body
            </button>
        </div>
    `

  setupCopyButton()
}

function setupCopyButton() {
  const copyBtn = document.getElementById('copyBodyBtn')
  const webhookBody = document.getElementById('webhookBody')

  copyBtn.addEventListener('click', function () {
    const bodyText = webhookBody.textContent
    navigator.clipboard.writeText(bodyText).then(
      function () {
        // Mudar o texto do botão temporariamente para dar feedback
        copyBtn.textContent = 'Copied!'
        setTimeout(() => {
          copyBtn.textContent = 'Copy Body'
        }, 2000)
      },
      function (err) {
        console.error('Could not copy text: ', err)
      }
    )
  })
}
