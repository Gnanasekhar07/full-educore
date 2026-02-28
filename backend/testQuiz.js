import fs from 'fs';

async function testQuizCreate() {
    try {
        // Read auth token from frontend local storage
        const storageData = fs.readFileSync('C:\\Users\\gnana\\OneDrive\\Desktop\\KLU\\projects-gnana\\educore\\frontend\\localStorage.json', 'utf8');
        const token = JSON.parse(storageData).token;

        // Fetch courses to get a courseId
        const coursesResponse = await fetch('http://localhost:5000/courses', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const courses = await coursesResponse.json();

        if (!courses || courses.length === 0) {
            console.log("No courses found for teacher.");
            return;
        }

        const courseId = courses[0].id;
        console.log(`Using courseId: ${courseId}`);

        // Try creating a quiz
        const payload = {
            title: "Diagnosing Prisma Issue",
            courseId: courseId,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000).toISOString(), // +1 day
            timeLimit: 10,
            questions: [
                {
                    text: 'What is 2+2?',
                    options: ['3', '4', '5', '6'],
                    correctAnswer: 1
                }
            ]
        };

        const createResponse = await fetch('http://localhost:5000/quizzes', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await createResponse.json();
        console.log("Response Status:", createResponse.status);
        console.log("Response Data:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Test script error:", e);
    }
}

testQuizCreate();
