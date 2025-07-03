import { IGenerateContentDto } from './generate-content.dto';

export interface ISaveContentDto {
    content: string;
    metadata: IGenerateContentDto;
}
