import { z } from "zod";

export const todoValidationSchemema = z.object({
  id: z.string().describe("The id of the todo"),
  title: z.string().describe("The title of the todo"),
  description: z.string().optional().describe("The description of the todo"),
  isCompleted: z
    .boolean()
    .default(false)
    .describe("Whether the todo is completed or not"),
});

export type Todo = z.infer<typeof todoValidationSchemema>;
// export interface ITodo {
//   id: string;
//   title: string;
//   description: string;
//   isCompleted: boolean;
// }
