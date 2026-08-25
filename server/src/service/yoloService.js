import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

// Ensure Node.js environment is correctly detected by transformers.js
if (typeof globalThis !== "undefined" && globalThis.self) {
  delete globalThis.self;
}

const YOLO_SERVICE_URL = process.env.YOLO_SERVICE_URL || "http://127.0.0.1:8000";

// COCO Pet Classes Definition
export const COCO_PET_CLASSES = {
  15: { name: "cat", labelEn: "Cat", species: "Cat" },
  16: { name: "dog", labelEn: "Dog", species: "Dog" },
};

// Singleton pipeline for real embedded Deep Learning COCO Object Detection in Node.js
let embeddedDetector = null;
let RawImageClass = null;

const getEmbeddedDetector = async () => {
  if (!embeddedDetector) {
    const { pipeline, RawImage } = await import("@xenova/transformers");
    RawImageClass = RawImage;
    embeddedDetector = await pipeline("object-detection", "Xenova/detr-resnet-50");
  }
  return { detector: embeddedDetector, RawImage: RawImageClass };
};

/**
 * Run real embedded Neural Network Deep Learning on image in Node.js
 */
const runEmbeddedInference = async (imageInput, startTime) => {
  const { detector, RawImage } = await getEmbeddedDetector();

  let inputBuffer = null;
  if (Buffer.isBuffer(imageInput)) {
    inputBuffer = imageInput;
  } else if (typeof imageInput === "string") {
    if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
      const resp = await axios.get(imageInput, { responseType: "arraybuffer", timeout: 10000 });
      inputBuffer = Buffer.from(resp.data);
    } else {
      const base64Clean = imageInput.replace(/^data:image\/\w+;base64,/, "");
      inputBuffer = Buffer.from(base64Clean, "base64");
    }
  } else {
    throw new Error("Invalid image data format.");
  }

  const sharpMod = await import("sharp");
  const sharp = sharpMod.default || sharpMod;
  const { data, info } = await sharp(inputBuffer).rotate().raw().toBuffer({ resolveWithObject: true });
  const rawImage = new RawImage(new Uint8ClampedArray(data), info.width, info.height, info.channels);

  const imgWidth = info.width || 500;
  const imgHeight = info.height || 500;

  const inferenceStart = Date.now();
  const rawResults = await detector(rawImage, { threshold: 0.25 });
  const inferenceTimeMs = Date.now() - inferenceStart;

  // Filter for real cat and dog detections (COCO classes)
  const petDetections = [];
  for (const item of rawResults) {
    const label = item.label?.toLowerCase();
    const isCat = label === "cat";
    const isDog = label === "dog";

    if (isCat || isDog) {
      const classId = isCat ? 15 : 16;
      const species = isCat ? "Cat" : "Dog";
      const conf = Math.round(item.score * 1000) / 1000;
      const confScore = `${(item.score * 100).toFixed(1)}%`;

      const box = item.box || {};
      const x1_px = Math.max(0, box.xmin || 0);
      const y1_px = Math.max(0, box.ymin || 0);
      const x2_px = Math.min(imgWidth, box.xmax || imgWidth);
      const y2_px = Math.min(imgHeight, box.ymax || imgHeight);

      const x1_pct = Math.max(0, Math.min(100, Math.round((x1_px / imgWidth) * 1000) / 10));
      const y1_pct = Math.max(0, Math.min(100, Math.round((y1_px / imgHeight) * 1000) / 10));
      const x2_pct = Math.max(0, Math.min(100, Math.round((x2_px / imgWidth) * 1000) / 10));
      const y2_pct = Math.max(0, Math.min(100, Math.round((y2_px / imgHeight) * 1000) / 10));
      const w_pct = Math.max(5, Math.round((x2_pct - x1_pct) * 10) / 10);
      const h_pct = Math.max(5, Math.round((y2_pct - y1_pct) * 10) / 10);
      const area_pct = Math.round(((w_pct * h_pct) / 100) * 10) / 10;

      petDetections.push({
        classId,
        className: label,
        species,
        confidence: conf,
        confidenceScore: confScore,
        bbox: {
          x1: x1_pct,
          y1: y1_pct,
          x2: x2_pct,
          y2: y2_pct,
          width: w_pct,
          height: h_pct,
          area_percent: area_pct,
        },
        bbox_pixels: {
          x1: x1_px,
          y1: y1_px,
          x2: x2_px,
          y2: y2_px,
        },
      });
    }
  }

  if (petDetections.length === 0) {
    return {
      success: true,
      detected: false,
      message: "No pet (dog or cat) detected in the image. Please upload a clearer photo of your pet!",
      inferenceTimeMs,
    };
  }

  // Pick the pet detection with the highest confidence
  petDetections.sort((a, b) => b.confidence - a.confidence);
  const best = petDetections[0];

  const appearance = `[Deep Learning Real Inference] Detected '${best.className}' (${best.species}) with ${best.confidenceScore} real confidence. BBox: [${best.bbox.x1}%, ${best.bbox.y1}%] to [${best.bbox.x2}%, ${best.bbox.y2}%], covering ${best.bbox.area_percent}% of image area. 🐾`;

  return {
    success: true,
    detected: true,
    model: "DeepLearning-COCO-RealInference",
    classId: best.classId,
    className: best.className,
    species: best.species,
    confidence: best.confidence,
    confidenceScore: best.confidenceScore,
    yoloBbox: best.bbox,
    inferenceTimeMs,
    appearance,
    rawDetections: petDetections,
    totalProcessingTime: `${Date.now() - startTime}ms`,
  };
};

/**
 * Perform real Deep Learning Pet Detection on an uploaded image or image URL.
 * Automatically tries Python FastAPI YOLOv8 service first; if offline, runs embedded Deep Learning engine seamlessly.
 * 
 * @param {Buffer|string} imageInput - Buffer or Image URL or Base64 string
 * @param {string} filename - Optional original filename
 * @returns {Promise<Object>} Real detection result
 */
export const detectPetWithYOLO = async (imageInput, filename = "pet.jpg") => {
  const startTime = Date.now();

  // 1. Try calling the Python FastAPI YOLOv8 Microservice
  try {
    let response;

    if (Buffer.isBuffer(imageInput)) {
      const formData = new FormData();
      formData.append("file", imageInput, { filename: filename || "pet.jpg" });

      response = await axios.post(`${YOLO_SERVICE_URL}/detect`, formData, {
        headers: { ...formData.getHeaders() },
        timeout: 3000,
      });
    } else if (typeof imageInput === "string") {
      const formData = new FormData();
      if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
        formData.append("image_url", imageInput);
      } else {
        const base64Clean = imageInput.replace(/^data:image\/\w+;base64,/, "");
        formData.append("image_base64", base64Clean);
      }

      response = await axios.post(`${YOLO_SERVICE_URL}/detect`, formData, {
        headers: { ...formData.getHeaders() },
        timeout: 3000,
      });
    }

    if (response?.data) {
      const data = response.data;
      if (!data.detected) {
        return {
          success: false,
          detected: false,
          message: data.message || "No pet (dog or cat) detected in the image.",
          inferenceTimeMs: data.inference_time_ms || (Date.now() - startTime),
        };
      }

      const bbox = data.bbox || {};
      const speciesName = data.species === "Mèo" ? "Cat" : data.species === "Chó" ? "Dog" : data.species;
      const appearance = `[YOLOv8 Real Inference] Detected '${data.class_name}' (${speciesName}) with ${data.confidence_score} real confidence. BBox: [${bbox.x1}%, ${bbox.y1}%] to [${bbox.x2}%, ${bbox.y2}%]. 🐾`;

      return {
        success: true,
        detected: true,
        model: "YOLOv8n-COCO-FastAPI",
        classId: data.class_id,
        className: data.class_name,
        species: speciesName,
        confidence: data.confidence,
        confidenceScore: data.confidence_score,
        yoloBbox: bbox,
        inferenceTimeMs: data.inference_time_ms,
        appearance,
        totalProcessingTime: `${Date.now() - startTime}ms`,
      };
    }
  } catch (fastApiError) {
    // Fallback smoothly to embedded deep learning engine
  }

  // 2. Fallback to embedded real Neural Network (Transformers.js DETR / COCO) in Node.js
  try {
    return await runEmbeddedInference(imageInput, startTime);
  } catch (embeddedError) {
    console.error("Deep Learning Detection Error:", embeddedError);
    return {
      success: false,
      detected: false,
      message: "Deep Learning pet detection error: " + embeddedError.message,
      inferenceTimeMs: Date.now() - startTime,
    };
  }
};
