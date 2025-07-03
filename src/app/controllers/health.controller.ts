import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/health')
export class HealthController {
    @Get()
    check(): unknown {
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'NestJS API',
            version: process.env.npm_package_version || '1.0.0',
        };
    }
}
