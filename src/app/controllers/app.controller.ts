import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
    @Get()
    getPage(@Res() res: Response): void {
        return res.sendFile(join(__dirname, '..', '..', 'public', 'index.html'));
    }
}
