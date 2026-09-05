import { Request, Response } from "express";
import promptService from "./prompt.service";

class PromptController {
  async createPrompt(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { name, type, template } = req.body;

      if (!name || !type || !template) {
        res.status(400).json({
          success: false,
          message: "name, type and template are required",
        });

        return;
      }

      const prompt = await promptService.createPrompt({
        name,
        type,
        template,
      });

      res.status(201).json({
        success: true,
        message: "Prompt created successfully",
        data: prompt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create prompt",
      });
    }
  }

  async getAllPrompts(
    _req: Request,
    res: Response
  ): Promise<void> {
    try {
      const prompts = await promptService.getAllPrompts();

      res.status(200).json({
        success: true,
        data: prompts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch prompts",
      });
    }
  }

  async getPromptById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { promptId } = req.params;

      const prompt = await promptService.getPromptById(promptId);

      if (!prompt) {
        res.status(404).json({
          success: false,
          message: "Prompt not found",
        });

        return;
      }

      res.status(200).json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch prompt",
      });
    }
  }

  async updatePrompt(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { promptId } = req.params;

      const updatedPrompt = await promptService.updatePrompt(
        promptId,
        req.body
      );

      if (!updatedPrompt) {
        res.status(404).json({
          success: false,
          message: "Prompt not found",
        });

        return;
      }

      res.status(200).json({
        success: true,
        message: "Prompt updated successfully",
        data: updatedPrompt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update prompt",
      });
    }
  }

  async deletePrompt(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { promptId } = req.params;

      const deleted = await promptService.deletePrompt(promptId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Prompt not found",
        });

        return;
      }

      res.status(200).json({
        success: true,
        message: "Prompt deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete prompt",
      });
    }
  }

  async generatePrompt(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { template, variables } = req.body;

      if (!template || !variables) {
        res.status(400).json({
          success: false,
          message: "template and variables are required",
        });

        return;
      }

      const generatedPrompt = promptService.generatePrompt(
        template,
        variables
      );

      res.status(200).json({
        success: true,
        data: {
          prompt: generatedPrompt,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to generate prompt",
      });
    }
  }
}

export default new PromptController();