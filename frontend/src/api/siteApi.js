import axiosInstance from "./axiosInstance";

export const fetchSiteName = async () => {
  const res = await axiosInstance.get("/site/name");
  return res.data; // 문자열
};

export const updateSiteName = async (newName) => {
  const res = await axiosInstance.put("/site/name", { siteName: newName });
  return res.data;
};
