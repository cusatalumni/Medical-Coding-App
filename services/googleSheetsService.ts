
import type { User, Question, UserAnswer, TestResult, CertificateData } from '../types';

// =================================================================
// MOCK DATABASE - Users and Results are still mocked.
// =================================================================
const mockUsers: User[] = [
    { id: 'user-001', name: 'John Doe', email: 'john@example.com' }
];

// A mock to store test results
export const mockTestResults: TestResult[] = [];


// =================================================================
// LIVE QUESTION BANK - Fetches from Google Sheets
// =================================================================

// URL for the published Google Sheet as a CSV
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMFALpdYSsjcnERF1wOpcnIT2qrRAZoyJYzc5T8_xq_Q3eQjAJJH30iDMMlO2tKhIYYKdOVBiPqF3Y/pub?gid=743667979&single=true&output=csv';

// Cache for the questions to avoid re-fetching on every test start.
let cachedQuestions: Question[] | null = null;

// Fetches and parses questions from the Google Sheet URL.
const fetchAndParseQuestions = async (): Promise<Question[]> => {
    // Return from cache if available
    if (cachedQuestions) {
        return cachedQuestions;
    }

    try {
        // Add a cache-busting parameter to prevent the browser from serving a stale file.
        const response = await fetch(`${GOOGLE_SHEET_URL}&_=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch question sheet: ${response.statusText}`);
        }

        // Verify the content type to make sure we got a CSV file.
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/csv')) {
            console.error(`Expected CSV content, but got '${contentType}'. Check the Google Sheet URL and ensure it's published correctly as a CSV.`);
            throw new Error('Received incorrect file type. Please check the publish settings.');
        }

        const csvText = await response.text();

        // Use a more robust newline split, remove header, and filter out empty lines.
        const lines = csvText.trim().split(/\r\n|\r|\n/).slice(1).filter(line => line.trim() !== '');

        const questions: Question[] = lines.map((line, index) => {
            try {
                // This regex splits a CSV line by commas, but ignores commas inside double quotes.
                const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                
                //
                // === FIX ===
                // Changed the check from !== 3 to < 3.
                // This allows rows to have extra empty columns (a common artifact from Google Sheets)
                // without causing a parsing error.
                //
                if (columns.length < 3) {
                    console.warn(`Skipping malformed CSV line (expected at least 3 columns, got ${columns.length}) on line ${index + 2}: ${line}`);
                    return null;
                }

                // Trim, unquote, and un-escape quotes for each column.
                const questionStr = columns[0].trim().replace(/^"|"$/g, '').replace(/""/g, '"');
                const optionsStr = columns[1].trim().replace(/^"|"$/g, '').replace(/""/g, '"');
                const correctAnswerStr = columns[2].trim().replace(/^"|"$/g, '');

                if (!questionStr || !optionsStr || !correctAnswerStr) {
                    console.warn(`Skipping malformed CSV line (empty column) on line ${index + 2}: ${line}`);
                    return null;
                }
                
                const correctAnswerNum = parseInt(correctAnswerStr, 10);
                if (isNaN(correctAnswerNum)) {
                     console.warn(`Skipping malformed CSV line (invalid answer number) on line ${index + 2}: ${line}`);
                    return null;
                }

                const options = optionsStr.split('|');
                if (options.length < 2) {
                     console.warn(`Skipping malformed CSV line (not enough options) on line ${index + 2}: ${line}`);
                    return null;
                }

                return {
                    id: index + 1, // Simple ID based on row number
                    question: questionStr,
                    options: options,
                    correctAnswer: correctAnswerNum,
                };

            } catch(e) {
                console.warn(`Error parsing line ${index + 2}: ${line}`, e);
                return null;
            }
        }).filter((q): q is Question => q !== null);


        if (questions.length === 0) {
            console.error("The fetched CSV file might be empty, malformed, or not publicly accessible. Check the Google Sheet sharing settings.");
            throw new Error("No questions could be parsed from the sheet.");
        }

        cachedQuestions = questions; // Cache the result
        return cachedQuestions;
    } catch (error) {
        console.error("Error fetching or parsing questions:", error);
        // Throw the error so the UI can handle it
        throw error;
    }
};


// =================================================================
// API FUNCTIONS - These simulate calls to a Google Apps Script backend.
// =================================================================

// Utility to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const googleSheetsService = {
    login: async (email: string, _password:string): Promise<User> => {
        await delay(500);
        const user = mockUsers.find(u => u.email === email);
        if (user) {
            // In a real app, you would also save the login time to the sheet
            console.log(`Simulating login for ${email} at ${new Date().toISOString()}`);
            return user;
        }
        throw new Error("User not found or password incorrect.");
    },

    signup: async (name: string, email: string, _password: string): Promise<User> => {
        await delay(500);
        if (mockUsers.some(u => u.email === email)) {
            throw new Error("User with this email already exists.");
        }
        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            email
        };
        mockUsers.push(newUser);
        // In a real app, you would save the new user to the sheet
        console.log(`Simulating signup for ${name} (${email}) at ${new Date().toISOString()}`);
        return newUser;
    },

    getQuestions: async (testType: 'free' | 'paid'): Promise<Question[]> => {
        // Fetch questions from the live Google Sheet
        const allQuestions = await fetchAndParseQuestions();

        if (allQuestions.length === 0) {
            return []; // Return empty array if fetch or parse fails
        }
        
        const count = testType === 'free' ? 10 : 10;
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        // In a real CPC exam, proportions matter. This is a simplified random selection.
        return shuffled.slice(0, Math.min(count, allQuestions.length));
    },

    submitTest: async (userId: string, answers: UserAnswer[], testType: 'free' | 'paid'): Promise<TestResult> => {
        await delay(1000);
        
        // Submitting needs the original questions to check answers.
        // We ensure they are fetched and available.
        const allQuestions = cachedQuestions || await fetchAndParseQuestions();
        if (allQuestions.length === 0) {
            throw new Error("Could not retrieve questions to grade the test.");
        }
        
        let correctCount = 0;
        const review: TestResult['review'] = [];

        answers.forEach(userAnswer => {
            const question = allQuestions.find(q => q.id === userAnswer.questionId);
            if (question) {
                // The stored correctAnswer is 1-based, our answer index is 0-based
                if ((userAnswer.answer + 1) === question.correctAnswer) {
                    correctCount++;
                }
                review.push({
                    questionId: question.id,
                    question: question.question,
                    options: question.options,
                    userAnswer: userAnswer.answer,
                    correctAnswer: question.correctAnswer - 1
                });
            }
        });

        const totalQuestions = answers.length;
        const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

        const newResult: TestResult = {
            testId: `test-${Date.now()}`,
            userId,
            testType,
            answers,
            score: parseFloat(score.toFixed(2)),
            correctCount,
            totalQuestions,
            timestamp: Date.now(),
            review
        };

        mockTestResults.push(newResult);
        // In a real app, you would save the result to the sheet.
        console.log("Simulating test submission and saving to sheet:", newResult);
        return newResult;
    },

    getCertificateData: async (testId: string, user: User): Promise<CertificateData | null> => {
        await delay(500);
        const result = mockTestResults.find(r => r.testId === testId && r.userId === user.id);

        if (result && result.testType === 'paid' && result.score >= 60) {
            console.log(`Generating certificate for test ${testId}`);
            const certData: CertificateData = {
                certificateNumber: `CERT-${result.timestamp}`,
                candidateName: user.name,
                finalScore: result.score,
                date: new Date(result.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                totalQuestions: result.totalQuestions,
            };
            return certData;
        }

        console.log(`Certificate not available for test ${testId}`);
        return null;
    },
};
