import { SurveyQuestion, SurveyOption } from '@/store/slices/surveySlice';
import { QuestionTypeId } from '@/constants/questionTypes';

/**
 * Parses a CSV row, handling quoted fields with commas and escaped quotes
 */
export const parseCSVRow = (row: string): string[] => {
  const result: string[] = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      // Check if it's an escaped quote (double quote inside quoted field)
      if (inQuotes && i + 1 < row.length && row[i + 1] === '"') {
        cell += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  
  // Add the last cell
  result.push(cell.trim());
  
  return result;
};

/**
 * Determines the appropriate question type ID based on response options and chart type
 */
export const determineQuestionTypeId = (responseOptions: string, chartType: string): number => {
  if (!responseOptions) return QuestionTypeId.TEXT;
  
  // First, split the options handling quoted values with commas
  let optionsText = responseOptions;
  if (optionsText.startsWith('"') && optionsText.endsWith('"')) {
    optionsText = optionsText.substring(1, optionsText.length - 1);
  }
  
  // Split by commas and newlines, then clean
  const options = optionsText
    .split(/,|\n/)
    .map(o => o.trim())
    .filter(Boolean);
  
  // Check for Likert scales (agree/disagree patterns)
  const likertPatterns = ['agree', 'disagree', 'strongly', 'somewhat', 'neither'];
  const isLikertScale = options.some(o => 
    likertPatterns.some(pattern => o.toLowerCase().includes(pattern))
  );
  
  if (isLikertScale) {
    return QuestionTypeId.SINGLE_CHOICE;
  }
  
  // Frequency patterns
  const frequencyPatterns = ['daily', 'weekly', 'monthly', 'never', 'times a', 'frequently', 'often'];
  const isFrequencyScale = options.some(o => 
    frequencyPatterns.some(pattern => o.toLowerCase().includes(pattern))
  );
  
  if (isFrequencyScale) {
    return QuestionTypeId.SINGLE_CHOICE;
  }
  
  // Chart type based determination
  if (chartType === 'pie') {
    return QuestionTypeId.SINGLE_CHOICE;
  }
  
  if (chartType === 'horizontalBar') {
    // Horizontal bar charts often represent multiple choice questions
    return QuestionTypeId.MULTIPLE_CHOICE;
  }
  
  if (chartType === 'bar') {
    // Regular bar charts can be single choice or dropdown depending on options count
    return options.length > 6 ? QuestionTypeId.DROPDOWN : QuestionTypeId.SINGLE_CHOICE;
  }
  
  // Default based on number of options
  if (options.length > 7) {
    return QuestionTypeId.DROPDOWN;
  } else if (options.length > 1) {
    return QuestionTypeId.SINGLE_CHOICE;
  }
  
  return QuestionTypeId.TEXT;
};

/**
 * Splits a CSV text into rows, properly handling quoted fields with newlines
 */
export const splitCSVIntoRows = (text: string): string[] => {
  let inQuotedField = false;
  let currentRow = '';
  const rows: string[] = [];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '"') {
      // Check for escaped quotes
      if (inQuotedField && i + 1 < text.length && text[i + 1] === '"') {
        currentRow += '"';
        i++; // Skip the next quote
      } else {
        inQuotedField = !inQuotedField;
        currentRow += char;
      }
    } else if (char === '\n' && !inQuotedField) {
      // End of row
      rows.push(currentRow);
      currentRow = '';
    } else {
      currentRow += char;
    }
  }
  
  // Add the last row if there's content
  if (currentRow.trim()) {
    rows.push(currentRow);
  }
  
  return rows;
};

/**
 * Maps CSV header names to their indices, accounting for case differences
 */
export const mapHeaderKeys = (headers: { [key: string]: number }): { [key: string]: string } => {
  const headerKeys: { [key: string]: string } = {};
  
  Object.keys(headers).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'question_id') headerKeys['question_id'] = key;
    if (lowerKey === 'question_text') headerKeys['question_text'] = key;
    if (lowerKey === 'response_options') headerKeys['response_options'] = key;
    if (lowerKey === 'chart_type') headerKeys['chart_type'] = key;
    if (lowerKey === 'question_topic_name') headerKeys['question_topic_name'] = key;
    if (lowerKey === 'combine_options') headerKeys['combine_options'] = key;
    if (lowerKey === 'report_segments') headerKeys['report_segments'] = key;
  });
  
  return headerKeys;
};

/**
 * Cleans response options by removing extra quotes and handling newlines
 */
export const cleanResponseOptions = (responseOptions: string): string => {
  return responseOptions
    .replace(/^"/, '') // Remove starting quote
    .replace(/"$/, '') // Remove ending quote
    .replace(/\\n/g, '\n') // Convert escaped newlines to actual newlines
    .replace(/""/, '"'); // Convert double quotes to single quotes
};

/**
 * Creates an example CSV content for the sample download
 */
export const getSampleCSVContent = (): string => {
  return `question_id,question_text,response_options,chart_type,sort_by_value,combine_options,question_topic_name,report_segments,question_topic_ordering
Q4,Do you follow alcohol brands on social media?,"Strongly agree,
Somewhat agree,
Neither agree nor disagree,
Somewhat disagree,
Strongly disagree",bar,FALSE,"Agree = Strongly disagree,
Somewhat disagree;
Neither agree nor disagree;
Disagree =Strongly disagree,
Somewhat disagree",Advertising,All Alcohol,3
Q8,Do you go to bars to celebrate big events?,"Strongly agree,
Somewhat agree,
Neither agree nor disagree,
Somewhat disagree,
Strongly disagree",bar,FALSE,"Agree = Strongly disagree,
Somewhat disagree;
Neither agree nor disagree;
Disagree =Strongly disagree,
Somewhat disagree",Attitudes,All Alcohol,2
Q13,What beer format do you prefer at bars?,"Draft beer,
Bottled beer,
Canned beer",pie,FALSE,,Attitudes,Beer,2`;
};

/**
 * Parses a CSV file text into an array of survey questions
 */
export const parseCSVToQuestions = (text: string): { 
  questions: SurveyQuestion[],
  error: string | null 
} => {
  try {
    // Split into rows
    const rows = splitCSVIntoRows(text);
    
    // Parse header row
    const headerRow = parseCSVRow(rows[0]);
    const headers: { [key: string]: number } = {};
    
    headerRow.forEach((header, index) => {
      headers[header.trim()] = index;
    });
    
    // Validate CSV structure
    const requiredHeaders = ['question_id', 'question_text', 'response_options'];
    const missingHeaders = requiredHeaders.filter(header => 
      !Object.keys(headers).some(key => key.toLowerCase() === header.toLowerCase())
    );
    
    if (missingHeaders.length > 0) {
      return {
        questions: [],
        error: `CSV is missing required headers: ${missingHeaders.join(', ')}`
      };
    }
    
    // Map header keys to their actual case in the CSV
    const headerKeys = mapHeaderKeys(headers);
    
    // Parse data rows
    const questions: SurveyQuestion[] = [];
    let lastOrderIndex = 0;
    
    for (let i = 1; i < rows.length; i++) {
      // Skip empty rows
      if (!rows[i].trim()) continue;
      
      // Parse the row
      const rowData = parseCSVRow(rows[i]);
      
      if (rowData.length <= 1) continue; // Skip rows with insufficient data
      
      const questionId = rowData[headers[headerKeys['question_id']]]?.trim();
      const questionText = rowData[headers[headerKeys['question_text']]]?.trim();
      let responseOptions = rowData[headers[headerKeys['response_options']]]?.trim() || '';
      const chartType = headerKeys['chart_type'] ? rowData[headers[headerKeys['chart_type']]]?.trim() : '';
      const questionTopic = headerKeys['question_topic_name'] ? rowData[headers[headerKeys['question_topic_name']]]?.trim() : '';
      const reportSegment = headerKeys['report_segments'] ? rowData[headers[headerKeys['report_segments']]]?.trim() : '';
      
      // Skip if no question text
      if (!questionText) continue;
      
      // Clean up response options
      responseOptions = cleanResponseOptions(responseOptions);
      
      // Determine the question type
      const typeId = determineQuestionTypeId(responseOptions, chartType);
      
      // Parse response options into question options
      const options: SurveyOption[] = [];
      if (responseOptions) {
        // Split by commas or newlines
        const optionTexts = responseOptions
          .split(/,|\n/)
          .map(opt => opt.trim())
          .filter(Boolean);
        
        optionTexts.forEach((optText, optIndex) => {
          options.push({
            text: optText,
            order_index: optIndex,
            is_other_option: optText.toLowerCase().includes('other'),
            score: null
          });
        });
      }
      
      // Create the question object
      const question: SurveyQuestion = {
        title: questionText,
        description: [
          questionId ? `ID: ${questionId}` : '',
          questionTopic ? `Topic: ${questionTopic}` : '',
          reportSegment ? `Segment: ${reportSegment}` : '',
          chartType ? `Chart Type: ${chartType}` : ''
        ].filter(Boolean).join(' | '),
        is_required: true, // Default to required
        order_index: lastOrderIndex++,
        type_id: typeId,
        section_id: null,
        allow_multiple: typeId === QuestionTypeId.MULTIPLE_CHOICE,
        options: options
      };
      
      questions.push(question);
    }
    
    if (questions.length === 0) {
      return {
        questions: [],
        error: 'No valid questions found in the CSV'
      };
    }
    
    return {
      questions,
      error: null
    };
  } catch (err: any) {
    console.error('Error processing CSV:', err);
    return {
      questions: [],
      error: `Error processing CSV: ${err.message || 'Unknown error'}`
    };
  }
};

/**
 * Triggers download of a CSV file with the provided content
 */
export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 