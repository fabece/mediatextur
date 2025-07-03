import { GenerateContentDto } from './generate-content.dto';

export class SaveContentDto {
    content: string;
    metadata: GenerateContentDto;
}
