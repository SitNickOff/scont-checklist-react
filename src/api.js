import axios from 'axios';

// Замените baseURL на ваш URL API
const baseURL = 'https://server.salescontrol.kz/api/';
// const baseURL = 'https://app.scont.io/Remotes/checklist_bot_rwett64iu';

const api = axios.create({
  baseURL,
});

const token = "fdsfsfewfew";
const chat_id = "379719001";

export const getObjects = async () => {
    const response = await api.post('/objects', {
        token,
        chat_id 
    });

    return response.data;
};

export const getChecklists = async (objectId) => {
    const response = await api.post(`/checklists`, {
        token,
        chat_id,
        objectId 
    });

    return response.data;
};

export const getQuestions = async (checklistId) => {
    const response = await api.post(`/questions`, {
        token,
        chat_id,
        checklistId 
    });
    
    return response.data;
};
