import db from "../models/index.js";
import { Op } from "sequelize";

const FIXED_SLOTS = ["9AM-11AM", "1PM-3PM", "3PM-5PM", "5PM-7PM"];
const MAX_PER_SLOT = 1; // Only 1 appointment per slot

// Ensure Table exists if not migrated
const ensureTable = async () => {
  try {
    if (db.Appointment) {
      await db.Appointment.sync();
    }
  } catch (e) {
    console.error("Error syncing Appointment table:", e);
  }
};
ensureTable();

// 1. Create Appointment
export const createAppointmentService = async (appointmentData, userId = null) => {
  try {
    const {
      customerName,
      phoneNumber,
      email,
      petName,
      petType,
      petBreed,
      petWeight,
      petImage,
      serviceType,
      estimatedPrice,
      appointmentDate,
      appointmentTime,
      symptoms,
      notes,
    } = appointmentData;

    if (!customerName || !phoneNumber || !petType || !serviceType || !appointmentDate || !appointmentTime) {
      return {
        errCode: 1,
        errMessage: "Please provide all required fields: Full Name, Phone Number, Pet Species, Service, Date, and Time Slot!",
      };
    }

    if (!FIXED_SLOTS.includes(appointmentTime)) {
      return {
        errCode: 2,
        errMessage: `Invalid time slot! Please choose 1 of the 4 available slots: ${FIXED_SLOTS.join(", ")}`,
      };
    }

    // Check existing count for this slot on this date
    const existingCount = await db.Appointment.count({
      where: {
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        status: { [Op.ne]: "cancelled" },
      },
    });

    if (existingCount >= MAX_PER_SLOT) {
      return {
        errCode: 3,
        errMessage: `Time slot ${appointmentTime} on ${appointmentDate} is already booked! Please select another time slot.`,
      };
    }

    const newAppointment = await db.Appointment.create({
      userId: userId || null,
      customerName,
      phoneNumber,
      email: email || null,
      petName: petName || "Pet",
      petType: petType || "Dog",
      petBreed: petBreed || null,
      petWeight: petWeight || null,
      petImage: petImage || null,
      serviceType,
      estimatedPrice: parseInt(estimatedPrice) || 0,
      appointmentDate,
      appointmentTime,
      symptoms: symptoms || null,
      notes: notes || null,
      status: "confirmed", // Automatically confirm AI bookings
    });

    return {
      errCode: 0,
      errMessage: "Appointment booked successfully!",
      data: newAppointment,
    };
  } catch (error) {
    console.error("createAppointmentService error:", error);
    return {
      errCode: -1,
      errMessage: "System error while creating appointment: " + error.message,
    };
  }
};

// 2. Get Available Slots for a Date
export const getAvailableSlotsService = async (date) => {
  try {
    if (!date) {
      return {
        errCode: 1,
        errMessage: "Invalid date!",
      };
    }

    const appointments = await db.Appointment.findAll({
      where: {
        appointmentDate: date,
        status: { [Op.ne]: "cancelled" },
      },
      attributes: ["id", "serviceType", "petName", "petType", "appointmentTime", "customerName", "status"],
    });

    const slots = FIXED_SLOTS.map((slot) => {
      const bookedList = appointments.filter((app) => app.appointmentTime === slot);
      const bookedCount = bookedList.length;
      return {
        slot,
        isAvailable: bookedCount < MAX_PER_SLOT,
        bookedCount,
        maxCapacity: MAX_PER_SLOT,
        remaining: Math.max(0, MAX_PER_SLOT - bookedCount),
        bookings: bookedList,
      };
    });

    return {
      errCode: 0,
      date,
      slots,
    };
  } catch (error) {
    console.error("getAvailableSlotsService error:", error);
    return {
      errCode: -1,
      errMessage: "System error while fetching available slots: " + error.message,
    };
  }
};

// 3. Get User Appointments (Customer View)
export const getUserAppointmentsService = async (userId, phoneNumber) => {
  try {
    const whereCondition = {};
    if (userId) {
      whereCondition[Op.or] = [{ userId: userId }];
      if (phoneNumber) {
        whereCondition[Op.or].push({ phoneNumber: phoneNumber });
      }
    } else if (phoneNumber) {
      whereCondition.phoneNumber = phoneNumber;
    } else {
      return {
        errCode: 0,
        errMessage: "No user information provided",
        data: [],
      };
    }

    const appointments = await db.Appointment.findAll({
      where: whereCondition,
      order: [["appointmentDate", "DESC"], ["createdAt", "DESC"]],
    });

    return {
      errCode: 0,
      data: appointments,
    };
  } catch (error) {
    console.error("getUserAppointmentsService error:", error);
    return {
      errCode: -1,
      errMessage: "System error while fetching appointment history: " + error.message,
      data: [],
    };
  }
};

// 4. Get Schedule for Manager (organized by date and 4 slots)
export const getScheduleForManagerService = async (date, statusFilter = "") => {
  try {
    const queryDate = date || new Date().toISOString().split("T")[0];

    const whereCondition = {
      appointmentDate: queryDate,
    };

    if (statusFilter && statusFilter !== "all") {
      whereCondition.status = statusFilter;
    }

    const appointments = await db.Appointment.findAll({
      where: whereCondition,
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "userName", "phoneNumber"],
          required: false,
        },
      ],
    });

    // Group into 4 fixed slots
    const scheduleBySlots = {};
    FIXED_SLOTS.forEach((slot) => {
      scheduleBySlots[slot] = appointments.filter((item) => item.appointmentTime === slot);
    });

    return {
      errCode: 0,
      date: queryDate,
      schedule: scheduleBySlots,
      totalToday: appointments.length,
    };
  } catch (error) {
    console.error("getScheduleForManagerService error:", error);
    return {
      errCode: -1,
      errMessage: "System error while fetching manager schedule: " + error.message,
    };
  }
};

// 5. Get All Appointments for Manager (List/Table View)
export const getAllAppointmentsForManagerService = async (query = {}) => {
  try {
    const { status, date, search, page = 1, limit = 50 } = query;
    const whereCondition = {};

    if (status && status !== "all") {
      whereCondition.status = status;
    }

    if (date) {
      whereCondition.appointmentDate = date;
    }

    if (search) {
      whereCondition[Op.or] = [
        { customerName: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } },
        { petName: { [Op.like]: `%${search}%` } },
        { serviceType: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await db.Appointment.findAndCountAll({
      where: whereCondition,
      order: [["appointmentDate", "DESC"], ["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "userName", "phoneNumber"],
          required: false,
        },
      ],
    });

    return {
      errCode: 0,
      total: count,
      data: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    };
  } catch (error) {
    console.error("getAllAppointmentsForManagerService error:", error);
    return {
      errCode: -1,
      errMessage: "System error: " + error.message,
      data: [],
    };
  }
};

// 6. Update Appointment Status
export const updateAppointmentStatusService = async (id, status, notes = null) => {
  try {
    const appointment = await db.Appointment.findByPk(id);
    if (!appointment) {
      return {
        errCode: 1,
        errMessage: "Appointment not found!",
      };
    }

    const updateData = { status };
    if (notes !== null) {
      updateData.notes = notes;
    }

    await appointment.update(updateData);

    return {
      errCode: 0,
      errMessage: "Appointment status updated successfully!",
      data: appointment,
    };
  } catch (error) {
    console.error("updateAppointmentStatusService error:", error);
    return {
      errCode: -1,
      errMessage: "System error: " + error.message,
    };
  }
};

// 7. Delete / Cancel Appointment
export const cancelAppointmentService = async (id, userId = null, isManager = false) => {
  try {
    const appointment = await db.Appointment.findByPk(id);
    if (!appointment) {
      return {
        errCode: 1,
        errMessage: "Appointment not found!",
      };
    }

    if (!isManager && userId && appointment.userId !== userId) {
      return {
        errCode: 2,
        errMessage: "You do not have permission to cancel this appointment!",
      };
    }

    await appointment.update({ status: "cancelled" });

    return {
      errCode: 0,
      errMessage: "Appointment cancelled successfully!",
    };
  } catch (error) {
    console.error("cancelAppointmentService error:", error);
    return {
      errCode: -1,
      errMessage: "System error: " + error.message,
    };
  }
};
