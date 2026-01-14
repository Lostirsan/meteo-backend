import AppLayout from "../layouts/AppLayout.tsx";
import "./help.css";

export default function Help() {
  return (
    <AppLayout title="❓ Help & Support">
      <main className="help-content">
        <div className="help-wrap">
          <h2>❓ Help & Support</h2>
          <p>Need help with Smart Irrigation? Contact us anytime.</p>

          <div className="help-card">
            <div className="help-row">
              <span>📧 Email</span>
              <strong>support@smartirrigation.com</strong>
            </div>

            <div className="help-row">
              <span>📞 Phone</span>
              <strong>+421 900 123 456</strong>
            </div>

            <button className="live-chat">🟢 Live chat</button>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
