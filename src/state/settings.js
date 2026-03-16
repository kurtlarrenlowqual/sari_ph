const STORAGE_KEY = "sari_ph_receipt_settings";

const defaultSettings = {
  storeName: "My Sari-Sari Store",
  storeAddress: "123 Barangay Street, City",
  storePhone: "0912 345 6789",
  taxRate: 12, // percent
  headerNote: "Thank you for your purchase!",
  footerNote: "No return without receipt.",
};

export function getDefaultSettings() {
  return { ...defaultSettings };
}

export function loadSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSettings();
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch (e) {
    return getDefaultSettings();
  }
}

export function saveSettings(nextSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
  } catch (e) {
    // ignore write errors
  }
}

export function resetSettings() {
  saveSettings(getDefaultSettings());
  return getDefaultSettings();
}

