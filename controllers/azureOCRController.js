const axios = require('axios');
const fs=require('fs');
// const { config } = require('dotenv');

// // 加载环境变量
// config();

// 根据环境变量判断是否处于开发模式
const devMode = process.env.DEV_MODE ? eval(process.env.DEV_MODE) : false;
let subscriptionKey;

if (devMode) {
  // Use the development key if in development mode
  subscriptionKey = process.env.AZURE_OCR_API_KEY_DEV;
} else {
  // Use the production key if not in development mode
  subscriptionKey = process.env.AZURE_OCR_API_KEY;
}

const endpoint = process.env.AZURE_OCR_ENDPOINT;
const ocrUrl = `${endpoint}/vision/v3.2/ocr`;

// 定义读取图片并返回结果的异步函数
exports.readTextFromImage = async function(imageBuffer) {
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('请求超时'));
    }, 30000); // 5秒超时
  });

  const ocrRequest = axios.post(ocrUrl, imageBuffer, {
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/octet-stream',
      
      
    },
    data:imageBuffer  });

  try {
    const response = await Promise.race([ocrRequest, timeoutPromise]);
    return response.data;
  } catch (error) {
    if (error.message === '请求超时') {
      console.error('OCR请求超时');
    } else {
      console.error('使用Azure OCR处理图像时出错', error.message);
    }
    throw error; // 如果需要，可以重新抛出错误
  }
};
