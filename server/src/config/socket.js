import { Server } from "socket.io";

let ioInstance = null;

/**
 * Initialize Socket.IO with HTTP Server
 */
export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("⚡ [Socket.IO] New client connected:", socket.id);

    // Client joins a date-specific room to listen for slot availability
    socket.on("join_date_room", (date) => {
      if (date) {
        socket.join(`date_${date}`);
        console.log(`📡 [Socket.IO] Socket ${socket.id} joined date room: date_${date}`);
      }
    });

    socket.on("leave_date_room", (date) => {
      if (date) {
        socket.leave(`date_${date}`);
      }
    });

    // Manager dashboard room
    socket.on("join_manager", () => {
      socket.join("manager_room");
      console.log(`🛡️ [Socket.IO] Socket ${socket.id} joined manager room`);
    });

    socket.on("disconnect", () => {
      console.log("🔌 [Socket.IO] Client disconnected:", socket.id);
    });
  });

  return ioInstance;
};

/**
 * Get Socket.IO Singleton Instance
 */
export const getIO = () => {
  return ioInstance;
};

/**
 * Broadcast when an appointment is newly created
 */
export const emitAppointmentCreated = (appointment) => {
  if (!ioInstance) return;

  const eventData = {
    type: "created",
    appointment,
    date: appointment.appointmentDate,
    slot: appointment.appointmentTime,
    timestamp: new Date().toISOString(),
  };

  // Broadcast to all clients (for slot locking & live chatbox updates)
  ioInstance.emit("appointment_created", eventData);
  ioInstance.emit("slot_updated", {
    date: appointment.appointmentDate,
    slot: appointment.appointmentTime,
    action: "booked",
  });

  console.log(`📢 [Socket.IO] Emitted appointment_created for date ${appointment.appointmentDate}, slot ${appointment.appointmentTime}`);
};

/**
 * Broadcast when appointment status is updated (e.g., completed or confirmed)
 */
export const emitAppointmentStatusUpdated = (appointment) => {
  if (!ioInstance) return;

  const eventData = {
    type: "status_updated",
    appointment,
    date: appointment.appointmentDate,
    slot: appointment.appointmentTime,
    status: appointment.status,
    timestamp: new Date().toISOString(),
  };

  ioInstance.emit("appointment_status_updated", eventData);
  ioInstance.emit("slot_updated", {
    date: appointment.appointmentDate,
    slot: appointment.appointmentTime,
    action: appointment.status === "cancelled" ? "freed" : "updated",
  });

  console.log(`📢 [Socket.IO] Emitted appointment_status_updated for ID #${appointment.id} -> ${appointment.status}`);
};

/**
 * Broadcast when an appointment is cancelled
 */
export const emitAppointmentCancelled = (appointment) => {
  if (!ioInstance) return;

  const eventData = {
    type: "cancelled",
    appointment,
    date: appointment?.appointmentDate,
    slot: appointment?.appointmentTime,
    timestamp: new Date().toISOString(),
  };

  ioInstance.emit("appointment_cancelled", eventData);
  if (appointment?.appointmentDate && appointment?.appointmentTime) {
    ioInstance.emit("slot_updated", {
      date: appointment.appointmentDate,
      slot: appointment.appointmentTime,
      action: "freed",
    });
  }

  console.log(`📢 [Socket.IO] Emitted appointment_cancelled for ID #${appointment?.id}`);
};
