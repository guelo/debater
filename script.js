
// Get references to DOM elements
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let conservaBot;
let libBot;
let thread;



// Function to create a bot message
function createBotMessage(botName, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');
    
    if (botName.toLowerCase().includes('conservabot')) {
        messageElement.classList.add('conservabot');
    } else if (botName.toLowerCase().includes('libbot')) {
        messageElement.classList.add('libbot');
    }
    
    messageElement.innerText = `${botName}: ${message}`;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Function to send message to OpenAI API
async function sendMessageToOpenAI(prompt) {
    const response = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
            role: "user",
            content: prompt
        })
    });
    return await response.json();
}

// Event listener for send button click
sendButton.addEventListener('click', async () => {
    const messageText = messageInput.value.trim();
    
    if (messageText !== '') {
       
        // Send message to OpenAI API
        const data = await sendMessageToOpenAI(messageText);
        console.log(data);

         // Display user message
         const messageElement = document.createElement('div');
         messageElement.classList.add('message', 'user-message');
         messageElement.innerText = data.content[0].text.value;
         messageContainer.appendChild(messageElement);         
        
        // Scroll to the bottom of the message container
        messageContainer.scrollTop = messageContainer.scrollHeight;
        
        // Clear input field
        messageInput.value = '';
    }
});

// Function to create assistant
async function createAssistant(instructions) {
    const response = await fetch('https://api.openai.com/v1/assistants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
            model: "chatgpt-4o-latest",
            instructions: instructions,
            tools: [],
            name: "ConservaBot"
        })
    });
    return await response.json();
}

// Create assistant when the page loads
(async () => {
    conservaBot = await createAssistant(
        "You are ConservaBot, a hard core conservative Trump supporter. You are smart and informed on all political toopics.  You will be debating with a liberal. Be funny and  snarky to score points. You are good at  debate. You will target your points at a somewhat uninformed moderate voter. Format your message about tweet sized."
    )
    libBot = await createAssistant(
        "You are LibBot, a hard core progressive liberal. You are smart and informed on all political toopics.  You will be debating with a conservative. Be funny and  snarky to score points. You are good at  debate. You will target your points at a somewhat uninformed moderate voter. Format your message about tweet sized."
    )

    const response = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({ })
    });
    thread = await response.json();
    console.log(thread);
})()

// Allow pressing Enter key to send message
messageInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Get references to bot buttons
const bot1Button = document.getElementById('bot1-button');
const bot2Button = document.getElementById('bot2-button');

function setButtonLoading(button, isLoading) {
    button.disabled = isLoading;
    button.querySelector('.spinner').style.display = isLoading ? 'block' : 'none';
}

// Event listener for Bot 1 button
bot1Button.addEventListener('click', async () => {
    setButtonLoading(bot1Button, true);
    try {
        const messages = await botResponse(conservaBot.id);
        createBotMessage('Conservabot: ', messages.data[0].content[0].text.value);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        setButtonLoading(bot1Button, false);
    }
});

// Event listener for Bot 2 button
bot2Button.addEventListener('click', async () => {
    setButtonLoading(bot2Button, true);
    try {
        const messages = await botResponse(libBot.id);
        createBotMessage('Libbot: ', messages.data[0].content[0].text.value);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        setButtonLoading(bot2Button, false);
    }
});

// Allow pressing Enter key to send message
messageInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
async function botResponse(botId) {
    const response = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
            assistant_id: botId
        })
    });
    let run = await response.json();
    console.log(run);

    while (run.status !== "completed") {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 1 second before checking again
        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });
        run = await statusResponse.json();
        console.log(run);
    }

    // Fetch the messages after the run is completed
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
        }
    });
    const messages = await messagesResponse.json();
    console.log(messages);
    return messages;
}

