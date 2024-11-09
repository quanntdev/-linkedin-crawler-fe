import axios from "axios";

export async function getJobDetail(payload) {
  const apiUrl = process.env.REACT_APP_API_KEY;
  const response = await axios.post(`${apiUrl}/get-job-detail`, payload);
  return response.data;
}

export const uploadFile = async (payload) => {
  const apiUrl = process.env.REACT_APP_API_KEY;
  return await axios.post(`${apiUrl}/upload-pdf`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export async function getInfoFromCv(id) {
  const apiUrl = process.env.REACT_APP_API_KEY;
  const response = await axios.get(`${apiUrl}/generate/skill/${id}`);
  return response.data;
}


export async function submitCV(payload) {
  const apiUrl = process.env.REACT_APP_API_KEY;
  const response = await axios.post(`${apiUrl}/apply-job/`, payload);
  return response.data;
}
