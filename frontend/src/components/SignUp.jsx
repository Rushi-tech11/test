import { UserPlus } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";

import {
  FIELDS,
  BUTTONCLASSES,
  Inputwrapper,
  MESSAGE_ERROR,
  MESSAGE_SUCCESS,
} from "../assets/dummy.jsx";

const API_URL = "http://localhost:4000/";
const INTIIAL_FORM = { name: "", email: "", password: "" };

const SignUp = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState(INTIIAL_FORM);
  const [loading, setLoding] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoding(true);
    setMessage({ text: "", type: "" });

    try {
      const { data } = await axios.post(
        `${API_URL}/api/user/register`,
        formData
      );
      console.log("Sigup Successful", data);
      setMessage({
        text: "Registration successful! You can now  log in.",
        type: "success",
      });
      setFormData(INTIIAL_FORM);
    } catch (err) {
      console.error("Signup error:", err);
      setMessage({
        text:
          err.response?.data?.message || "An  error occured.Please try again.",
        type: "error",
      });
    } finally {
      setLoding(false);
    }
  };

  return (
    <div className="max-wmd w-100 bg-white shadow-lg border-rides border-purlple-100 rounded-x1 p-8">
      <div className="mb-6 text-center">
        <div
          className="w-16 h-16 bg-gradient-to-br from-fuchsis-500 to-purple-600 rounded-full
        mx-auto flex items-center justify-center mb-4"
        >
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2x1 font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-500 text-sm mt-1">
          Join TaskFlow to manage your tasks
        </p>
      </div>
      {message.text && (
        <div
          className={
            message.type === "success" ? MESSAGE_SUCCESS : MESSAGE_ERROR
          }
        >
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(({ name, type, placeholder, icon: Icon }) => (
          <div key={name} className={Inputwrapper }>
            <Icon className="text-purple-500 w-5 h-5 mr-2" />
            <input
              type={type}
              placeholder={placeholder}
              value={formData[name]}
              onChange={(e) =>
                setFormData({ ...formData, [name]: e.target.value })
              }
              
              className="w-full focus:outline-none text-sm text-gray-700"
              required
              
            />
          </div>
        ))}
        <button type="submit" className={BUTTONCLASSES} disabled={loading}>
          {loading ? (
            "Signing Up..."
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-1" /> Sign Up
            </>
          )}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account:{""}
        <button
          onClick={onSwitchMode}
          className="text-purple-600 hover:text-purple-700 hover:underline
        font-medium transition-color"
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default SignUp;
