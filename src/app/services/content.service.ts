import { Injectable } from '@nestjs/common';
import { GenerateContentDto } from '../dto/generate-content.dto';
import { SaveContentDto } from '../dto/save-content.dto';
import { INotionSettingsDto } from '../dto/notion-setting.dto';
import { MessageReponseDto } from '../dto/message-response-dto';

// TODO:
@Injectable()
export class ContentService {
    async loadSettingsFromNotion(): Promise<INotionSettingsDto> {
        try {
            return {
                systemPrompt:
                    'You are a professional content creator for Mediatextur, specializing in SEO, SEA, and web development.',
                promptTemplates: [
                    {
                        name: 'Default',
                        content: `You are an experienced content creator and copywriting expert working on a new piece titled: "{title}".

Your task is to produce high-quality, audience-relevant, and well-structured content focused on the topic of "{topic}". If topic is empty, ignore this instruction. The content must incorporate the keywords: {keywords} in a natural and SEO-optimized manner. If keywords is empty, skip keyword optimization. The primary audience is: {audience}. If audience is empty, proceed with a general business audience in mind.

Write the content in a {tone} tone — adapt vocabulary, sentence structure, and style accordingly. If tone is not provided, use a neutral, professional tone.

Context to guide the content creation: {context}. If context is empty, disregard this instruction.

**Language Rule:** Generate the content in the language of the provided title ("{title}"), unless a specific language is explicitly requested in the context.

**Guidelines:**
- Structure the content clearly: use headings, subheadings, short paragraphs, and bullet points when appropriate.
- Avoid repetition, filler, or fluff. Every sentence should add value.
- Maintain factual accuracy. Do not invent statistics or claims.
- Write naturally, as if created by a human expert in the subject.
- Ensure that the text is engaging, informative, and aligned with best practices for digital content.
- Prefer clarity over complexity: keep it concise, yet complete.
- Use inclusive, respectful, and audience-appropriate language.
- If the target is commercial or marketing-related, include a call to action when appropriate.
- If generating multiple paragraphs, ensure logical flow between sections.

**Placeholder Behavior:** If any placeholder (such as topic, keywords, audience, tone, or context) is left blank or missing, omit the instruction related to it without substitution or filler.

The output should be suitable for direct publication on websites, blogs, or social media, with minimal editing.`,
                    },
                ],
                toneValues: [],
            };
        } catch (error) {
            const status = error?.response?.status || error?.status || 500;

            throw new Error(`${status}: Failed to load Notion settings`);
        }
    }

    async saveSettingsToNotion(data: INotionSettingsDto): Promise<MessageReponseDto> {
        try {
            console.log(data);
            return { message: 'Settings saved successfully!' };
        } catch (error) {
            const status = error?.response?.status || error?.status || 500;

            throw new Error(`${status}: Settings not saved!`);
        }
    }

    async saveContentToNotion(data: SaveContentDto): Promise<MessageReponseDto> {
        try {
            console.log(data);
            return { message: 'Content saved to Notion successfully!' };
        } catch (error) {
            const status = error?.response?.status || error?.status || 500;

            throw new Error(`${status}: Error saving to Notion`);
        }
    }

    async generateContent(data: GenerateContentDto): Promise<MessageReponseDto> {
        try {
            console.log(data);
            return {
                message: 'Content saved to Notion successfully!',
                content: 'GPT generated content based on provided data',
            };
        } catch (error) {
            const status = error?.response?.status || error?.status || 500;

            throw new Error(`${status}: Error generating content`);
        }
    }
}
