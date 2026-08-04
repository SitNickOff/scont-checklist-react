import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://server.salescontrol.kz/api/',
});

export const getObjects = async (token, chat_id, agent) => {
    const response = await api.post('/objects', {
        token,
        chat_id,
        agent,
    });
    return response.data;
};

export const getChecklists = async (token, chat_id, objectId, agent) => {
    const response = await api.post(`/checklists`, {
        token,
        chat_id,
        objectId,
        agent,
    });
    return response.data;
};

export const getQuestions = async (token, chat_id, checklistId, agent) => {
    const response = await api.post(`/questions2`, {
        token,
        chat_id,
        checklistId,
        agent,
    });
    return response.data;
};

export const sendDraftAnswer = async (token, chat_id, answer, selected_unit, selected_model, draft_id, questionId, agent) => {
    const response = await api.post('/draft/send_answer', {
        token,
        chat_id: chat_id || "",
        answer,
        selected_unit,
        selected_model,
        draft_id: draft_id || undefined,
        questionId,
        agent,
    });
    return response.data;
};

export const getDraftAnswer = async (token, chat_id, draft_id, questionId, agent) => {
    const response = await api.post('/draft/get_answer', {
        token,
        chat_id: chat_id || "",
        draft_id,
        questionId,
        agent,
    });
    return response.data;
};

function parseSavedDraftValue(response, questionId) {
    if (!response || response.status !== "ok" || !response.value) {
        return null;
    }
    let savedValue = response.value;
    if (Array.isArray(response.value)) {
        savedValue =
            response.value.find((item) => item.questionId === questionId) ||
            response.value[0] ||
            null;
    }
    return savedValue || null;
}

function serverAnswerSatisfiesQuestion(savedValue, question) {
    if (!question) return true;
    const textOk = !question.required
        ? true
        : Boolean(
              savedValue &&
                  savedValue.text !== undefined &&
                  savedValue.text !== null &&
                  (Array.isArray(savedValue.text)
                      ? savedValue.text.length > 0
                      : String(savedValue.text).trim() !== "")
          );
    const commentOk =
        !question.requireComment ||
        (savedValue &&
            typeof savedValue.comment === "string" &&
            savedValue.comment.trim() !== "");
    const photoOk =
        !question.requirePhoto ||
        (savedValue &&
            Array.isArray(savedValue.photos) &&
            savedValue.photos.length > 0);
    return textOk && commentOk && photoOk;
}

export const deleteDraft = async (token, chat_id, draft_id, agent) => {
    const response = await api.post('/draft/delete', {
        token,
        chat_id: chat_id || "",
        draft_id,
        agent,
    });
    return response.data;
};

export const uploadVideo = async (token, chat_id, video, format, agent) => {
    const response = await api.post('/video/upload', {
        token,
        chat_id: chat_id || '',
        video,
        format,
        agent,
    });
    return response.data;
};

const formatToMime = (format, fileType) => {
    if (fileType) return fileType;
    const map = {
        mov: 'video/quicktime',
        '3gp': 'video/3gpp',
        webm: 'video/webm',
        m4v: 'video/x-m4v',
    };
    return map[format] || `video/${format || 'mp4'}`;
};

const uploadVideoStreamViaProxy = async (
    token,
    chat_id,
    file,
    format,
    agent,
    onUploadProgress
) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('chat_id', chat_id || '');
    formData.append('format', format || '');
    formData.append('agent', agent);
    formData.append('video', file, file.name);

    const response = await api.post('/video/upload/stream', formData, {
        onUploadProgress,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 0,
    });
    return response.data;
};

/** Прямая загрузка в S3: presign → PUT в бакет → complete на backend. */
export const uploadVideoStream = async (
    token,
    chat_id,
    file,
    format,
    agent,
    onUploadProgress
) => {
    const contentType = formatToMime(format, file.type);

    let presign;
    try {
        const response = await api.post('/video/upload/presign', {
            token,
            chat_id: chat_id || '',
            format: format || '',
            agent,
            content_type: contentType,
            filename: file.name,
        });
        presign = response.data;
    } catch (error) {
        if (error?.response?.status === 404) {
            return uploadVideoStreamViaProxy(
                token,
                chat_id,
                file,
                format,
                agent,
                onUploadProgress
            );
        }
        throw error;
    }

    await axios.put(presign.put_url, file, {
        headers: {
            'Content-Type': presign.content_type || contentType,
        },
        onUploadProgress,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 0,
    });

    const { data } = await api.post('/video/upload/complete', {
        token,
        chat_id: chat_id || '',
        format: format || '',
        agent,
        upload_id: presign.upload_id,
        key: presign.key,
        video_url: presign.video_url,
    });

    return data;
};

export const doneDraft = async (token, chat_id, draft_id, agent, questions = []) => {
    if (questions.length > 0) {
        const responses = await Promise.all(
            questions.map((q) =>
                getDraftAnswer(token, chat_id, draft_id, q.id, agent)
            )
        );
        for (let i = 0; i < questions.length; i++) {
            const savedValue = parseSavedDraftValue(responses[i], questions[i].id);
            if (!serverAnswerSatisfiesQuestion(savedValue, questions[i])) {
                const err = new Error(
                    "На сервере не все ответы сохранены. Подождите немного и попробуйте снова."
                );
                err.code = "INCOMPLETE_DRAFT";
                err.questionId = questions[i].id;
                throw err;
            }
        }
    }

    const response = await api.post('/draft/done', {
        token,
        chat_id: chat_id || "",
        draft_id,
        agent,
    });
    return response.data;
};
