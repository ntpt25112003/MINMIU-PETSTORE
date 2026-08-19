const LOCAL_IMAGE_BASE_URL = "http://localhost:8081/images/";

export const getImageSrc = (image, fallback = "") => {
  if (!image) return fallback;
  if (typeof image === "string" && /^https?:\/\//i.test(image)) return image;
  return `${LOCAL_IMAGE_BASE_URL}${image}`;
};