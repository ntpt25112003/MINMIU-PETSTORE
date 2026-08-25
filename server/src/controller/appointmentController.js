import {
  consultServiceWithAI,
  analyzePetImage,
  calculatePrice,
} from "../service/aiChatService.js";
import {
  createAppointmentService,
  getAvailableSlotsService,
  getUserAppointmentsService,
  getScheduleForManagerService,
  getAllAppointmentsForManagerService,
  updateAppointmentStatusService,
  cancelAppointmentService,
} from "../service/appointmentService.js";
import {
  emitAppointmentCreated,
  emitAppointmentStatusUpdated,
  emitAppointmentCancelled,
} from "../config/socket.js";
import db from "../models/index.js";

// AI: Service Consultation based on user message
export const consultServiceController = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Please enter a message!",
      });
    }

    const result = await consultServiceWithAI(message);
    return res.status(200).json({
      errCode: 0,
      data: result,
    });
  } catch (error) {
    console.error("consultServiceController error:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Server error during service consultation",
    });
  }
};

import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const uploadPetImageToCloudinary = (fileBuffer, folder = "MINMIU-PETSTORE/pets") => {
  return new Promise((resolve) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return resolve(null);
    }
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) {
          console.warn("Cloudinary upload warning:", error.message);
          return resolve(null);
        }
        resolve(result?.secure_url || null);
      }
    );
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

// AI: Pet image analysis with real YOLOv8 / Deep Learning
export const analyzePetImageController = async (req, res) => {
  try {
    const { serviceType, imageBase64, petHint } = req.body;
    let fileBuffer = null;
    let mimeType = "image/jpeg";
    let petImageUrl = null;

    if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype || "image/jpeg";
      petImageUrl = await uploadPetImageToCloudinary(fileBuffer);
    } else if (imageBase64) {
      fileBuffer = imageBase64;
    }

    const filename = req.file?.originalname || "pet.jpg";
    const imageInput = petImageUrl || fileBuffer;
    const analysis = await analyzePetImage(imageInput, mimeType, serviceType || "General Checkup", filename);

    if (!analysis.detected) {
      return res.status(200).json({
        errCode: 1,
        errMessage: analysis.message || "No pet (dog or cat) detected in the image. Please upload a clearer photo!",
        data: analysis,
      });
    }

    if (petImageUrl) {
      analysis.petImageUrl = petImageUrl;
    }

    return res.status(200).json({
      errCode: 0,
      errMessage: "YOLOv8 Detection Successful!",
      data: analysis,
    });
  } catch (error) {
    console.error("analyzePetImageController error:", error.message);
    return res.status(500).json({
      errCode: -1,
      errMessage: error.message || "Server error during YOLOv8 pet image detection.",
    });
  }
};

// Calculate service price manually
export const calculatePriceController = async (req, res) => {
  try {
    const { serviceType, species, weight, subType } = req.body;
    const result = calculatePrice(serviceType, species, weight, subType);
    return res.status(200).json({
      errCode: 0,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error calculating price",
    });
  }
};

// Get available slots for a date
export const getAvailableSlotsController = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date || new Date().toISOString().split("T")[0];
    const result = await getAvailableSlotsService(queryDate);
    return res.status(200).json(result);
  } catch (error) {
    console.error("getAvailableSlotsController error:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error fetching available slots",
    });
  }
};

// Create a new appointment
export const createAppointmentController = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const result = await createAppointmentService(req.body, userId);
    
    // Broadcast real-time event to lock slot and update manager view immediately
    if (result && result.errCode === 0 && result.data) {
      emitAppointmentCreated(result.data);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("createAppointmentController error:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error creating appointment",
    });
  }
};

// Customer: Get appointment history
export const getUserAppointmentsController = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const phoneNumber = req.query.phoneNumber || (req.user ? req.user.phoneNumber : null);

    const result = await getUserAppointmentsService(userId, phoneNumber);
    return res.status(200).json(result);
  } catch (error) {
    console.error("getUserAppointmentsController error:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error fetching appointment history",
    });
  }
};

// Manager: View appointments schedule grouped by 4 slots
export const getManagerScheduleController = async (req, res) => {
  try {
    const { date, status } = req.query;
    const queryDate = date || new Date().toISOString().split("T")[0];
    const result = await getScheduleForManagerService(queryDate, status);
    return res.status(200).json(result);
  } catch (error) {
    console.error("getManagerScheduleController error:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error fetching schedule by slots",
    });
  }
};

// Manager: View all appointments table list
export const getAllAppointmentsManagerController = async (req, res) => {
  try {
    const result = await getAllAppointmentsForManagerService(req.query);
    return res.status(200).json(result);
  } catch (error) {
    console.error("getAllAppointmentsManagerController error:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error fetching appointments list",
    });
  }
};

// Manager: Update appointment status
export const updateAppointmentStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const result = await updateAppointmentStatusService(id, status, notes);

    // Broadcast real-time status update
    if (result && result.errCode === 0 && result.data) {
      emitAppointmentStatusUpdated(result.data);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("updateAppointmentStatusController error:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error updating status",
    });
  }
};

// Cancel appointment
export const cancelAppointmentController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const isManager = req.user && req.user.role === "manager";

    let appointmentBefore = null;
    try {
      if (db.Appointment) {
        appointmentBefore = await db.Appointment.findByPk(id);
      }
    } catch (e) {}

    const result = await cancelAppointmentService(id, userId, isManager);

    // Broadcast real-time cancellation to free slot and refresh views
    if (result && result.errCode === 0) {
      emitAppointmentCancelled(appointmentBefore || { id });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("cancelAppointmentController error:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error cancelling appointment",
    });
  }
};
