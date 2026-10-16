import {
  CreatePromptInput,
  PromptTemplate,
  UpdatePromptInput,
} from "./prompt.types";

class PromptService {
  private prompts: PromptTemplate[] = [];

  async createPrompt(
    input: CreatePromptInput
  ): Promise<PromptTemplate> {
    const now = new Date();

    const prompt: PromptTemplate = {
      id: Date.now().toString(),
      name: input.name,
      type: input.type,
      template: input.template,
      createdAt: now,
      updatedAt: now,
    };

    this.prompts.push(prompt);

    return prompt;
  }

  async getAllPrompts(): Promise<PromptTemplate[]> {
    return this.prompts;
  }

  async getPromptById(
    promptId: string
  ): Promise<PromptTemplate | null> {
    const prompt = this.prompts.find(
      (item) => item.id === promptId
    );

    return prompt || null;
  }

  async updatePrompt(
    promptId: string,
    input: UpdatePromptInput
  ): Promise<PromptTemplate | null> {
    const promptIndex = this.prompts.findIndex(
      (item) => item.id === promptId
    );

    if (promptIndex === -1) {
      return null;
    }

    const existingPrompt = this.prompts[promptIndex];

    const updatedPrompt: PromptTemplate = {
      ...existingPrompt,
      ...input,
      updatedAt: new Date(),
    };

    this.prompts[promptIndex] = updatedPrompt;

    return updatedPrompt;
  }

  async deletePrompt(promptId: string): Promise<boolean> {
    const promptIndex = this.prompts.findIndex(
      (item) => item.id === promptId
    );

    if (promptIndex === -1) {
      return false;
    }

    this.prompts.splice(promptIndex, 1);

    return true;
  }

  generatePrompt(
    template: string,
    variables: Record<string, string>
  ): string {
    let generatedPrompt = template;

    Object.entries(variables).forEach(([key, value]) => {
      const variablePattern = new RegExp(`{{\\s*${key}\\s*}}`, "g");

      generatedPrompt = generatedPrompt.replace(
        variablePattern,
        value
      );
    });

    return generatedPrompt;
  }
}

export default new PromptService();