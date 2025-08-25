// src/api/teacherApi.js
export const getTeacherData = async () => {
  try {
    const response = await fetch("/api/teacher/data", {
      method: "GET",
      credentials: "include", // needed for session auth
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch teacher data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching teacher data:", error);
    return [];
  }
};
