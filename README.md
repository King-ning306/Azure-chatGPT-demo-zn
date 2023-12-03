# 🤖 Powerful chatGPT for Azure OpenAI GPT model 

Welcome to Azure chatGPT , a fascinating chatGPT web app built with Node.js and Azure OpenAI gpt-35-turbo/gpt4 turbo model 1106. This project serves as a great starting point for developers who are interested in developing chatbot applications using JavaScript and Azure OpenAI API.

## 📺 What's new in current version
- **Split view for enhanced conversation experience， especially when you need to edit long messages.**
![Desktop Screenshot](screenshot_desktop_focus_mode.png)

- **Support for syncing conversation to other devices via Azure Table Storage 📡**

- **Generate follow-up questions based on the current conversation 🤔**

## 🌟 Features
- **You can now fully control messages in your current conversation. You have the ability to delete, hide, or unhide any message in the conversation. This means you can control the AI's memory for the conversation, allowing you to get more out of your conversations.💫**
![Dekstop Screenshot](screenshot_desktop.png)

- **Summarize current conversation and save it to markdown file 📝**
![Export to markdown file](screenshot_markdown.png)


- Manage AI profiles and support to Create new AI profile by using GPT-4 model in seconds 🤖!
![Manage AI profile](screenshot_profile_manager.png)

- **Support for Azure Text-to-Speech engine 📢**
- **Support generating image from text by using DALL-E API 🖼️**
- **Support Speech-to-Text by using Azure Speech-to-Text engine 🎙️**
- Display actor avatar and name in header when selected
- Support for loading system prompt from remote URL
- Message formatting preservation
- Token counter
- Mobile and tablet compatibility
![Optimize for mobile](screenshot_mobile.png)


## 🚀 Getting Started

### Prerequisites

- Node.js installed on your local machine
- An API key and endpoint from Azure OpenAI portal

### Installation

1. Clone the project to your local machine
2. Create a `.env` file in the root folder of the project
3. Add your API key and endpoint to the `.env` file using the following format:

   ```
   API_KEY=yourgpt35apikey
   API_URL=https://$yourendpoint
   GPT_4_API_KEY=yourgpt4apikey
   GPT_4_API_URL=https://$yourgpt4endpoint
   AZURE_STORAGE_CONNECTION_STRING=your-azure-storage-connection-string
   ```

4. (Optional) Add extra features with `PROMPT_REPO_URLS` and `AZURE_TTS`:

   - `PROMPT_REPO_URLS` is a JSON object containing the user name and the URL of the prompt file:
     ```
     PROMPT_REPO_URLS={"user1":"user1prompts.json", "user2":"user2prompts.json","user3":"user3prompts.json"}
     ```
     For the `user1prompts.json` content format, check the example file at `./public/prompts.json`.

   - `AZURE_TTS` is a JSON object containing the subscription key and the endpoint of the Azure Text-to-Speech service:

     ```
     AZURE_TTS={"subscriptionKey":"your subscription key","endpoint":"your endpoint"}
     ```
   - `API_DALLE_URL` is the endpoint of the DALL-E API service:
     ```
     API_DALLE_URL=yourdalleapiurl
     API_DALLE_KEY=yourdalleapikey
     ```
     
5. Install the necessary packages:

   ```
   npm install
   ```

6. Start the server:

   ```
   npm start
   ```

7. Open your browser and visit [http://localhost:3000](http://localhost:3000) to enjoy the chatGPT for your own!


Now you're all set to explore and develop your chatbot application using JavaScript and Azure OpenAI API. Happy coding! 🎉
