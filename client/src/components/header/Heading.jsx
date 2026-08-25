import "./Heading.css";
import Button from "../buttons/Button";
import logo from "../../images/logo.png";
import { useState,  } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function Heading({ onOpenLogin, onOpenSignup,  }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [showDropdown, setShowDropdown] = useState(false);

  // useEffect(() => {
  //   if (
  //     user?.role === "manager" &&
  //     !location.pathname.startsWith("/manager")
  //   ) {
  //     navigate("/manager/allorder", { replace: true });
  //   }
  // }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  const getInitials = (userName) => {
    if (!userName) return "";
    return userName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleBookClick = () => {
    window.dispatchEvent(new CustomEvent("open-booking-chat"));
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="MinMiu" className="logo" />
        <span className="brand">
          Veterinary clinic <br />
          <strong>MinMiu</strong>
        </span>
      </div>

          <nav className="nav">
            <a href="/" className={location.pathname === "/" ? "active" : ""}>Home</a>
            <a href="/store" className={location.pathname === "/store" ? "active" : ""}>Store</a>
            <a href="/contact" className={location.pathname === "/contact" ? "active" : ""}>Contact</a>
          </nav>

          <div className="header-right">
            <Button variant="primary" onClick={handleBookClick}>+ Book Appointment</Button>

            {user ? (
              <div className="user-dropdown">
                <button
                  type="button"
                  className="user-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-avatar">
                    {getInitials(user.userName)}
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`dropdown-icon ${
                      showDropdown ? "rotate" : ""
                    }`}
                  />
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <button
                      type="button"
                      className="dropdown-link"
                      onClick={() => {
                        if (user?.role === "manager") {
                          navigate("/manager/allorder");
                        } else {
                          navigate("/user/profile");
                        }
                        setShowDropdown(false);
                      }}
                    >
                      Manage Account
                    </button>
                    <button
                      type="button"
                      className="dropdown-link"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="secondary" onClick={onOpenLogin}>
                  Sign in
                </Button>
                <Button variant="outline" onClick={onOpenSignup}>
                  Sign up
                </Button>
              </>
            )}
          </div>
    </header>
  );
}
