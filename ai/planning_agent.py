# async AI chat
# AI json-format schedule output
# json-format
'''
{
    learning-outcome: Fundamentals,
    materials: [
        Pencil,
        Sharpener,
        Sketchbook,
    ],
    topics: [
        Linework,
        Shape Design,
        Simple Perspective
    ],
    deadline: 2-20-26 M/D/Y,
    assignments: [
        {
            id: 1.1 - Linework,
            content: "",
            modules:
        },
        {
            id: 1.2 - Shape Design,
            content: "",
            modules:
        }
    ]
}
'''
from pydantic_ai import Agent, AgentRunResultEvent, AgentStreamEvent

agent = Agent('')

async def main():
    result = await agent.run('What is the capital of France?')
    print(result.output)
    #> The capital of France is Paris.

    async with agent.run_stream('What is the capital of the UK?') as response:
        async for text in response.stream_text():
            print(text)




