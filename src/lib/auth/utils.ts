

export const getSessionUser = () => {
  if (typeof window !== "undefined") {
    const userRole = localStorage.getItem("weego_role") || "guest";
    return { role: userRole, isAuthenticated: userRole !== "guest" };
  }
  return { role: "guest", isAuthenticated: false };
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("weego_role");
    window.location.href = "/";
  }
};
