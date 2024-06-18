export const mockObjects = [
    "Object 1",
    "Object 2",
    "Object 3"
];

export const mockChecklists = [
    "Checklist 1",
    "Checklist 2",
    "Checklist 3"
];

export const mockQuestions = [
    { 
        id: 1, 
        name: "Вопрос 1", 
        text: "Как настроение?", 
        options: ["Отлично", "Нормально", "Плохо"], 
        requireComment: false,
        requirePhoto: false
    },
    { 
        id: 2, 
        name: "Вопрос 2", 
        text: "На сколько вы оцениваете обслуживание?", 
        options: ["1", "2", "3", "4", "5"], 
        requireComment: true,
        requirePhoto: false
    },
    { 
        id: 3, 
        name: "Вопрос 3", 
        text: "Текст вопроса 3", 
        options: ["Option 3.1", "Option 3.2", "Option 3.3"], 
        requireComment: false,
        requirePhoto: true
    },
    { 
        id: 4, 
        name: "Вопрос 4", 
        text: "Текст вопроса 4", 
        options: ["Option 4.1", "Option 4.2", "Option 4.3"], 
        requireComment: true,
        requirePhoto: true
    }
];
