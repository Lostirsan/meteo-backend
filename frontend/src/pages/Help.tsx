import AppLayout from "../layouts/AppLayout";
import "./help.css";

export default function Help() {
  const handleChat = () => {
    alert("Live chat will be available soon 👨‍💻💬");
  };

  return (
    <AppLayout>
      <main className="help-content">
        <h2>❓ Help & Support</h2>
        <p className="subtitle">
          Need help with Smart Irrigation? Contact us anytime.
        </p>

        <div className="help-card">
          <div className="help-item">
            <span className="icon">📧</span>
            <div>
              <strong>Email</strong>
              <p>support@smartirrigation.com</p>
            </div>
          </div>

          <div className="help-item">
            <span className="icon">📞</span>
            <div>
              <strong>Phone</strong>
              <p>+421 900 123 456</p>
            </div>
          </div>

          <button className="chat-btn" onClick={handleChat}>
            💬 Live chat
          </button>
        </div>
      </main>
    </AppLayout>
  );
}
