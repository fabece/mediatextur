export interface IGenerateContentDto {
    systemPrompt: string;
    title: string;
    promptSelect: string;
    topic?: string;
    keywords?: string;
    targetAudience?: string;
    tone?: string;
    additionalContext?: string;
}
