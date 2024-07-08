// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://server.salescontrol.kz/api/',
});

export const getObjects = async (token, chat_id) => {
    const response = await api.post('/objects', {
        token,
        chat_id 
    });
    return response.data;
};

export const getChecklists = async (token, chat_id, objectId) => {
    const response = await api.post(`/checklists`, {
        token,
        chat_id,
        objectId 
    });
    return response.data;
};

export const getQuestions = async (token, chat_id, checklistId) => {
    const response = await api.post(`/questions`, {
        token,
        chat_id,
        checklistId 
    });
    return response.data;
};
