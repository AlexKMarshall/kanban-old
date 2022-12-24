import { spawn } from 'node:child_process'

type ServerProcess = {
  stop: () => void
  port: number
}

export async function startServer({
  databaseUrl,
  port,
}: {
  databaseUrl: string
  port: number
}) {
  const serverProcess = spawn('pnpm', ['start'], {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      PORT: port.toString(),
      BASE_URL: `http://localhost:${port}`,
    },
  })

  return new Promise<ServerProcess>((resolve, reject) => {
    serverProcess.stderr.on('data', (data) => {
      const dataString = data.toString()
      console.error(dataString)
      reject(new Error(dataString))
    })

    serverProcess.stdout.on('data', (data) => {
      const dataString = data.toString()
      console.log(dataString)
      if (dataString.includes('Remix App Server started')) {
        return resolve({
          async stop() {
            if (serverProcess.killed) return
            serverProcess.kill()
          },
          port,
        })
      }
    })
  })
}
