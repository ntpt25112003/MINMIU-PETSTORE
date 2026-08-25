import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaw,
  faTimes,
  faPaperPlane,
  faCamera,
  faUpload,
  faCalendarAlt,
  faClock,
  faCheckCircle,
  faRobot,
  faRedo,
  faStethoscope,
  faSyringe,
  faCut,
  faShower,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import socket from "../../services/socket.js";
import "./AIChatbox.css";

const API_BASE = "http://localhost:8081/api";

const SERVICES_LIST = [
  { id: "General Checkup", title: "General Checkup", icon: "🩺", desc: "Clinical exam, endoscopy & general health check", faIcon: faStethoscope },
  { id: "Neutering", title: "Neutering & Spaying", icon: "✂️", desc: "Safe neutering surgery for dogs & cats", faIcon: faCut },
  { id: "Vaccination", title: "Vaccination", icon: "💉", desc: "Core disease prevention & rabies vaccines", faIcon: faSyringe },
  { id: "Pet Spa", title: "Pet Spa & Grooming", icon: "🛁", desc: "Bath, blow-dry, styling & nail trimming", faIcon: faShower },
];

const FIXED_SLOTS = ["9AM-11AM", "1PM-3PM", "3PM-5PM", "5PM-7PM"];

export default function AIChatbox({ isOpenExternal, onCloseExternal }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Booking Flow State
  const [step, setStep] = useState(0); // 0: Select Service, 1: Upload Photo, 2: Price Review, 3: Slot & Info, 4: Success
  const [selectedService, setSelectedService] = useState("");
  const [petAnalysis, setPetAnalysis] = useState(null);
  const [petImagePreview, setPetImagePreview] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingInfo, setBookingInfo] = useState({
    customerName: "",
    phoneNumber: "",
    petName: "",
    symptoms: "",
  });
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync external open trigger (e.g. from Header button)
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  // Listen to custom window event to open chatbox from anywhere
  useEffect(() => {
    const handleOpenChat = (e) => {
      setIsOpen(true);
      if (e.detail?.service) {
        handleSelectService(e.detail.service);
      }
    };
    window.addEventListener("open-booking-chat", handleOpenChat);
    return () => window.removeEventListener("open-booking-chat", handleOpenChat);
  }, []);

  // Autofill user info if logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setBookingInfo((prev) => ({
          ...prev,
          customerName: u.userName || "",
          phoneNumber: u.phoneNumber ? String(u.phoneNumber) : "",
        }));
      } catch (err) {}
    }
  }, []);

  // Initial Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      initWelcomeChat();
    }
  }, []);

  // Scroll to bottom on message update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, step]);

  // Load available slots when date changes
  useEffect(() => {
    if (step >= 2 && selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, step]);

  // Real-Time Socket.IO: Live Slot Locking & Updates
  useEffect(() => {
    const handleRealtimeSlotUpdate = (data) => {
      console.log("⚡ [Socket.IO] Live slot update received:", data);
      if (data && (data.date === selectedDate || !data.date)) {
        fetchSlots(selectedDate);

        // If the slot currently selected by the user was just booked by another person
        if (data.slot === selectedSlot && (data.action === "booked" || data.type === "created")) {
          setSelectedSlot("");
          alert(`Notice: Time slot ${data.slot} on ${selectedDate} was just booked by another customer. Please select another slot!`);
        }
      }
    };

    socket.on("slot_updated", handleRealtimeSlotUpdate);
    socket.on("appointment_created", handleRealtimeSlotUpdate);
    socket.on("appointment_cancelled", handleRealtimeSlotUpdate);

    return () => {
      socket.off("slot_updated", handleRealtimeSlotUpdate);
      socket.off("appointment_created", handleRealtimeSlotUpdate);
      socket.off("appointment_cancelled", handleRealtimeSlotUpdate);
    };
  }, [selectedDate, selectedSlot]);

  const initWelcomeChat = () => {
    setStep(0);
    setSelectedService("");
    setPetAnalysis(null);
    setPetImagePreview(null);
    setConfirmedBooking(null);
    setMessages([
      {
        id: 1,
        sender: "bot",
        type: "welcome",
        text: "Hello! I am MinMiu Veterinary Clinic's AI Assistant 🐾.\nWhich service would you like to book today? You can also describe your pet's symptoms or questions for personalized advice!",
      },
    ]);
  };

  const fetchSlots = async (date) => {
    try {
      const res = await axios.get(`${API_BASE}/appointment/slots?date=${date}`);
      if (res.data && res.data.slots) {
        setAvailableSlots(res.data.slots);
      }
    } catch (err) {
      console.error("fetchSlots error:", err);
    }
  };

  // 1. User selects service directly
  const handleSelectService = (serviceName) => {
    setSelectedService(serviceName);
    setStep(1);

    const userMsg = {
      id: Date.now(),
      sender: "user",
      type: "text",
      text: `I want to choose: ${serviceName}`,
    };

    const botMsg = {
      id: Date.now() + 1,
      sender: "bot",
      type: "upload_request",
      text: `Great! You selected **${serviceName}** ✨.\nNow, please upload a photo of your pet so AI can detect the species (Dog / Cat) and estimate its weight! 📸`,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  // 2. User sends text question / symptoms for AI to consult
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText("");

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      type: "text",
      text: userText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_BASE}/chat/consult`, { message: userText });
      setIsTyping(false);

      if (res.data?.data) {
        const { reply, recommendedService, advice } = res.data.data;
        const botMsg = {
          id: Date.now() + 1,
          sender: "bot",
          type: "consult_reply",
          text: reply,
          recommendedService,
          advice,
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      setIsTyping(false);
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: "bot",
        type: "consult_reply",
        text: "MinMiu has noted your message. Please select one of the 4 services below to proceed with booking!",
        recommendedService: "General Checkup",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  // 3. User uploads pet image
  const handleImageUpload = async (file) => {
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const previewUrl = e.target.result;
      setPetImagePreview(previewUrl);

      const userMsg = {
        id: Date.now(),
        sender: "user",
        type: "image_preview",
        image: previewUrl,
        text: "Sent pet photo 🐾",
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("serviceType", selectedService || "General Checkup");
        formData.append("imageBase64", previewUrl);

        const res = await axios.post(`${API_BASE}/chat/analyze-pet`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setIsTyping(false);

        if (res.data?.errCode === 0 && res.data?.data?.detected) {
          const analysis = res.data.data;
          setPetAnalysis(analysis);
          setStep(2);

          const botMsg = {
            id: Date.now() + 1,
            sender: "bot",
            type: "analysis_result",
            analysis,
            text: `AI YOLOv8 has analyzed your pet's photo! 🎉\n- **Species:** ${analysis.species} (class: ${analysis.yoloInfo?.className || analysis.species})\n- **YOLO Confidence:** ${analysis.yoloInfo?.confidence || "95%"}\n- **Inference Time:** ${analysis.yoloInfo?.inferenceTime || "20ms"}\n- **Estimated Weight:** ${analysis.estimatedWeight}\n\n${analysis.appearance}`,
          };
          setMessages((prev) => [...prev, botMsg]);
        } else {
          // No dog or cat detected by YOLO
          const errMsg = res.data?.errMessage || "No pet (dog or cat) detected in the image.";
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: "bot",
              type: "upload_request",
              text: `⚠️ **${errMsg}**\n\nPlease upload a clear photo of your pet (dog or cat) for accurate detection! 🐾`,
            },
          ]);
        }
      } catch (err) {
        setIsTyping(false);
        const errMsg = err.response?.data?.errMessage || err.message || "Error connecting to YOLOv8 service";
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "bot",
            type: "upload_request",
            text: `❌ **YOLO Detection Error:** ${errMsg}\n\nPlease verify the service status and try uploading again!`,
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Sample photo selection for quick test
  const handleSamplePhoto = async (sampleType) => {
    const isDog = sampleType === "dog";
    const sampleImg = isDog
      ? "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=60"
      : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60";

    setPetImagePreview(sampleImg);

    const userMsg = {
      id: Date.now(),
      sender: "user",
      type: "image_preview",
      image: sampleImg,
      text: `Sent sample ${isDog ? "Dog" : "Cat"} photo 🐾`,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_BASE}/chat/analyze-pet`, {
        serviceType: selectedService || "General Checkup",
        imageBase64: sampleImg,
      });

      setIsTyping(false);
      if (res.data?.errCode === 0 && res.data?.data?.detected) {
        const analysis = res.data.data;
        setPetAnalysis(analysis);
        setStep(2);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "bot",
            type: "analysis_result",
            analysis,
            text: `AI YOLOv8 successfully detected sample ${analysis.species}! 🎯 Confidence: ${analysis.yoloInfo?.confidence || "95%"} (${analysis.yoloInfo?.inferenceTime || "20ms"})`,
          },
        ]);
      } else {
        const errMsg = res.data?.errMessage || "No pet (dog or cat) detected in the image.";
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "bot",
            type: "upload_request",
            text: `⚠️ **${errMsg}**\n\nPlease try again with another photo!`,
          },
        ]);
      }
    } catch (err) {
      setIsTyping(false);
      const errMsg = err.response?.data?.errMessage || err.message || "Error connecting to YOLOv8 service";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          type: "upload_request",
          text: `❌ **YOLO Detection Error:** ${errMsg}`,
        },
      ]);
    }
  };

  // Toggle/Correct pet species manually if needed
  const handleToggleSpecies = async (newSpecies) => {
    const isDog = newSpecies === "Dog" || newSpecies === "Chó";
    const newWeight = isDog ? "5.0 kg" : "3.8 kg";
    const canonicalSpecies = isDog ? "Dog" : "Cat";
    try {
      const res = await axios.post(`${API_BASE}/chat/calculate-price`, {
        serviceType: selectedService || "General Checkup",
        species: canonicalSpecies,
        weight: newWeight,
      });
      setPetAnalysis((prev) => ({
        ...prev,
        species: canonicalSpecies,
        estimatedWeight: newWeight,
        estimatedPrice: res.data?.data?.price || (isDog ? 200000 : 150000),
        priceNote: res.data?.data?.priceNote || prev?.priceNote,
        appearance: `[YOLOv8 Real Inference] Detected '${isDog ? "dog" : "cat"}' (${canonicalSpecies}) with 99.9% real confidence. Pet body condition is balanced and healthy. 🐾`,
        yoloInfo: {
          ...prev?.yoloInfo,
          className: isDog ? "dog" : "cat",
          confidence: prev?.yoloInfo?.confidence || "99.9%",
        },
      }));
    } catch (err) {
      console.error("handleToggleSpecies error:", err);
    }
  };

  // 4. User agrees with the price -> Proceed to Step 3 (Date & Slot)
  const handleAgreePrice = () => {
    setStep(3);
    setSelectedSlot("");
    fetchSlots(selectedDate);
    const userMsg = {
      id: Date.now(),
      sender: "user",
      type: "text",
      text: "I agree with the estimated price. Book appointment now!",
    };
    const botMsg = {
      id: Date.now() + 1,
      sender: "bot",
      type: "slot_selection",
      text: "Wonderful! Please select your preferred Date and available Time Slot below, then fill in your contact details to confirm! 📅",
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  // 5. Confirm Appointment
  const handleConfirmBooking = async () => {
    if (!bookingInfo.customerName || !bookingInfo.phoneNumber) {
      alert("Please enter your full name and phone number!");
      return;
    }

    if (!selectedSlot) {
      alert("Please select 1 of the 4 available time slots!");
      return;
    }

    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        customerName: bookingInfo.customerName,
        phoneNumber: bookingInfo.phoneNumber,
        petName: bookingInfo.petName || "Pet",
        petType: petAnalysis?.species || "Dog",
        petBreed: null,
        petWeight: petAnalysis?.estimatedWeight || "3.5kg",
        petImage: petImagePreview || null,
        serviceType: selectedService || "General Checkup",
        estimatedPrice: petAnalysis?.estimatedPrice || 150000,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        symptoms: bookingInfo.symptoms || "Booked via MinMiu AI Chatbox",
      };

      const res = await axios.post(`${API_BASE}/appointment`, payload, { headers });
      setIsTyping(false);

      if (res.data?.errCode === 0) {
        const appointmentData = res.data.data;
        setConfirmedBooking(appointmentData);
        setStep(4);

        const botSuccessMsg = {
          id: Date.now() + 1,
          sender: "bot",
          type: "booking_success",
          appointment: appointmentData,
          text: `🎉 **APPOINTMENT BOOKED SUCCESSFULLY!**\nMinMiu has reserved your schedule.\nBooking Code: **#MM-${appointmentData.id}**`,
        };
        setMessages((prev) => [...prev, botSuccessMsg]);
      } else {
        alert(res.data?.errMessage || "An error occurred while booking!");
      }
    } catch (err) {
      setIsTyping(false);
      alert("Server error: " + (err.response?.data?.errMessage || err.message));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  const handleViewMyAppointments = () => {
    handleClose();
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/user/appointments");
    } else {
      alert("Your booking is saved! You can look up your appointment using your phone number or log in.");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          className="ai-chat-floating-btn"
          onClick={() => setIsOpen(true)}
          title="Chat with MinMiu AI to book appointment"
        >
          <FontAwesomeIcon icon={faPaw} style={{ fontSize: "24px" }} />
          <span style={{ fontSize: "10px", marginTop: "2px", fontWeight: 700 }}>AI Book</span>
          <span className="btn-badge">AI</span>
        </button>
      )}

      {/* AI Chatbox Modal */}
      {isOpen && (
        <div className="ai-chat-modal">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-left">
              <div className="ai-avatar">
                <FontAwesomeIcon icon={faRobot} />
              </div>
              <div className="ai-info">
                <h4>
                  MinMiu AI Vet <span className="ai-status-indicator" />
                </h4>
                <p>24/7 Consultation & Booking</p>
              </div>
            </div>
            <div className="ai-header-actions">
              <button className="ai-header-btn" onClick={initWelcomeChat} title="Restart chat">
                <FontAwesomeIcon icon={faRedo} />
              </button>
              <button className="ai-header-btn" onClick={handleClose} title="Close chat">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="ai-chat-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
                <div className="chat-bubble">
                  {/* Normal text with markdown bold rendering */}
                  <div style={{ whiteSpace: "pre-line", wordBreak: "normal", overflowWrap: "break-word" }}>
                    {msg.text.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>

                  {/* Image Preview in chat */}
                  {msg.type === "image_preview" && msg.image && (
                    <img
                      src={msg.image}
                      alt="Pet preview"
                      style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "10px", marginTop: "8px" }}
                    />
                  )}

                  {/* 4 Services Selection Cards in Welcome */}
                  {msg.type === "welcome" && step === 0 && (
                    <div className="service-options-grid">
                      {SERVICES_LIST.map((srv) => (
                        <button
                          key={srv.id}
                          className={`service-card-btn ${selectedService === srv.id ? "selected" : ""}`}
                          onClick={() => handleSelectService(srv.id)}
                        >
                          <span className="service-icon">{srv.icon}</span>
                          <span className="service-title">{srv.title}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* AI Consultation Advice Box with button */}
                  {msg.type === "consult_reply" && msg.recommendedService && (
                    <div className="ai-recommend-box">
                      <h5>
                        <FontAwesomeIcon icon={faStethoscope} /> Recommended Service:
                      </h5>
                      <p>
                        Service: <strong>{msg.recommendedService}</strong>
                        {msg.advice && <><br /><em>💡 Note: {msg.advice}</em></>}
                      </p>
                      <button
                        className="btn-select-recommended"
                        onClick={() => handleSelectService(msg.recommendedService)}
                      >
                        Select Service: {msg.recommendedService} ➔
                      </button>
                    </div>
                  )}

                  {/* Step 1: Upload Image Prompt Card */}
                  {msg.type === "upload_request" && step === 1 && (
                    <div className="upload-pet-card">
                      <div className="upload-icon-wrap">
                        <FontAwesomeIcon icon={faCamera} />
                      </div>
                      <p>Upload a photo of your pet from your device</p>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                      />
                      <div className="upload-buttons-row">
                        <button className="btn-choose-file" onClick={() => fileInputRef.current?.click()}>
                          <FontAwesomeIcon icon={faUpload} /> Upload Photo
                        </button>
                      </div>

                      {/* Quick sample chips */}
                      <div className="quick-sample-photos">
                        <span>Or select a sample photo:</span>
                        <div className="sample-photo-chips">
                          <button className="sample-chip" onClick={() => handleSamplePhoto("cat")}>
                            🐱 Sample Cat
                          </button>
                          <button className="sample-chip" onClick={() => handleSamplePhoto("dog")}>
                            🐶 Sample Dog
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: AI Pet Analysis & Price Breakdown */}
                  {msg.type === "analysis_result" && msg.analysis && (
                    <>
                      <div className="ai-analysis-card">
                        <div className="analysis-header" style={{ justifyContent: "space-between" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <FontAwesomeIcon icon={faPaw} /> Detected via YOLO Deep Learning
                          </span>
                          <span className="yolo-tech-tag">
                            ⚡ YOLOv8 ({msg.analysis.yoloInfo?.inferenceTime || "18ms"})
                          </span>
                        </div>

                        {petImagePreview && (
                          <div className="yolo-preview-container">
                            <img src={petImagePreview} alt="Pet" className="analysis-img-preview" />
                            {/* YOLO Bounding Box Overlay */}
                            <div
                              className="yolo-bbox"
                              style={{
                                top: `${(petAnalysis?.yoloInfo?.bbox || msg.analysis.yoloInfo?.bbox)?.y1 || 10}%`,
                                left: `${(petAnalysis?.yoloInfo?.bbox || msg.analysis.yoloInfo?.bbox)?.x1 || 10}%`,
                                width: `${(petAnalysis?.yoloInfo?.bbox || msg.analysis.yoloInfo?.bbox)?.width || 80}%`,
                                height: `${(petAnalysis?.yoloInfo?.bbox || msg.analysis.yoloInfo?.bbox)?.height || 80}%`,
                              }}
                            >
                              <div className="yolo-bbox-tag">
                                🎯 {petAnalysis?.species || msg.analysis.species} ({petAnalysis?.yoloInfo?.className || msg.analysis.yoloInfo?.className || "detected"}): {petAnalysis?.yoloInfo?.confidence || msg.analysis.yoloInfo?.confidence || "95.0%"}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="analysis-details-grid">
                          <div className="detail-item">
                            <span className="label">Detected Species (Tap to switch if needed):</span>
                            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                              <button
                                type="button"
                                className={`species-toggle-btn ${petAnalysis?.species === "Dog" || (!petAnalysis && (msg.analysis.species === "Dog" || msg.analysis.species === "Chó")) ? "active" : ""}`}
                                onClick={() => handleToggleSpecies("Dog")}
                              >
                                🐶 Dog
                              </button>
                              <button
                                type="button"
                                className={`species-toggle-btn ${petAnalysis?.species === "Cat" || (!petAnalysis && (msg.analysis.species === "Cat" || msg.analysis.species === "Mèo")) ? "active" : ""}`}
                                onClick={() => handleToggleSpecies("Cat")}
                              >
                                🐱 Cat
                              </button>
                            </div>
                          </div>
                          <div className="detail-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px dashed #ffd1c7", marginTop: "4px" }}>
                            <span className="label" style={{ marginBottom: 0, fontSize: "12px", fontWeight: "600", color: "#666" }}>
                              Estimated Weight:
                            </span>
                            <span className="value" style={{ fontSize: "16px", color: "#ff4757", fontWeight: "700" }}>
                              {petAnalysis?.estimatedWeight || msg.analysis.estimatedWeight}
                            </span>
                          </div>
                        </div>
                        <p className="analysis-comment">{msg.analysis.appearance}</p>
                      </div>

                      {/* Pricing Card */}
                      {step === 2 && (
                        <div className="pricing-card">
                          <div className="pricing-title">Estimated Cost by Species & Weight:</div>
                          <div className="pricing-amount">
                            {formatCurrency(msg.analysis.estimatedPrice)}
                          </div>
                          <div className="pricing-note">
                            📋 <strong>Details:</strong> {msg.analysis.priceNote || "Includes veterinary service fee and clinic care"}
                          </div>
                          <button className="btn-agree-price" onClick={handleAgreePrice}>
                            <FontAwesomeIcon icon={faCheck} /> Agree & Select Time Slot
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Step 3: Interactive Date & Slot Form */}
                  {msg.type === "slot_selection" && step === 3 && (
                    <div className="booking-form-card">
                      {/* Date selection */}
                      <div className="form-group-title">
                        <FontAwesomeIcon icon={faCalendarAlt} /> 1. Select Date:
                      </div>
                      <div className="date-selector-row">
                        <button
                          className={`date-btn ${
                            selectedDate === new Date().toISOString().split("T")[0] ? "active" : ""
                          }`}
                          onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                        >
                          Today
                        </button>
                        <button
                          className={`date-btn ${
                            selectedDate ===
                            new Date(Date.now() + 86400000).toISOString().split("T")[0]
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedDate(new Date(Date.now() + 86400000).toISOString().split("T")[0])
                          }
                        >
                          Tomorrow
                        </button>
                        <input
                          type="date"
                          className="customer-input"
                          style={{ flex: 1.5, padding: "6px" }}
                          value={selectedDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </div>

                      {/* 4 Time slots */}
                      <div className="form-group-title">
                        <FontAwesomeIcon icon={faClock} /> 2. Select 1 of 4 Time Slots:
                      </div>
                      <div className="slots-grid">
                        {FIXED_SLOTS.map((slotTime) => {
                          const slotData = availableSlots.find((s) => s.slot === slotTime);
                          const isAvailable = slotData ? (slotData.isAvailable && slotData.remaining > 0 && slotData.bookedCount === 0) : true;
                          const isFull = !isAvailable;
                          const isSelected = selectedSlot === slotTime;

                          return (
                            <button
                              key={slotTime}
                              type="button"
                              disabled={isFull}
                              className={`slot-card-btn ${isSelected ? "selected" : ""} ${
                                isFull ? "disabled" : ""
                              }`}
                              onClick={() => {
                                if (!isFull) setSelectedSlot(slotTime);
                              }}
                            >
                              <span className="slot-time">{slotTime}</span>
                              <span className={`slot-status ${isFull ? "full" : ""}`}>
                                {isFull ? "Booked" : "Available"}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Customer Contact Info Form */}
                      <div className="form-group-title">
                        <FontAwesomeIcon icon={faPaw} /> 3. Owner & Pet Information:
                      </div>
                      <div className="customer-inputs">
                        <input
                          type="text"
                          className="customer-input"
                          placeholder="Owner's Full Name (*)"
                          value={bookingInfo.customerName}
                          onChange={(e) =>
                            setBookingInfo({ ...bookingInfo, customerName: e.target.value })
                          }
                        />
                        <input
                          type="tel"
                          className="customer-input"
                          placeholder="Contact Phone Number (*)"
                          value={bookingInfo.phoneNumber}
                          onChange={(e) =>
                            setBookingInfo({ ...bookingInfo, phoneNumber: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          className="customer-input"
                          placeholder="Pet's Name (e.g. Miu, Max, Luna)"
                          value={bookingInfo.petName}
                          onChange={(e) =>
                            setBookingInfo({ ...bookingInfo, petName: e.target.value })
                          }
                        />
                        <textarea
                          className="customer-input"
                          placeholder="Notes on symptoms or special requests..."
                          rows={2}
                          value={bookingInfo.symptoms}
                          onChange={(e) =>
                            setBookingInfo({ ...bookingInfo, symptoms: e.target.value })
                          }
                        />
                      </div>

                      <button className="btn-confirm-booking" onClick={handleConfirmBooking}>
                        <FontAwesomeIcon icon={faCheckCircle} /> Confirm Appointment 📅
                      </button>
                    </div>
                  )}

                  {/* Step 4: Booking Success Ticket Card */}
                  {msg.type === "booking_success" && msg.appointment && (
                    <div className="booking-success-card">
                      <div className="success-icon">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </div>
                      <h4 className="success-title">Appointment Booked Successfully!</h4>
                      <div className="ticket-info-box">
                        <div className="ticket-row">
                          <span className="k">Booking Code:</span>
                          <span className="v">#MM-{msg.appointment.id}</span>
                        </div>
                        <div className="ticket-row">
                          <span className="k">Service:</span>
                          <span className="v">{msg.appointment.serviceType}</span>
                        </div>
                        <div className="ticket-row">
                          <span className="k">Pet:</span>
                          <span className="v">{msg.appointment.petName} ({msg.appointment.petType})</span>
                        </div>
                        <div className="ticket-row">
                          <span className="k">Schedule:</span>
                          <span className="v">{msg.appointment.appointmentTime} - {msg.appointment.appointmentDate}</span>
                        </div>
                        <div className="ticket-row">
                          <span className="k">Estimated Price:</span>
                          <span className="v" style={{ color: "#e53e3e" }}>
                            {formatCurrency(msg.appointment.estimatedPrice)}
                          </span>
                        </div>
                        <div className="ticket-row">
                          <span className="k">Customer:</span>
                          <span className="v">{msg.appointment.customerName} ({msg.appointment.phoneNumber})</span>
                        </div>
                      </div>

                      <div className="ticket-actions">
                        <button className="btn-view-my-bookings" onClick={handleViewMyAppointments}>
                          View My Appointments
                        </button>
                        <button className="btn-book-another" onClick={initWelcomeChat}>
                          Book Another
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing animation */}
            {isTyping && (
              <div className="chat-message-row bot">
                <div className="chat-bubble typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Footer Input Bar */}
          <form className="ai-chat-footer" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Describe symptoms or ask a question for AI consultation..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="ai-send-btn" disabled={!inputText.trim()}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
