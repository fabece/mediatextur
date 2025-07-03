import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from './app/configuration/configuration.enum';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configuration = app.get(ConfigService);

    const origins = configuration.get<string>(CONFIG.ALLOWED_ORIGINS);
    app.enableCors({
        origin: origins === '*' ? true : origins.split(','),
    });
    app.useGlobalPipes(new ValidationPipe());
    app.useBodyParser('json', { limit: '16mb' });
    app.useStaticAssets(join(__dirname, '..', 'public'));

    if (configuration.get<string>(CONFIG.NODE_ENV) === 'dev') {
        const sw = await import('@nestjs/swagger');
        const config = new sw.DocumentBuilder()
            .setTitle('Semora')
            .setDescription('The Semora API description')
            .setVersion('0.1')
            .addTag('Endpoints')
            .build();

        const document = sw.SwaggerModule.createDocument(app, config);
        sw.SwaggerModule.setup('swagger', app, document);
    }

    await app.listen(configuration.get<number>(CONFIG.PORT));
}

bootstrap();
