import { GoogleGenAI, Modality } from "@google/genai";
import { GeneratedViews, ViewAngle } from "../types";

const cleanBase64 = (base64Data: string): string => {
  return base64Data.split(',')[1] || base64Data;
};

const generateSingleAngle = async (
  ai: GoogleGenAI,
  personBase64: string,
  personMimeType: string,
  productBase64: string,
  productMimeType: string,
  customPrompt: string,
  angle: ViewAngle,
  angleDescription: string
): Promise<string> => {
  const promptText = `
    You are an expert AI fashion photographer and image compositor.
    
    Input Images:
    1. Subject Image: A person.
    2. Product Image: An item (clothing, accessory, or object).

    Task: Generate a photorealistic image of the Subject wearing or using the Product.

    CRITICAL REQUIREMENT - IDENTITY PRESERVATION:
    - The person in the generated image MUST look exactly like the Subject in the uploaded image.
    - Retain the Subject's facial features, hairstyle, body shape, and skin tone accurately.
    - This is a virtual try-on task; identity consistency is the #1 priority.

    VIEWPOINT SPECIFICATION:
    - Generate this image from the following angle: ${angleDescription}
    
    INTEGRATION DETAILS:
    - If the Product is clothing, fit it naturally onto the Subject's body.
    - If the Product is an object, have the Subject hold or interact with it naturally.
    - Ensure lighting and shadows are consistent.
    - Background: Clean, neutral, professional studio setting or contextually appropriate simple background.

    User Custom Instructions: ${customPrompt || "Natural and realistic style."}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: personMimeType,
            data: cleanBase64(personBase64),
          },
        },
        {
          inlineData: {
            mimeType: productMimeType,
            data: cleanBase64(productBase64),
          },
        },
        {
          text: promptText,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error(`未能生成 ${angle} 视角的图片`);
  }

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error(`视角 ${angle} 的响应中未找到图像数据`);
};

export const generateTryOnViews = async (
  personBase64: string,
  personMimeType: string,
  productBase64: string,
  productMimeType: string,
  customPrompt: string
): Promise<GeneratedViews> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Define the angles and their descriptions
    const tasks: { angle: ViewAngle; desc: string }[] = [
      { angle: 'front', desc: "Front View: The Subject is facing the camera directly. Full clear view of the face and product." },
      { angle: 'left', desc: "Left Side Profile: The Subject is turned to their right (showing their left side profile)." },
      { angle: 'right', desc: "Right Side Profile: The Subject is turned to their left (showing their right side profile)." },
      { angle: 'back', desc: "Back View: The Subject is facing away from the camera. Show the back of the product/clothing." },
    ];

    // Execute all 4 requests in parallel
    const results = await Promise.all(
      tasks.map(async (task) => {
        const imageUrl = await generateSingleAngle(
          ai,
          personBase64,
          personMimeType,
          productBase64,
          productMimeType,
          customPrompt,
          task.angle,
          task.desc
        );
        return { angle: task.angle, url: imageUrl };
      })
    );

    // Construct the result object
    const views: GeneratedViews = {
      front: '',
      left: '',
      right: '',
      back: '',
    };

    results.forEach((res) => {
      views[res.angle] = res.url;
    });

    return views;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};