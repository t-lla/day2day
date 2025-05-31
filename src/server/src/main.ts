import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
  })

  app.setGlobalPrefix("api")

  await app.listen(3001)
  console.log("Day2Day API running on http://localhost:3001")
}
bootstrap()
