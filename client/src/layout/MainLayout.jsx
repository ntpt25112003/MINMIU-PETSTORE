import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Heading from "../components/header/Heading";
import Footer from "../components/footer/Footer";
import LoginModal from "../components/homeSign/LoginModal";
import SignupModal from "../components/homeSign/SignupModal";
import AIChatbox from "../components/chat/AIChatbox";

export default function MainLayout() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLoginSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Heading
        key={refreshKey}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenSignup={() => setSignupOpen(true)}
      />

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSignUp={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      <SignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onGoLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />

      <Outlet />
      <Footer />
      <AIChatbox />
    </>
  );
}
