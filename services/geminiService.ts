
import { GoogleGenAI, Type } from "@google/genai";
import type { BillItem } from '../types';

declare global {
    interface Window {
        pdfjsLib: any;
    }
}

// Utility to convert a File object to a Base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            // result is "data:mime/type;base64,..." - we only want the part after the comma
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error("Failed to read file as Base64 string."));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


// Utility to convert PDF file to a Base64 encoded image
const convertPdfToImageBase64 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const typedarray = new Uint8Array(arrayBuffer);
    
    const pdf = await window.pdfjsLib.getDocument({ data: typedarray }).promise;
    // We only process the first page as requested
    const page = await pdf.getPage(1);
    
    const viewport = page.getViewport({ scale: 1.5 }); // Use a good scale for clarity
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
        throw new Error("Could not create canvas context");
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for smaller size
    return dataUrl.split(',')[1];
};


export const generateBillOfMaterials = async (
  planFile: File,
  knowledgeFiles: File[],
  logCallback: (message: string) => void
): Promise<BillItem[]> => {
  logCallback("Initializing AI service...");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  logCallback(`Processing PDF plan: ${planFile.name}...`);
  const planImageBase64 = await convertPdfToImageBase64(planFile);
  logCallback("PDF converted to image for analysis.");

  const planImagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: planImageBase64,
    },
  };

  const knowledgeParts = [];
  for (const file of knowledgeFiles) {
    logCallback(`Processing knowledge file: ${file.name}...`);
    const base64Data = await fileToBase64(file);
    knowledgeParts.push({
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    });
  }
  logCallback("All knowledge files processed.");


  const prompt = `You are an expert HVAC engineer specializing in creating a bill of materials (Catálogo de Conceptos) from 2D plans. Your task is to analyze the provided plan and generate a detailed list of materials required for the air conditioning installation.

  Instructions:
  1.  Analyze the main plan image provided.
  2.  Identify all evaporator (indoor units, often marked as 'EVAP' or similar) and condenser (outdoor units, marked as 'COND' or similar) units.
  3.  For each evaporator-condenser pair, trace the path of the refrigerant piping.
  4.  Estimate the length of the piping in meters. Assume a standard architectural scale if none is provided.
  5.  Refer to the additional 'knowledge base' documents provided. These are examples of past projects and their required materials. Use them to understand the typical components needed for different types of installations (e.g., copper tubing sizes, insulation, wiring, mounting brackets, drain pipes).
  6.  Based on the identified units, piping distances, and using the knowledge base as a reference, create a comprehensive bill of materials ('Catálogo de Conceptos').
  7.  The output must be a JSON array of objects. Do not include any text, markdown, or explanations before or after the JSON array. Each object must adhere to the provided schema.
  8.  Example items to include: Refrigerant copper tubing (specify diameter if possible), thermal insulation for tubing, electrical wiring (low and high voltage), PVC drain pipe, mounting brackets for condenser, wall sleeves, etc.
  9.  Generate a consecutive code for each item starting from '001'.
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        codigo: {
          type: Type.STRING,
          description: 'A consecutive numeric code for the concept, e.g., "001", "002".',
        },
        descripcion: {
          type: Type.STRING,
          description: 'Detailed description of the concept or material.',
        },
        unidad: {
          type: Type.STRING,
          description: 'The unit of measurement for the concept (e.g., "m", "pza", "kg", "lote").',
        },
        cantidad: {
          type: Type.NUMBER,
          description: 'The quantity of the material required.',
        },
      },
      required: ["codigo", "descripcion", "unidad", "cantidad"],
    },
  };

  logCallback("Sending data to Gemini Pro for analysis...");
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [
      { parts: [{ text: prompt }] },
      { parts: [planImagePart] },
      ...knowledgeParts.map(part => ({ parts: [part] }))
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
  
  logCallback("AI analysis complete. Parsing results...");
  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    logCallback("Successfully parsed results.");
    return result;
  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("The AI returned an invalid response format. Please check the console for details.");
  }
};
