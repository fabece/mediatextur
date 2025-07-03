import { Controller, Get } from '@nestjs/common';

@Controller('api/v1')
export class ApiController {
    @Get('placeholder')
    getApiPlaceholder(): { message: string } {
        return {
            message: 'Placeholder...',
        };
    }
}
