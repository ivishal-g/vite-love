import { gemini, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter"
import { getSandbox } from "./utils";

const model = gemini({ model: "gemini-1.5-flash" });


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) =>{
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-test-vishal");
      return sandbox.sandboxId;
    })

    const codeAgent = createAgent({
      name: "summarizer",
      model,
      system: "You are an expert next.js developer. You write readable, maintainable code. You write simple Next.js & React. snippets.",
    });

    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.text}`
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);

      const host = sandbox.getHost(3000);
      return `https://${host}`;
    })

    return { output, sandboxUrl };

  }
);