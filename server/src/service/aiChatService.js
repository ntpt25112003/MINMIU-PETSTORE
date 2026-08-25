import { detectPetWithYOLO } from "./yoloService.js";

// Pricing calculation based on detected species, service and body size
export const calculatePrice = (serviceType, species, weightStr = "3.5kg", subType = "") => {
  const isDog = species?.toLowerCase().includes("chó") || species?.toLowerCase().includes("dog");
  const isCat = !isDog;

  // Parse weight number
  const weightNum = parseFloat(weightStr?.replace(/[^0-9.]/g, "")) || 4.0;

  let price = 150000;
  let priceNote = "";

  const sType = serviceType?.toLowerCase() || "";

  if (sType.includes("khám") || sType.includes("checkup") || sType.includes("general")) {
    if (weightNum < 5) {
      price = 150000;
      priceNote = "Clinical exam, temperature, ear, oral & digestive check for pets (<5kg)";
    } else if (weightNum <= 10) {
      price = 200000;
      priceNote = "Comprehensive clinical examination for medium pets (5-10kg)";
    } else {
      price = 250000;
      priceNote = "Comprehensive clinical examination for large pets (>10kg)";
    }
  } else if (sType.includes("triệt sản") || sType.includes("neuter") || sType.includes("spay")) {
    if (isCat) {
      if (weightNum < 3) {
        price = 350000;
        priceNote = "Cat neutering (<3kg) including safe anesthesia package";
      } else if (weightNum <= 5) {
        price = 450000;
        priceNote = "Cat neutering (3-5kg) with postoperative care";
      } else {
        price = 550000;
        priceNote = "Cat neutering (>5kg) with postoperative care";
      }
    } else {
      // Dog
      if (weightNum < 5) {
        price = 550000;
        priceNote = "Dog neutering (<5kg) including safe anesthesia package";
      } else if (weightNum <= 10) {
        price = 750000;
        priceNote = "Dog neutering (5-10kg) with postoperative care";
      } else {
        price = 950000;
        priceNote = "Dog neutering (>10kg) with postoperative care";
      }
    }
  } else if (sType.includes("tiêm") || sType.includes("vaccin") || sType.includes("vắc xin")) {
    if (isCat) {
      price = 280000;
      priceNote = "4-in-1 core feline vaccine + Health booklet & pre-vaccination checkup";
    } else {
      price = 300000;
      priceNote = "7-in-1 core canine vaccine (Vanguard Plus) + Pre-vaccination general checkup";
    }
  } else if (sType.includes("spa") || sType.includes("tắm") || sType.includes("groom")) {
    if (weightNum < 3) {
      price = 180000;
      priceNote = "Mini Spa Package (<3kg): Nourishing bath, blow-dry, ear cleaning & nail trimming";
    } else if (weightNum <= 5) {
      price = 220000;
      priceNote = "Standard Spa Package (3-5kg): Deodorizing bath & dry, ear cleaning & shedding brush";
    } else if (weightNum <= 10) {
      price = 280000;
      priceNote = "Full Spa Package (5-10kg): Antibacterial bath, hygienic coat trimming & nail clipping";
    } else {
      price = 380000;
      priceNote = "Large Pet Spa (>10kg): Massage bath, full drying & complete grooming care";
    }
  } else {
    price = 180000;
    priceNote = "MinMiu veterinary care service";
  }

  return { price, priceNote };
};

// 1. Service Consultation
export const consultServiceWithAI = async (userMessage) => {
  const msgLower = (userMessage || "").toLowerCase().trim();

  let matchedService = null;
  let reply = "";
  let advice = "";

  // =========================
  // 1. GREETING
  // =========================
  const greetingKeywords = [
    "hello",
    "hi",
    "hey",
    "chào",
    "xin chào",
    "alo",
    "hii",
    "hiii",
    "good morning",
    "good afternoon",
    "good evening"
  ];

  const isGreeting = greetingKeywords.some((keyword) => msgLower.includes(keyword));

  if (isGreeting) {
    return {
      reply:
        "Hello! 🐾 I am MinMiu AI Vet. I am here to help consult on your pet's health condition or assist you in booking any of MinMiu's 4 veterinary services!",
      recommendedService: null,
      advice: null,
    };
  }

  // =========================
  // 2. SERVICE DETECTION
  // =========================

  if (
    msgLower.includes("triệt sản") ||
    msgLower.includes("thiến") ||
    msgLower.includes("động đực") ||
    msgLower.includes("neuter") ||
    msgLower.includes("spay") ||
    msgLower.includes("castrat")
  ) {
    matchedService = "Neutering";
  } else if (
    msgLower.includes("tiêm") ||
    msgLower.includes("vaccine") ||
    msgLower.includes("vắc xin") ||
    msgLower.includes("ngừa dại") ||
    msgLower.includes("chích ngừa") ||
    msgLower.includes("shot") ||
    msgLower.includes("immuniz") ||
    msgLower.includes("rabies")
  ) {
    matchedService = "Vaccination";
  } else if (
    msgLower.includes("spa") ||
    msgLower.includes("tắm") ||
    msgLower.includes("cắt tỉa") ||
    msgLower.includes("cắt móng") ||
    msgLower.includes("groom") ||
    msgLower.includes("bath") ||
    msgLower.includes("haircut") ||
    msgLower.includes("wash")
  ) {
    matchedService = "Pet Spa";
  } else if (
    msgLower.includes("khám") ||
    msgLower.includes("bệnh") ||
    msgLower.includes("nôn") ||
    msgLower.includes("ói") ||
    msgLower.includes("bỏ ăn") ||
    msgLower.includes("biếng ăn") ||
    msgLower.includes("tiêu chảy") ||
    msgLower.includes("sốt") ||
    msgLower.includes("gãi") ||
    msgLower.includes("ngứa") ||
    msgLower.includes("rụng lông") ||
    msgLower.includes("đau") ||
    msgLower.includes("checkup") ||
    msgLower.includes("sick") ||
    msgLower.includes("vomit") ||
    msgLower.includes("diarrhea") ||
    msgLower.includes("fever") ||
    msgLower.includes("itch") ||
    msgLower.includes("exam") ||
    msgLower.includes("doctor")
  ) {
    matchedService = "General Checkup";
  }

  // =========================
  // 3. RESPONSE
  // =========================

  if (matchedService === "General Checkup") {
    reply =
      "I understand you are worried about your pet 🐾. Based on the symptoms described, MinMiu recommends choosing **General Checkup** so our veterinarian can perform a thorough direct clinical examination! 🩺";
    advice =
      "Please keep your pet in a calm, comfortable environment and do not administer human medications without professional advice.";
  } else if (matchedService === "Neutering") {
    reply =
      "If you are considering neutering or spaying for your pet, MinMiu provides **Neutering** with safe anesthesia protocols and comprehensive post-op care! ✂️";
    advice =
      "We recommend consulting with our vet and fasting your pet for 6-8 hours before surgery.";
  } else if (matchedService === "Vaccination") {
    reply =
      "MinMiu provides **Vaccination** services to establish a strong immune defense against common infectious diseases for dogs and cats! 💉";
    advice =
      "Ensure your pet is in good health (no fever or digestive issues) before their vaccination appointment.";
  } else if (matchedService === "Pet Spa") {
    reply =
      "If you want to pamper your pet's coat and hygiene, **Pet Spa** is the perfect choice! 🛁";
    advice =
      "MinMiu uses organic, skin-safe shampoos specifically formulated for sensitive pet coats.";
  } else {
    reply =
      "I did not quite catch that 🐾. You can describe your pet's symptoms (such as vomiting, diarrhea, loss of appetite, itching, fever...) or choose one of our 4 services below!";
    advice = null;
    matchedService = null;
  }

  return {
    reply,
    recommendedService: matchedService,
    advice,
  };
};

// 2. Real YOLOv8 Pet Image Inference
export const analyzePetImage = async (imageBufferOrBase64, mimeType = "image/jpeg", serviceType = "General Checkup", originalFilename = "pet.jpg") => {
  // Execute real YOLOv8 object detection
  const yoloResult = await detectPetWithYOLO(imageBufferOrBase64, originalFilename);

  // If no pet (neither dog nor cat) is detected
  if (!yoloResult.detected) {
    return {
      success: false,
      detected: false,
      message: yoloResult.message || "No pet (dog or cat) detected in the image. Please choose a clearer photo of your pet!",
      inferenceTimeMs: yoloResult.inferenceTimeMs || 0,
    };
  }

  const species = yoloResult.species; // 'Dog' (class 16) or 'Cat' (class 15)
  const isDog = species === "Dog" || species === "Chó";

  // Calculate estimated weight from detected bounding box area & species
  const bboxArea = yoloResult.yoloBbox?.area_percent || 50;
  let estimatedWeightNum = isDog ? 5.0 : 3.8;

  if (isDog) {
    if (bboxArea < 30) estimatedWeightNum = 3.5;
    else if (bboxArea <= 65) estimatedWeightNum = 6.0;
    else estimatedWeightNum = 12.0;
  } else {
    if (bboxArea < 35) estimatedWeightNum = 3.2;
    else if (bboxArea <= 70) estimatedWeightNum = 4.2;
    else estimatedWeightNum = 5.5;
  }

  const estimatedWeight = `${estimatedWeightNum} kg`;

  const { price, priceNote } = calculatePrice(serviceType, isDog ? "Dog" : "Cat", estimatedWeight);

  return {
    success: true,
    detected: true,
    species: isDog ? "Dog" : "Cat",
    estimatedWeight,
    appearance: yoloResult.appearance,
    estimatedPrice: price,
    priceNote,
    serviceType,
    yoloInfo: {
      model: yoloResult.model || "YOLOv8-RealInference",
      classId: yoloResult.classId,
      className: yoloResult.className,
      confidence: yoloResult.confidenceScore,
      confidenceRaw: yoloResult.confidence,
      inferenceTime: `${yoloResult.inferenceTimeMs}ms`,
      bbox: yoloResult.yoloBbox,
    },
  };
};
