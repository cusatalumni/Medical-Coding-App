import type { User, Question, UserAnswer, TestResult, CertificateData } from '../types';

// =================================================================================
// IMPORTANT: This URL points to your Google Apps Script backend.
// =================================================================================
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXqF1MDK_AKczFVOKAv6by4C1N8Gu-arJmp8gpyOg/dev';

// --- HELPER FUNCTIONS ---
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown network error occurred.' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'An unknown script error occurred.');
    }
    return result.data;
};

const postRequest = async (action: string, payload: any) => {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });
    return handleResponse(response);
};

const getRequest = async (params: URLSearchParams) => {
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
    });
    return handleResponse(response);
}

// =================================================================
// API FUNCTIONS (Connected to Google Apps Script)
// =================================================================

export const googleSheetsService = {
    login: async (email: string, password: string): Promise<User> => {
        return postRequest('login', { email, password });
    },

    signup: async (name: string, email: string, password: string): Promise<User> => {
        return postRequest('signup', { name, email, password });
    },

    getQuestions: async (testType: 'free' | 'paid'): Promise<Question[]> => {
        const params = new URLSearchParams({ action: 'getQuestions', testType });
        return getRequest(params);
    },

    submitTest: async (userId: string, answers: UserAnswer[], testType: 'free' | 'paid'): Promise<TestResult> => {
        return postRequest('submitTest', { userId, answers, testType });
    },

    getTestResult: async (testId: string, userId: string): Promise<TestResult> => {
        const params = new URLSearchParams({ action: 'getTestResult', testId, userId });
        return getRequest(params);
    },

    getCertificateData: async (testId: string, user: User): Promise<CertificateData | null> => {
        const result = await googleSheetsService.getTestResult(testId, user.id);

        if (result && result.testType === 'paid' && result.score >= 60) {
            return {
                certificateNumber: `CERT-${result.timestamp}`,
                candidateName: user.name,
                finalScore: result.score,
                date: new Date(result.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                }),
                totalQuestions: result.totalQuestions,
            };
        }
        return null;
    },
};