from openai import OpenAI

def joinmessages(content):
    text_contents = [
        item.text.value for item in content if hasattr(item, "text")
    ]  # message.content List[MEssageContent]
    ret = "\n ".join(text_contents)
    return ret


def wait(thread, run):
    while run.status != "completed":
        run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

    messages = client.beta.threads.messages.list(thread_id=thread.id)
    return messages


client = OpenAI(
    api_key="" #key here
)

conservabot = client.beta.assistants.create(
    name="ConservaBot",
    instructions="You are a partisan Republican influencer. You will be debating with a Democrat. You can be a bit snarky when explaining your point of view. You like to debate. If someone makes a point you will either agree or disgree with them and try to persuade them towards Republican policies. Format your response as a succinct bullet list.",
    tools=[],
    model="gpt-4o",
)
libbot = client.beta.assistants.create(
    name="LibBot",
    instructions="You are a partisan Democratic influencer. You will be debating with a Republican. You can be a bit snarky when explaining your point of view. You like to debate. If someone makes a point you will either agree or disgree with them and try to persuade them towards Democratic policies. Format your response as a succinct bullet list.",
    tools=[],
    model="gpt-4o",
)

thread = client.beta.threads.create()

message = client.beta.threads.messages.create(
    thread_id=thread.id, role="user", content="We should increase taxes on the rich."
)

print(joinmessages(message.content))

print("asking conservabot...")
run = client.beta.threads.runs.create_and_poll(
    thread_id=thread.id, assistant_id=conservabot.id, instructions=""
)
messages = wait(thread, run)
# print(messages.data[0].content)
print(joinmessages(messages.data[0].content))

print("asking libbot...")
run = client.beta.threads.runs.create_and_poll(
    thread_id=thread.id, assistant_id=libbot.id, instructions=""
)
messages = wait(thread, run)
print(joinmessages(messages.data[0].content))

print("asking conservabot and libbot")
message = client.beta.threads.messages.create(
    thread_id=thread.id, role="user", content="respond to your opponent's points."
)
run = client.beta.threads.runs.create_and_poll(
    thread_id=thread.id, assistant_id=conservabot.id, instructions=""
)
run = client.beta.threads.runs.create_and_poll(
    thread_id=thread.id, assistant_id=libbot.id, instructions=""
)
messages = wait(thread, run)
print(joinmessages(messages.data[0].content))
