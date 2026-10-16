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
        message: "Storyboard prompt created successfully",
        data: prompt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create storyboard prompt",
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
        message: "Failed to fetch storyboard prompts",
      });
    }
  }

  async getPromptById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { promptId } = req.params;

      const prompt = await promptService.getPromptById(promptId as string);

      if (!prompt) {
        res.status(404).json({
          success: false,
          message: "Storyboard prompt not found",
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
        message: "Failed to fetch storyboard prompt",
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
        promptId as string,
        req.body
      );

      if (!updatedPrompt) {
        res.status(404).json({
          success: false,
          message: "Storyboard prompt not found",
        });

        return;
      }

      res.status(200).json({
        success: true,
        message: "Storyboard prompt updated successfully",
        data: updatedPrompt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update storyboard prompt",
      });
    }
  }

  async deletePrompt(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { promptId } = req.params;

      const deleted = await promptService.deletePrompt(promptId as string);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Storyboard prompt not found",
        });

        return;
      }

      res.status(200).json({
        success: true,
        message: "Storyboard prompt deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete storyboard prompt",
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
        message: "Failed to generate storyboard prompt",
      });
    }
  }
}

export default new PromptController();