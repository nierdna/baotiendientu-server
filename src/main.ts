import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from '@/api/filters/GlobalExceptionFilter';
import { Logger as PinoLogger } from 'nestjs-pino';
import { SnakeCaseInterceptor } from '@/shared/interceptors/snake-case.interceptor';
import { SnakeCaseRequestPipe } from '@/shared/pipes/snake-case-request.pipe';

const isApi = Boolean(Number(process.env.IS_API || 0));

const PORT = process.env.PORT || '3000';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false,
    // bufferLogs: true,
  });

  if (isApi) {
    // const corsOrigin = process.env.CORS_ORIGIN.split(',') || [
    //   'http://localhost:3000',
    // ];

    app.enableCors({
      // allowedHeaders: ['content-type'],
      origin: '*',
      // credentials: true,
    });

    app.useLogger(app.get(PinoLogger));
    app.useGlobalPipes(new SnakeCaseRequestPipe(), new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new GlobalExceptionFilter(true, true));
    app.useGlobalInterceptors(new SnakeCaseInterceptor());

    if (process.env.APP_ENV !== 'production') {
      const options = new DocumentBuilder()
        .setTitle('API docs')
        // .setVersion(DEFAULT_API_VERSION)
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, options);
      SwaggerModule.setup('docs', app, document);
    }
    await app.listen(PORT);
    Logger.log(`🚀 Application is running in port http://localhost:${PORT}`);
  } else {
    await app.init();
  }
}
bootstrap();
