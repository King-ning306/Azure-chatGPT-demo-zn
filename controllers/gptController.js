// controllers/gptController.js

const devMode = process.env.DEV_MODE ? eval(process.env.DEV_MODE) : false;
let apiKey, apiUrl, gpt4Apikey, gpt4ApiUrl, gpt4LastApiKey, gpt4LastApiUrl, gpt4vApiKey, gpt4vApiUrl, azureCVApiKey, azureCVApiUrl;
if (devMode) {
    apiKey = process.env.API_KEY_DEV;
    apiUrl = process.env.API_URL_DEV;
} else {
    apiKey = process.env.API_KEY;
    apiUrl = process.env.API_URL;
}
gpt4Apikey = process.env.GPT_4_API_KEY;
gpt4ApiUrl = process.env.GPT_4_API_URL;
gpt4LastApiKey = process.env.GPT_4_LAST_API_KEY;
gpt4LastApiUrl = process.env.GPT_4_LAST_API_URL;

gpt4vApiKey = process.env.GPT_4V_API_KEY;
gpt4vApiUrl = process.env.GPT_4V_API_URL;
azureCVApiKey = process.env.AZURE_CV_API_KEY;
azureCVApiUrl = process.env.AZURE_CV_API_URL;

const defaultParams = {
    temperature: 0.8,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2000
};

const axios = require("axios");

exports.getDefaultParams = (req, res) => {
    res.json(defaultParams);
};

const handleRequestError = (error, res) => {
    console.error(error.message);
    console.error(error.stack);

    if (error.response) {
        console.error(error.response.data);
        console.error(error.response.status);
        return res.status(error.response.status).send(error.response.data);
    } else if (error.request) {
        console.error(error.request);
        return res.status(500).send("Request was made but no response was received");
    } else {
        return res.status(500).send("Error", error.message);
    }
};

const makeRequest = async ({ apiKey, apiUrl, prompt, params }) => {
    console.log("makeRequest", prompt);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
        },
        data: {
            messages: prompt,
            ...params,
            stop: null,
        },
    };

    return await axios(apiUrl, options);
};


exports.generateGpt4VResponse = async (req, res) => {
    console.log("generateGpt4VResponse", req.body);
    // 解析请求体中提供的数据
    const { enhancements, grounding, ocr } = req.body;

    const prompt = JSON.parse(req.body.prompt);
    if (!prompt || !prompt.length) {
        console.error("Invalid prompt");
        return res.status(400).send("Invalid prompt");
    }

    let data;
    // 设置用于调用的参数
    if (enhancements) {
        data = {
            enhancements: {
                ocr: {
                    enabled: ocr || false
                },
                grounding: {
                    enabled: grounding || false
                }
            },
            data_sources: [
                {
                    type: "AzureComputerVision",
                    parameters: {
                        endpoint: azureCVApiUrl,
                        key: azureCVApiKey
                    }
                }
            ],
            messages: prompt,
            ...defaultParams
        };
    } else {
        data = {
            messages: prompt,
            ...defaultParams
        };
    }
    console.log("request data", data);

    // 准备请求配置
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": gpt4vApiKey,
        },
        data: JSON.stringify(data),
    };

    console.log("gpt4v options", options);

    try {
        // 发送请求并处理响应
        console.log("Sending request to GPT-4-Vision", gpt4vApiUrl);
        const response = await axios(gpt4vApiUrl, options);
        console.log("Response from GPT-4-Vision:", response.data);

        // 假设数据结构和 generateResponse 中相同，我们提取 message 和 totalTokens
        const choices = response.data.choices || [];
        const message = choices.length > 0 ? choices[0].message.content : "No response from GPT-4-Vision";
        const totalTokens = response.data.usage ? response.data.usage.total_tokens : 0;
        const responseObj = { message, totalTokens };
        console.log("responseObj", responseObj);
        res.json(responseObj);
    } catch (error) {
        // 错误处理
        handleRequestError(error, res);
    }
};


exports.generateResponse = async (req, res) => {
    const { model, temperature, top_p, frequency_penalty, presence_penalty, max_tokens } = req.body;
    const prompt = JSON.parse(req.body.prompt);
    if (!prompt || !prompt.length) {
        console.error("Invalid prompt");
        return res.status(400).send("Invalid prompt");
    }

    let currentApiKey, currentApiUrl;
    console.log("model", model);
    switch (model) {
    case "gpt-3.5-turbo":
        currentApiKey = apiKey;
        currentApiUrl = apiUrl;
        break;
    case "gpt-4":
        currentApiKey = gpt4Apikey;
        currentApiUrl = gpt4ApiUrl;
        break;
    case "gpt-4-last":
        currentApiKey = gpt4LastApiKey;
        currentApiUrl = gpt4LastApiUrl;
        break;
    default:
        return res.status(400).send("Invalid model specified");
    }


    const requestData = {
        apiKey: currentApiKey,
        apiUrl: currentApiUrl,
        prompt,
        params: {
            temperature,
            top_p,
            frequency_penalty,
            presence_penalty,
            max_tokens,
        },
    };

    try {
        const response = await makeRequest(requestData);
        const { data } = response;
        const message = data.choices[0].message.content || data.choices[0].finish_reason;
        const totalTokens = data.usage.total_tokens;
        const responseObj = { message, totalTokens };
        console.log("responseObj", responseObj);
        res.send(responseObj);
    } catch (error) {
        handleRequestError(error, res);
    }
};


exports.createChatProfile = async (req, res) => {
    const profession = req.body.profession;
    const prompt = [
        {
            role: "user",
            content:
                `Output:
            { "name": "", "icon": "", "displayName": "", "prompt": ""}

            Input:
            Please create a chat profile for the following profession or scenario: ${profession}. Please use the following template to generate the chat profile. The icon should be a font awesome icon code, for example, fas fa-robot, fab fa-js-square, etc. Please note that the output should be in JSON format.
            {
                "name": "dotNETCoreExpert",
                "icon": "fas fa-code",
                "displayName": ".NET Core Expert",
                "prompt": "I want you to act as an expert in .NET Core expert. I will provide some details about a project or problem, and it will be your job to come up with solutions using .NET Core. This could involve creating code snippets, debugging existing code, or providing advice on best practices. 
            }

            Output:`,
        },
    ];

    const requestData = {
        apiKey: gpt4Apikey,
        apiUrl: gpt4ApiUrl,
        prompt,
        params: {
            temperature: 0.8,
            top_p: defaultParams.top_p,
            frequency_penalty: defaultParams.frequency_penalty,
            presence_penalty: defaultParams.presence_penalty,
            max_tokens: defaultParams.max_tokens,
            response_format: { "type": "json_object" }
        },
    };

    try {
        const response = await makeRequest(requestData);
        const { data } = response;
        const message = data.choices[0].message.content;
        const chatProfile = JSON.parse(message);
        res.send(chatProfile);
    } catch (error) {
        handleRequestError(error, res);
    }
};

exports.summarizeConversation = async (req, res) => {
    const conversation = req.body.conversation;

    const prompt = [
        {
            role: "user",
            content:
                `Output:
            {
                "title":"",
                "summary":""
            }

            Input:
            Please summarize the following conversation into a title and a paragraph of no more than 200 words. Please note that the output should be in JSON format.
            ===
            ${conversation}
            ===
            
            Output:`,
        },
    ];

    const requestData = {
        apiKey: apiKey,
        apiUrl: apiUrl,
        prompt,
        params: {
            temperature: 0.3,
            top_p: defaultParams.top_p,
            frequency_penalty: defaultParams.frequency_penalty,
            presence_penalty: defaultParams.presence_penalty,
            max_tokens: 2000,
            response_format: { "type": "json_object" }
        },
    };

    try {
        const response = await makeRequest(requestData);
        const { data } = response;
        const message = data.choices[0].message.content;
        const conversationSummary = JSON.parse(message);
        res.send(conversationSummary);
    } catch (error) {
        handleRequestError(error, res);
    }
};

exports.generateTitle = async (req, res) => {
    const conversation = req.body.conversation;

    const prompt = [
        {
            role: "user",
            content: `
            Input:
            1. Please generate a short title in less than 10 words for the following content. 
            ===
            ${conversation}
            ===
            Please note that the language you are using must consider the context of the content. 
            Output:`,
        },
    ];

    const requestData = {
        apiKey: apiKey,
        apiUrl: apiUrl,
        prompt,
        params: {
            temperature: 0.3,
            top_p: defaultParams.top_p,
            frequency_penalty: defaultParams.frequency_penalty,
            presence_penalty: defaultParams.presence_penalty,
            max_tokens: 30,
        },
    };

    try {
        const response = await makeRequest(requestData);
        const { data } = response;
        const message = data.choices[0].message.content || "untitled";
        res.send(message);
    } catch (error) {
        handleRequestError(error, res);
    }
};

exports.generateFollowUpQuestions = async (req, res) => {
    console.log("generateFollowUpQuestions", req.body);
    const prompt = JSON.parse(req.body.prompt);

    const requestData = {
        apiKey: apiKey,
        apiUrl: apiUrl,
        prompt,
        params: {
            temperature: 0.8,
            max_tokens: 1000,
            presence_penalty: 0.0,
            frequency_penalty: 0.0,
            response_format: { "type": "json_object" }
        },
    };

    try {
        const response = await makeRequest(requestData);
        const { data } = response;
        const message = data.choices[0].message.content || "untitled";
        res.send(message);
    } catch (error) {
        handleRequestError(error, res);
    }
};


