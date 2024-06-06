import React, { useState } from "react";
import axios from "axios";
import "./Register.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false); // State for checkbox
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!termsAccepted) {
      setError("Musisz zaakceptować regulamin");
      return;
    }
    try {
      await axios.post('/api/register', {
        username,
        password,
        role,
      });
      alert('Zarejestrowano pomyślnie');
    } catch (err) {
      setError(err.response ? err.response.data : err.message);
    }
  };
  return (
    <div className="reg-page">
      <div className="form-regis">
        <h1 className="regtyt">Rejestracja</h1>
        <form onSubmit={handleSubmit}>
          <p>Nazwa użytkownika:</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <p>Hasło:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms">
              Oświadczam, że znam i akceptuję postanowienia regulaminu. Wyrażam
              zgodę na przetwarzanie podanych przeze mnie danych osobowych.
            </label>
          </div>

          <button className="zaloz" type="submit">
            Załóż
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="juz-ma">
        <h1 className="regtyt">Masz już konto?</h1>
        <button className="zaloz" onClick={handleLogin}>
          Zaloguj się
        </button>
      </div>
    </div>
  );
}

export default Register;
