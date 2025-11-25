import { gemini, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";


const model = gemini({ model: "gemini-1.5-flash" });


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) =>{
    const codeAgent = createAgent({
      name: "summarizer",
      model,
      system: "You are an expert next.js developer. You write readable, maintainable code. You write simple Next.js & React. snippets.",
    });

    const { output } = await codeAgent.run(
      `Summarize the following text: ${event.data.text}`
    );

    return { output };

  }
);