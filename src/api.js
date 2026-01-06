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

export const sendDraftAnswer = async (token, chat_id, answer, selected_unit, selected_model, draft_id, questionId) => {
    const response = await api.post('/draft/send_answer', {
        token,
        chat_id: chat_id || "",
        answer,
        selected_unit,
        selected_model,
        draft_id: draft_id || undefined,
        questionId
    });
    return response.data;
};

export const getDraftAnswer = async (token, chat_id, draft_id, questionId) => {
    const response = await api.post('/draft/get_answer', {
        token,
        chat_id: chat_id || "",
        draft_id,
        questionId
    });
    return response.data;
};

export const deleteDraft = async (token, chat_id, draft_id) => {
    const response = await api.post('/draft/delete', {
        token,
        chat_id: chat_id || "",
        draft_id
    });
    return response.data;
};

export const doneDraft = async (token, chat_id, draft_id) => {
    const response = await api.post('/draft/done', {
        token,
        chat_id: chat_id || "",
        draft_id
    });
    return response.data;
};
