// services/api.js
// Central API client for SchoolSync. All components should import { api } from here.
// Handles: base URL, auth token injection, 401 redirect, JSON parsing, error normalization.

const BASE = "http://localhost:8000";

function getToken() {
    // Support multiple legacy key names from different parts of the codebase
    return (
        localStorage.getItem("schoolsync_token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token")
    );
}

async function request(method, path, body, opts = {}) {
    const token = getToken();
    const headers = {
        ...(opts.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Default to JSON unless caller overrides (e.g. form-urlencoded for login)
    let finalBody;
    if (body !== undefined && body !== null) {
        if (opts.form) {
            // application/x-www-form-urlencoded
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            const params = new URLSearchParams();
            Object.entries(body).forEach(([k, v]) => params.append(k, v));
            finalBody = params.toString();
        } else {
            headers["Content-Type"] = "application/json";
            finalBody = JSON.stringify(body);
        }
    }

    let res;
    try {
        res = await fetch(`${BASE}${path}`, {
            method,
            headers,
            ...(finalBody !== undefined ? { body: finalBody } : {}),
            credentials: "include", // send refresh-token cookie if present
        });
    } catch (networkErr) {
        throw new Error("Network error — is the backend running on port 8000?");
    }

    if (res.status === 401) {
        // Clear all known token/user keys
        localStorage.removeItem("schoolsync_token");
        localStorage.removeItem("schoolsync_user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
        }
        throw new Error("Session expired. Please log in again.");
    }

    if (!res.ok) {
        let detail = res.statusText;
        try {
            const errBody = await res.json();
            detail = errBody.detail || JSON.stringify(errBody);
        } catch {
            // body wasn't JSON; keep statusText
        }
        throw new Error(detail);
    }

    if (res.status === 204) return null; // No Content
    return res.json();
}

export const api = {
    get: (path) => request("GET", path),
    post: (path, body, opts) => request("POST", path, body, opts),
    put: (path, body) => request("PUT", path, body),
    patch: (path, body) => request("PATCH", path, body),
    delete: (path) => request("DELETE", path),

    getTeacherTimetable: async (teacherId) => {
        const res = await request("GET", `/timetable/view?scope=teacher&scope_id=${teacherId}`);
        return res?.timetable ?? {};
    },
    getSubjects: async () => {
        const res = await request("GET", "/api/v1/subjects");
        return Array.isArray(res) ? res : (res?.data ?? []);
    },
    getRooms: async () => {
        const res = await request("GET", "/api/v1/rooms/");
        return Array.isArray(res) ? res : (res?.data ?? []);
    },
    getTeachers: async () => {
        const res = await request("GET", "/api/v1/teachers");
        return Array.isArray(res) ? res : (res?.data ?? []);
    },
};

// Direct helpers used outside the standard JSON pattern (form-urlencoded login)
export async function loginRequest(email, password) {
   return request("POST", "/api/auth/login", { username: email, password: password });
}