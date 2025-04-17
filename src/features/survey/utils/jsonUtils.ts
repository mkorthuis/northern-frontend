import { SurveyQuestion, SurveyOption } from '@/store/slices/surveySlice';

/**
 * Parses JSON input string into SurveyQuestion objects
 */
export const parseJSONToQuestions = (jsonInput: string): {
  questions: SurveyQuestion[],
  error: string | null
} => {
  try {
    // Parse the JSON
    let parsed: any;
    try {
      parsed = JSON.parse(jsonInput);
    } catch (e) {
      return {
        questions: [],
        error: 'Invalid JSON format. Please check your input.'
      };
    }
    
    // Validate the structure
    if (!Array.isArray(parsed)) {
      // If it's a single question object, convert to array
      if (parsed && typeof parsed === 'object') {
        parsed = [parsed];
      } else {
        return {
          questions: [],
          error: 'JSON must be an array of questions or a single question object.'
        };
      }
    }
    
    // Validate each question
    const validatedQuestions: SurveyQuestion[] = parsed.map((question: any, index: number) => {
      // Ensure required fields
      if (!question.title) {
        throw new Error(`Question at index ${index} is missing a title`);
      }
      if (typeof question.type_id !== 'number') {
        throw new Error(`Question at index ${index} has an invalid type_id (must be a number)`);
      }
      
      // Create a validated question object
      return {
        title: question.title,
        description: question.description || '',
        is_required: question.is_required || false,
        order_index: question.order_index || index,
        type_id: question.type_id,
        section_id: question.section_id || null,
        validation_rules: question.validation_rules || null,
        display_logic: question.display_logic || null,
        allow_multiple: question.allow_multiple || false,
        max_answers: question.max_answers || null,
        options: Array.isArray(question.options) ? question.options.map((opt: any, optIndex: number) => ({
          text: opt.text || '',
          order_index: opt.order_index || optIndex,
          is_other_option: opt.is_other_option || false,
          score: opt.score || null
        })) : []
      };
    });
    
    return {
      questions: validatedQuestions,
      error: null
    };
  } catch (err: any) {
    return {
      questions: [],
      error: err.message || 'Invalid question format. Please check your input.'
    };
  }
};

/**
 * Example JSON for reference in the UI
 */
export const getExampleJson = (): string => {
  return `[
  {
    "title": "What is your name?",
    "description": "Please enter your full name",
    "is_required": true,
    "type_id": 1,
    "order_index": 0
  },
  {
    "title": "Which options apply to you?",
    "is_required": true,
    "type_id": 4,
    "order_index": 1,
    "allow_multiple": true,
    "options": [
      { "text": "Option 1", "order_index": 0 },
      { "text": "Option 2", "order_index": 1 },
      { "text": "Other", "order_index": 2, "is_other_option": true }
    ]
  }
]`;
}; 