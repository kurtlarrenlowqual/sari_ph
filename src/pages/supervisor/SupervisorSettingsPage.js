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
    <div className="page d-flex flex-column gap-3">
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <h1 className="mb-0">Supervisor Settings</h1>
      </div>

      <div className="card panel add-user-panel border-0 shadow-sm">
        <div className="card-body">
          <div className="panel-header d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
              <h2 className="h5 mb-1">Receipt & Store Settings</h2>
              <p className="mb-0">Configure how your store information appears on printed receipts.</p>
          </div>
          <span className="badge">Supervisor</span>
        </div>

          <form className="form-grid row g-3" onSubmit={handleSubmit}>
            <label className="form-label col-12 col-md-6 mb-0">
            Store name
            <input
                className="form-control"
              type="text"
              value={form.storeName}
              onChange={(e) => handleChange("storeName", e.target.value)}
              required
            />
          </label>

            <label className="form-label col-12 col-md-6 mb-0">
            Store address
            <input
                className="form-control"
              type="text"
              value={form.storeAddress}
              onChange={(e) => handleChange("storeAddress", e.target.value)}
            />
          </label>

            <label className="form-label col-12 col-md-6 mb-0">
            Store phone
            <input
                className="form-control"
              type="text"
              value={form.storePhone}
              onChange={(e) => handleChange("storePhone", e.target.value)}
            />
          </label>

            <label className="form-label col-12 col-md-6 mb-0">
            Tax rate (%)
            <input
                className="form-control"
              type="number"
              min="0"
              step="0.01"
              value={form.taxRate}
              onChange={(e) => handleChange("taxRate", e.target.value)}
            />
          </label>

            <label className="form-label col-12 mb-0">
            Header note
            <input
                className="form-control"
              type="text"
              value={form.headerNote}
              onChange={(e) => handleChange("headerNote", e.target.value)}
              placeholder="Shown below store info"
            />
          </label>

            <label className="form-label col-12 mb-0">
            Footer note
            <input
                className="form-control"
              type="text"
              value={form.footerNote}
              onChange={(e) => handleChange("footerNote", e.target.value)}
              placeholder="Shown at very bottom"
            />
          </label>

            <div className="form-actions col-12 d-flex justify-content-end gap-2 flex-wrap">
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset to defaults
            </button>
              <button type="submit" className="btn btn-primary button-full">
              Save settings
            </button>
          </div>

            {saved && <div className="form-message col-12 mb-0">Settings saved. New receipts will use these values.</div>}
        </form>
        </div>
      </div>
    </div>
  );
}

