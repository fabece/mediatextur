import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationMapper } from './app/configuration/configuration.mapper';
import { ConfigurationValidation } from './app/configuration/configuration.validation';
import { HealthController } from './app/controllers/health.controller';
import { AppController } from './app/controllers/app.controller';
import { ApiController } from './app/controllers/api.controller';
import { ContentService } from './app/services/content.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `${process.cwd()}/.env`,
            load: [ConfigurationMapper],
            cache: true,
            isGlobal: true,
            validationSchema: ConfigurationValidation,
        }),
    ],
    controllers: [AppController, ApiController, HealthController],
    providers: [ContentService],
})
export class AppModule {}
