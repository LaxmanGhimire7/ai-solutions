import api from './axios';

export const uploadImage = async (file) => {
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await api.post('/uploads/image', {
    fileName: file.name,
    mimeType: file.type,
    data,
  });

  return response.data;
};
