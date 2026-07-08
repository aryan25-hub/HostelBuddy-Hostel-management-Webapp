// Central API base URL config.
// In dev, Vite proxies /api →  automatically.
// In production (Render/Railway), set VITE_API_BASE_URL env var to your backend URL.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default API_BASE;
