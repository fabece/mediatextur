import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationMapper } from './app/configuration/configuration.mapper';
import { ConfigurationValidation } from './app/configuration/configuration.validation';
import { HealthModule } from './health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `${process.cwd()}/.env`,
            load: [ConfigurationMapper],
            cache: true,
            isGlobal: true,
            validationSchema: ConfigurationValidation,
        }),
        HealthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
