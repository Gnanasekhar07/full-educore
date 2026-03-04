import api from './api';

export const authService = {
    async login(credentials: any) {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('role', response.data.user.role);
        }
        return response.data;
    },

    async register(userData: any) {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('role', response.data.user.role);
        }
        return response.data;
    },

    async googleLogin(credential: string) {
        const response = await api.post('/auth/google', { credential });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('role', response.data.user.role);
        }
        return response.data;
    },

    async forgotPassword(email: string) {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    async updateProfile(data: { name: string }) {
        const response = await api.put('/auth/profile', data);
        if (response.data.user) {
            const current = JSON.parse(localStorage.getItem('user') || '{}');
            const updated = { ...current, ...response.data.user };
            localStorage.setItem('user', JSON.stringify(updated));
        }
        return response.data;
    },

    async changePassword(data: { currentPassword: string; newPassword: string }) {
        const response = await api.put('/auth/change-password', data);
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

export const courseService = {
    async getAllCourses() {
        const response = await api.get('/courses');
        return response.data;
    },

    async getCourseById(id: string) {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    },

    async createCourse(courseData: any) {
        const response = await api.post('/courses', courseData);
        return response.data;
    },

    async updateCourse(id: string, courseData: any) {
        const response = await api.put(`/courses/${id}`, courseData);
        return response.data;
    },

    async deleteCourse(id: string) {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    }
};

export const enrollmentService = {
    enroll: async (courseId: string) => {
        const response = await api.post('/enrollments', { courseId });
        return response.data;
    },
    getMyCourses: async () => {
        const response = await api.get('/enrollments/my-courses');
        return response.data;
    },
    getMyPerformance: async () => {
        const response = await api.get('/enrollments/my-performance');
        return response.data;
    },
    getCourseStudents: async (courseId: string) => {
        const response = await api.get(`/enrollments/course/${courseId}/students`);
        return response.data;
    },
    addStudentToCourse: async (courseId: string, email: string) => {
        const response = await api.post(`/enrollments/course/${courseId}/add-student`, { email });
        return response.data;
    }
};

export const quizService = {
    async createQuiz(quizData: any) {
        const response = await api.post('/quizzes', quizData);
        return response.data;
    },

    async getUpcomingQuizzes() {
        const response = await api.get('/quizzes/upcoming');
        return response.data;
    },

    async getQuizzesByCourse(courseId: string) {
        const response = await api.get(`/quizzes/course/${courseId}`);
        return response.data;
    },

    async getQuizById(id: string) {
        const response = await api.get(`/quizzes/${id}`);
        return response.data;
    },

    async submitAttempt(quizId: string, attemptData: any) {
        const response = await api.post('/quizzes/submit', { quizId, ...attemptData });
        return response.data;
    }
};

export const announcementService = {
    async getAllAnnouncements() {
        const response = await api.get('/announcements');
        return response.data;
    },

    async getAnnouncementsByCourse(courseId: string) {
        const response = await api.get(`/announcements/course/${courseId}`);
        return response.data;
    },

    async createAnnouncement(announcementData: any) {
        const response = await api.post('/announcements', announcementData);
        return response.data;
    },

    async deleteAnnouncement(id: string) {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
    }
};
