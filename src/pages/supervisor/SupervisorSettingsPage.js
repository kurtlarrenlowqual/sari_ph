import React, { useEffect, useState } from "react";
import { getDefaultSettings, loadSettings, saveSettings, resetSettings } from "../../state/settings";

export default function SupervisorSettingsPage() {
  const [form, setForm] = useState(getDefaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(loadSettings());
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "taxRate" ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaults = resetSettings();
    setForm(defaults);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Supervisor Settings</h1>
      </div>

      <div className="panel add-user-panel">
        <div className="panel-header">
          <div>
            <h2>Receipt & Store Settings</h2>
            <p>Configure how your store information appears on printed receipts.</p>
          </div>
          <span className="badge">Supervisor</span>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Store name
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => handleChange("storeName", e.target.value)}
              required
            />
          </label>

          <label>
            Store address
            <input
              type="text"
              value={form.storeAddress}
              onChange={(e) => handleChange("storeAddress", e.target.value)}
            />
          </label>

          <label>
            Store phone
            <input
              type="text"
              value={form.storePhone}
              onChange={(e) => handleChange("storePhone", e.target.value)}
            />
          </label>

          <label>
            Tax rate (%)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.taxRate}
              onChange={(e) => handleChange("taxRate", e.target.value)}
            />
          </label>

          <label>
            Header note
            <input
              type="text"
              value={form.headerNote}
              onChange={(e) => handleChange("headerNote", e.target.value)}
              placeholder="Shown below store info"
            />
          </label>

          <label>
            Footer note
            <input
              type="text"
              value={form.footerNote}
              onChange={(e) => handleChange("footerNote", e.target.value)}
              placeholder="Shown at very bottom"
            />
          </label>

          <div className="form-actions">
            <button type="button" className="btn" onClick={handleReset}>
              Reset to defaults
            </button>
            <button type="submit" className="btn btn-primary button-full">
              Save settings
            </button>
          </div>

          {saved && <div className="form-message">Settings saved. New receipts will use these values.</div>}
        </form>
      </div>
    </div>
  );
}

