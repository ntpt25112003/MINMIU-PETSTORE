// src/pages/HomePage.jsx
import React, { useState } from "react";
// import Heading from "../../components/header/Heading"
import LoginModal from "../../components/homeSign/LoginModal";
// import SignupModal from "../../components/homeSign/SignupModal";
import "./HomePage.css";
import shopCat from "../../images/meo1.png";
import cat2 from "../../images/meo2.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faList,
  faCircleCheck,
  faPhone,
  faPlus,
  faStethoscope,
  faHouseMedical,
  faBolt,
  faDog,
  faBone,
  faSyringe,
} from "@fortawesome/free-solid-svg-icons";

const services = [
    {
      title: "Consulting and health care",
      desc: "MinMiu Veterinary Clinic is proud to be a veterinary facility with many years of experience in medical examination and free pet health care consultation.",
      icon: faStethoscope,
    },
    {
      title: "Pet sitting service",
      desc: "We apply a scientific pet keeping process, ensuring your pet lives in a safe and clean environment during their stay in the storage room.",
      icon: faDog,
    },
    {
      title: "Examination and treatment at home",
      desc: "We provide home medical examination and treatment services and transport pets from your home 24/7 to the clinic and vice versa.",
      icon: faHouseMedical,
    },
    {
      title: "Food and accessories",
      desc: "Imported food for dogs and cats with rich and diverse types. There are also toys, clothes, backpacks, accessories...",
      icon: faBone,
    },
    {
      title: "Rapid diagnosis and treatment",
      desc: "Methods of diagnostic imaging or testing: Ultrasound, X-ray, blood, virus, urine, skin tests, antibiogram, etc.",
      icon: faBolt,
    },
    {
      title: "Vaccination and deworming",
      desc: "To ensure the health of people and pets, pets need to be vaccinated and re-vaccinated periodically according to the doctor's instructions every year.",
      icon: faSyringe,
    },
  ];

export default function HomePage() {
  const [loginOpen, setLoginOpen] = useState(() => {
    const shouldOpen = localStorage.getItem("showLoginModal") === "true";
    if (shouldOpen) localStorage.removeItem("showLoginModal");
    return shouldOpen;
  });

  return (
    <>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSignUp={() => {
          setLoginOpen(false);   
          // setSignupOpen(true);  
        }}
        onLoginSuccess={() => {
          // Giỏ hàng sẽ tự update khi login
        }}
      />

      <main className="home">
        {/* HERO */}
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1 className="hero-title">
              Veterinary clinic <br /> MinMiu
            </h1>

            <button className="btnPrimary hero-btn">
              <FontAwesomeIcon icon={faPlus} /> Book Appointment
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="statsWrap">
          <div className="stats">
            <div className="statItem">
              <FontAwesomeIcon icon={faStar} className="statIcon" />
              <div>
                <div className="statTitle">Top service</div>
                <div className="statSub">Professional team</div>
              </div>
            </div>

            <div className="statItem">
              <FontAwesomeIcon icon={faList} className="statIcon" />
              <div>
                <div className="statTitle">More than 20 services</div>
                <div className="statSub">pet care</div>
              </div>
            </div>

            <div className="statItem">
              <FontAwesomeIcon icon={faCircleCheck} className="statIcon" />
              <div>
                <div className="statTitle">Rating 4.8/5</div>
                <div className="statSub">from customers</div>
              </div>
            </div>

            <div className="statItem">
              <FontAwesomeIcon icon={faPhone} className="statIcon" />
              <div>
                <div className="statTitle">Operates 24/24</div>
                <div className="statSub">Contact 0123456789</div>
              </div>
            </div>
          </div>
        </section>

        {/* QUALITY */}
        <section className="quality">
          <h2>Quality creates prestige!</h2>
          <p>
          With the vision of becoming a prestigious and top quality pet medical examination and treatment and 
          service facility in Vietnam, on par with hospitals and veterinary clinics in countries in the region and around the world.
          A place where ethical and talented people converge, bringing high quality services and experiences to customers. 
          A place to spread pet love.These are the top goals that My Dinh Veterinary Hospital focuses on.
          </p>
        </section>

        {/* ONLINE SHOP */}
        <section className="shopBannerWrap">
            <div className="shopBanner">
                {/* LEFT */}
                <div className="shopLeft">
                <strong className="shopLabel">ONLINE SHOP</strong>
                <img src={shopCat} alt="Cat" className="shopCat" />
                </div>

                {/* MIDDLE */}
                <div className="shopMid">
                <div className="shopTitle">Shopping online...</div>
                <small className="shopSub">At the veterinary clinic website</small>
                </div>

                {/* RIGHT */}
                <div className="shopRight">
                <button className="btnDark">Store</button>
                </div>
            </div>
        </section>

        {/* SERVICES */}
        <section className="services">
            <div className="servicesGrid">
                {services.map((s, i) => (
                <div className="serviceCard" key={i}>
                    <div className="serviceIcon">
                    <FontAwesomeIcon icon={s.icon} />
                    </div>

                    <div className="serviceContent">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                    </div>
                </div>
                ))}
            </div>
        </section>

        {/* CTA */}
        <section className="ctaBar">
            <div className="ctaInner">
                <img src={cat2} alt="Cat" className="ctaCat" />

                <div className="ctaText">What service do you need?</div>

                <div className="ctaPhone">
                Contact us now: <span className="ctaNum">0123456789</span>
                </div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
            <div className="footerTop">
                <h3 className="footerTitle">Veterinary clinic MinMiu</h3>
                <p className="footerSub">
                Responsibility - Empathy - Ethics - Professionalism
                </p>
            </div>

        </footer>
      </main>
    </>
  );
}
