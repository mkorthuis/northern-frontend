// Question type definitions
export enum QuestionTypeId {
  TEXT = 1,
  TEXTAREA = 2,
  SINGLE_CHOICE = 3,
  MULTIPLE_CHOICE = 4,
  DROPDOWN = 5,
  SCALE = 6,
  DATE = 7,
  FILE_UPLOAD = 8,
  MATRIX = 9,
  RANKING = 10,
}

export const QUESTION_TYPES = [
  { id: QuestionTypeId.TEXT, name: 'Short Text', description: 'Single line text input' },
  { id: QuestionTypeId.TEXTAREA, name: 'Long Text', description: 'Multi-line text input' },
  { id: QuestionTypeId.SINGLE_CHOICE, name: 'Single Choice', description: 'Radio button selection' },
  { id: QuestionTypeId.MULTIPLE_CHOICE, name: 'Multiple Choice', description: 'Checkbox selection' },
  { id: QuestionTypeId.DROPDOWN, name: 'Dropdown', description: 'Dropdown select menu' },
  { id: QuestionTypeId.SCALE, name: 'Scale', description: 'Linear scale rating' },
  { id: QuestionTypeId.DATE, name: 'Date', description: 'Date picker' },
  { id: QuestionTypeId.FILE_UPLOAD, name: 'File Upload', description: 'File upload field' },
  { id: QuestionTypeId.MATRIX, name: 'Matrix', description: 'Grid of options' },
  { id: QuestionTypeId.RANKING, name: 'Ranking', description: 'Drag and drop ranking' },
];

// Helper function to get question type by ID
export const getQuestionTypeById = (typeId: number) => {
  return QUESTION_TYPES.find(type => type.id === typeId) || QUESTION_TYPES[0];
};

// Helper function to check if a question type requires options
export const requiresOptions = (typeId: number) => {
  return [
    QuestionTypeId.SINGLE_CHOICE, 
    QuestionTypeId.MULTIPLE_CHOICE, 
    QuestionTypeId.DROPDOWN,
    QuestionTypeId.SCALE,
    QuestionTypeId.MATRIX,
    QuestionTypeId.RANKING
  ].includes(typeId);
}; 