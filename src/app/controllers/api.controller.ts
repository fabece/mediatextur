import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ContentService } from '../services/content.service';
import { GenerateContentDto } from '../dto/generate-content.dto';
import { SaveContentDto } from '../dto/save-content.dto';
import { INotionSettingsDto } from '../dto/notion-setting.dto';
import { MessageReponseDto } from '../dto/message-response-dto';

@Controller('api/v1')
export class ApiController {
    constructor(private readonly contentService: ContentService) {}

    @Get('notion/settings')
    async loadSettingsFromNotion(): Promise<INotionSettingsDto> {
        return this.contentService.loadSettingsFromNotion();
    }

    @Patch('notion/settings')
    async saveSettingsToNotion(@Body() data: INotionSettingsDto): Promise<MessageReponseDto> {
        return this.contentService.saveSettingsToNotion(data);
    }

    @Post('notion/save')
    async saveContentToNotion(@Body() data: SaveContentDto): Promise<MessageReponseDto> {
        return this.contentService.saveContentToNotion(data);
    }

    @Post('content/generate')
    async generateContent(@Body() data: GenerateContentDto): Promise<MessageReponseDto> {
        return this.contentService.generateContent(data);
    }
}
