// public/api.js
// purpose: client-side code to make requests to the server side api.

// Consider using Axios for more fine-grained control of the HTTP requests
import axios from "axios";
import { type } from "microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/RecognizerConfig";

axios.defaults.baseURL = "/api";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";

// get app name
export async function getAppName() {
    const response = await fetch("/api/app_name");
    return await response.text();
}

// get prompt repo by username
export async function getPromptRepo(username) {
    const response = await fetch(`/api/prompt_repo?username=${username}`);
    return await response.json();
}

// text to image
export async function textToImage(caption) {
    const response = await fetch("/api/text-to-image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ caption }),
    });

    if (!response.ok) {
        throw new Error("获取图像时出错，请稍后重试");
    }

    return await response.json();
}

//get gpt response
export async function getGpt(promptText, model) {
    const response = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, model: model }),
    });

    // Get the response data
    const data = await response.json();

    // If the response is not okay, throw an error with the status and message
    if (!response.ok) {
        let errMsg = data.error ? data.error.message : "Error generating response.";
        throw new Error(`Error ${response.status}: ${errMsg}`);
    }

    return data;
}



// get tts response
export async function getTts(message) {
    const url = "/api/tts";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
    });
    return await response.blob();
}

// get stt response
export async function getStt(audioBlob) {
    const formData = new FormData();
    formData.append("file", audioBlob);
    const response = await fetch("/api/auto-speech-to-text", {
        method: "POST",
        body: formData,
    });
    return response;
}

export async function getDefaultParams() {
    const response = await fetch("/api/gpt-default-params");
    if (!response.ok) {
        throw new Error("Error getting default params.");
    }
    return await response.json();
}

export async function generateTitle(content) {
    const response = await fetch("/api/generate-title", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ conversation: content })
    });
    return await response.text();
}



export async function getFollowUpQuestions(prompt) {
    const response = await fetch("/api/generate-followup-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
    });

    // Get the response data
    const responseText = await response.text();
    console.log(responseText);
    const data = JSON.parse(responseText);

    // If the response is not okay, throw an error with the status and message
    if (!response.ok) {
        let errMsg = data.error ? data.error.message : "Error generating follow up questions.";
        throw new Error(`Error ${response.status}: ${errMsg}`);
    }

    return data;
}

// public/utils/api.js
// Use interceptors to handle errors globally
axios.interceptors.response.use(null, error => {
    const expectedError = error.response && error.response.status >= 400 && error.response.status < 500;
    if (!expectedError) {
        console.log("Logging the error", error);
        alert("An unexpected error occurred.");
    }
    return Promise.reject(error);
});

export async function fetchCloudChatHistories(username, lastTimestamp = null) {
    const queryParams = lastTimestamp ? `?lastTimestamp=${encodeURIComponent(lastTimestamp)}` : "";
    const url = `/chatHistories/${encodeURIComponent(username)}${queryParams}`;

    const response = await axios.get(url);
    // 响应应当是聊天历史数组
    return response.data.data;
}

export async function createOrUpdateCloudChatHistory(chatHistoryData) {
    const response = await axios.post("/chatHistories", chatHistoryData);
    // The response should be the created entity
    return response.data.data;
}

export async function deleteCloudChatHistory(chatId) {
    await axios.delete(`/chatHistories/${encodeURIComponent(chatId)}`);
    // Server should be returning the just-deleted entity
    // If that's not the case, we might need to adjust the server or this method according to that.
}

export async function fetchCloudMessages(chatId, lastTimestamp = null) {
    const queryParams = lastTimestamp ? `?lastTimestamp=${encodeURIComponent(lastTimestamp)}` : "";
    const response = await axios.get(`/messages/${encodeURIComponent(chatId)}${queryParams}`);
    // The response should be an array of messages
    return response.data.data || [];
}

export async function createCloudMessage(messageData, chatId) {
    const response = await axios.post(`/messages/${encodeURIComponent(chatId)}`, messageData);
    // The response should be the created entity
    return response.data.data;
}

export async function updateCloudMessage(messageData, chatId, messageId) {
    const response = await axios.put(`/messages/${encodeURIComponent(chatId)}/${encodeURIComponent(messageId)}`, messageData);
    // The response should be the updated entity
    return response.data.data;
}

export async function deleteCloudMessage(chatId, messageId) {
    await axios.delete(`/messages/${encodeURIComponent(chatId)}/${encodeURIComponent(messageId)}`);
    // Similar to deleteCloudChatHistory, the response handling might need revision based on actual server response.
}
// 定义一个函数以发送图像到 OCR 服务并获取结果
export async function sendImageToOCR(imageData) {
    try {
      const response = await axios.post("/image-to-text", imageData, {
        headers: {
          'Content-Type': 'application/octet-stream',
          
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
// export async function sendImageToOCR(imageData) {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = async () => {
//         const base64Image = reader.result.split(',')[1]; // 转换后的base64格式图像数据
  
//         try {
//           // 使用axios发送POST请求
//           const response = await fetch('/api/image-to-text',{
//             method:"post",
//             headers:{
//                 'Content-type':"application/json"
//             },
//             body:JSON.stringify({
//                 image:base64Image
//             })
//           });
  
//           if (response.status !== 200) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }
  
//           resolve(response.data);
//         } catch (error) {
//           console.error('Error sending image to OCR', error.message);
//           reject(error);
//         }
//       };
  
//       reader.onerror = error => {
//         console.error('Error reading image file', error.message);
//         reject(error);
//       };
  
//       // 读取图像文件为 base64 格式
//       reader.readAsDataURL(imageFile);
//     });
//   }
// export async function sendImageToOCR(imageFile) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = () => {
//             const base64Image = reader.result.split(',')[1]; // 获取base64编码部分
//             fetch("api/image-to-text", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ image: base64Image }),
//             })
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error("提取文字时出错，请稍后重试");
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 resolve(data);
//             })
//             .catch(error => {
//                 reject(error);
//             });
//         };
//         reader.onerror = error => {
//             reject(error);
//         };
//         reader.readAsDataURL(imageFile);
//     });
// }

  
  
  
  // 定义一个函数以提取 OCR 结果中的文本
  export function extractTextFromOCRResult(ocrResult) {
    if (!ocrResult || !Array.isArray(ocrResult.ocr)) {
      return ''; // 返回空字符串如果结果无效或格式不正确
    }
  
    const textLines = ocrResult.ocr.map(item => item.text);
    const extractedText = textLines.join('\n');
    return extractedText;
  }