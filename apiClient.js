// apiClient.js
const API_BASE_URL = "https://localhost/api";

export default {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/ld+json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la connexion");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("email", email);
    return data;
  },

  async postGame(gameData) {
    return await this.authenticatedRequest("POST", "/me/jeus", gameData);
  },

    async register({ email, password, firstName, lastName }) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/ld+json" },
      body: JSON.stringify({ email, password, firstName, lastName })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.title || "Erreur lors de l'inscription");
    }

    return data;
    },


  async getStats() {
    return await this.authenticatedRequest("GET", "/me/stats");
  },

  async getLeaderboard() {
    return await this.authenticatedRequest("GET", "/leaderboard");
  },

  async authenticatedRequest(method, endpoint, body = null) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Non authentifié");
    }

    const headers = {
      "Content-Type": "application/ld+json",
      Authorization: `Bearer ${token}`,
    };

    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error("Session expirée ou non autorisée.");
      }
      throw new Error(data.message || "Erreur API");
    }

    return data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },
};
