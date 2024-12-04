/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client'
import express from 'express'
import path from 'node:path'

const port = process.env.PORT || 3000

const app = express()
const prisma = new PrismaClient()

app.use(express.json())
app.use(express.static('public'))

app.post('/webhooks/evaluation/:integrationName', async (req, res) => {
  const { method, url, headers, body } = req
  await prisma.webhookRequest.create({
    data: {
      method,
      url,
      headers: headers as any,
      body: body as any,
    },
  })
  res.status(201).send('Webhook received')
})

app.get('/api/requests', async (_, res) => {
  const requests = await prisma.webhookRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, method: true, url: true, createdAt: true },
  })

  const html = requests
    .map(
      (request) => `
        <div class="webhook-item cursor-pointer hover:bg-gray-100 p-2 rounded" data-id="${request.id}">
            <p class="font-semibold">${request.method} ${request.url}</p>
            <p class="text-sm text-gray-500">${new Date(request.createdAt).toLocaleString()}</p>
        </div>
    `
    )
    .join('')

  res.send(html)
})

app.get('/api/requests/:id', async (req, res) => {
  const { id } = req.params
  const request = await prisma.webhookRequest.findUnique({
    where: { id },
  })
  if (request) {
    res.json(request)
  } else {
    res.status(404).json({ error: 'Webhook not found' })
  }
})

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

app.listen(port, () => console.log(`Server running on port ${port}`))
