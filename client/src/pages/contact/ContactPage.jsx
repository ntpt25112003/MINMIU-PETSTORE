import React, { useState } from "react";
import Heading from "../../components/header/Heading";
import "./ContactPage.css";
import contactCat from "../../images/meo3.png"

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // demo: bạn thay bằng API sau
    alert("Sent!");
    setForm({ fullName: "", email: "", phone: "", message: "" });
  };

  return (
    <>
      {/* <Heading /> */}

      <main className="contactPage">
        {/* Top intro */}
        <section className="contactHero">
          <h1 className="contactTitle">Contact</h1>
          <p className="contactDesc">
            We'd love to hear from you – please use the form to <br />
            send us your message or ideas.
          </p>

          <div className="contactInfo">
            <div className="contactInfoCol">
              <div className="infoLine">
                <strong>Address:</strong> 3 Lane 25, Nguyen Co Thach Ward, My
                Dinh, Nam Tu Liem, Hanoi
              </div>
            </div>

            <div className="contactDivider" />

            <div className="contactInfoCol">
              <div className="infoLine">
                <strong>Hotline:</strong> 096 930 69 09
              </div>
              <div className="infoLine">
                <strong>Email:</strong> info@thuymydinh.vn
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="contactBody">
          {/* Left */}
          <div className="contactLeft">
            <h2 className="leftTitle">
              If you have any questions or <br />
              comments, please leave us a <br />
              message:
            </h2>

            <img
              className="contactCat"
              src={contactCat}
              alt="Cat"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          {/* Right */}
          <div className="contactRight">
            <h2 className="rightTitle">Messages and comments</h2>

            <form className="contactForm" onSubmit={onSubmit}>
              <label className="field">
                <span>Customer's full name</span>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  type="text"
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  type="email"
                />
              </label>

              <label className="field">
                <span>Phone number</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  type="tel"
                />
              </label>

              <label className="field">
                <span>Message</span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={6}
                />
              </label>

              <button className="sendBtn" type="submit">
                Send
              </button>
            </form>
          </div>
        </section>

        {/* Footer giống trang home */}
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
