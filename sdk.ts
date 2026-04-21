// Note: the "@anthropic-ai/claude-code" package has been renamed
// to "@anthropic-ai/claude-agent-sdk"
import { query } from "@anthropic-ai/claude-agent-sdk";

const prompt = "为package.json文件添加描述";

for await (const message of query({
  prompt,
  options: {
    allowedTools: ["Edit"],
  },
})) {
  console.log(JSON.stringify(message, null, 2));
}
