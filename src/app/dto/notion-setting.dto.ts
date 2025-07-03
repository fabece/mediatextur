export interface INotionSettingsDto {
    systemPrompt: string;
    promptTemplates: {
        name: string;
        content: string;
    }[];
    toneValues: string[];
}
