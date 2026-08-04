import axios from 'axios';
import { hasRequiredPhotoMedia } from './utils/media';

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
    const photoOk = !question.requirePhoto || hasRequiredPhotoMedia(savedValue);
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
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        heic: 'image/heic',
    };
    return map[format] || `video/${format || 'mp4'}`;
};

const getFileFormat = (file) => {
    const fromName = file?.name?.split('.').pop()?.toLowerCase();
    if (fromName) return fromName.replace(/[^\w]/g, '');
    if (file?.type?.includes('/')) {
        return file.type.split('/')[1].replace('jpeg', 'jpg');
    }
    return file?.type?.startsWith('image/') ? 'jpg' : 'mp4';
};

/**
 * Загрузка файла в S3 (presign → PUT).
 * Без /video/upload/complete — для медиа вопросов чеклиста.
 * meta: { objectId, checklistId, questionId }
 */
export const uploadFileToS3 = async (
    token,
    chat_id,
    file,
    agent,
    onUploadProgress,
    meta = {}
) => {
    const format = getFileFormat(file);
    const contentType =
        file.type ||
        formatToMime(format, null) ||
        'application/octet-stream';

    const { data: presign } = await api.post('/video/upload/presign', {
        token,
        chat_id: chat_id || '',
        format,
        agent,
        content_type: contentType,
        filename: file.name || `file.${format}`,
        selected_unit: meta.objectId || meta.selected_unit || '',
        selected_model: meta.checklistId || meta.selected_model || '',
        question_id: meta.questionId || meta.question_id || '',
        draft_id: meta.draftId || meta.draft_id || '',
        date: meta.date || new Date().toISOString().slice(0, 10),
    });

    await axios.put(presign.put_url, file, {
        headers: {
            'Content-Type': presign.content_type || contentType,
        },
        onUploadProgress,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 0,
    });

    const url = presign.video_url;
    const type = file.type?.startsWith('video/') ||
        ['mp4', 'mov', 'webm', 'm4v', '3gp', 'avi', 'mkv'].includes(format)
        ? 'video'
        : 'photo';

    return {
        url,
        key: presign.key,
        upload_id: presign.upload_id,
        type,
        content_type: presign.content_type || contentType,
    };
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
