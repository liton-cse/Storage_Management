import React from "react";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdOutlineMailOutline } from "react-icons/md";
import "../../styles/ButtomNavigationStyle/Suport.css";
function Support() {
  return (
    <div className="support-area">
      <div className="support">
        <div className="support-headding">
          <h1>Support</h1>
        </div>
        <div className="support-timmer">
          <div className="support-clock">
            <img src="/Stopwatch.png" alt="Stopwatch" />
          </div>
          <div className="support-time">
            <h1>24/7</h1>
          </div>
          <div className="support-text">
            <h1>Support</h1>
          </div>
        </div>
        <div className="support-info">
          <p>
            If you face any kind of problem with our service feel free to
            contact us
          </p>
          <div className="support-contact">
            <div className="support-mobile">
              <BsFillTelephoneFill />
              <p>01720258924</p>
            </div>
            <div className="support-email">
              <MdOutlineMailOutline />
              <p>litonakash13@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
