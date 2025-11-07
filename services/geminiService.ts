
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Faculty, Room, Program, GeneratedTimetable } from '../types';
import { DAYS_OF_WEEK, TIME_SLOTS, LUNCH_BREAK_SLOT } from '../constants';

// Defer client initialization to avoid app crash if API KEY is missing
let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
    if (!ai) {
        // --- FOR LOCAL TESTING ONLY ---
        // IMPORTANT: Hardcoding API keys is a major security risk. 
        // This is done for immediate local testing. In a real application, 
        // you should use environment variables (e.g., process.env.API_KEY) 
        // and never commit keys to version control.
        const API_KEY = "AIzaSyCK3BHXqCFB90NFyYe_6hquh751i7dMg1c";

        if (!API_KEY) {
            throw new Error("API_KEY is not set. Please add your API key here for local testing.");
        }
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
}


const timetableSchema = {
    type: Type.OBJECT,
    properties: {
        timetable: {
            type: Type.ARRAY,
            description: "The generated weekly timetable.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "Day of the week (e.g., Monday)." },
                    timeSlot: { type: Type.STRING, description: "Time slot (e.g., 09:00-10:00)." },
                    courseCode: { type: Type.STRING, description: "The course code." },
                    facultyName: { type: Type.STRING, description: "The name of the assigned faculty." },
                    roomName: { type: Type.STRING, description: "The name of the assigned room." },
                    program: { type: Type.STRING, description: "The program/student group attending." },
                },
                required: ["day", "timeSlot", "courseCode", "facultyName", "roomName", "program"],
            },
        },
    },
    required: ["timetable"],
};


export const generateTimetableWithGemini = async (
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    programs: Program[]
): Promise<GeneratedTimetable> => {
    const prompt = `
        You are an expert AI assistant specializing in academic scheduling for multidisciplinary universities under the NEP 2020 framework. Your task is to generate a conflict-free, optimized weekly timetable.

        **Input Data:**

        *   **Courses:** ${JSON.stringify(courses, null, 2)}
        *   **Faculty:** ${JSON.stringify(faculty, null, 2)}
        *   **Rooms:** ${JSON.stringify(rooms, null, 2)}
        *   **Programs/Student Groups:** ${JSON.stringify(programs, null, 2)}
        *   **Schedule Structure:**
            *   Days: ${DAYS_OF_WEEK.join(', ')}
            *   Time Slots: ${TIME_SLOTS.join(', ')}

        **CRITICAL CONSTRAINTS:**

        1.  **Campus-Wide Lunch Break:** The time slot **${LUNCH_BREAK_SLOT}** is a mandatory, campus-wide lunch break for everyone. You MUST NOT schedule any classes in this time slot on any day.
        2.  **No Conflicts:** A single faculty member, room, or program/student group cannot be scheduled for more than one class in the same time slot on the same day.
        3.  **Faculty Unavailability:** The 'unavailableSlots' field for a faculty member lists specific days and times they are NOT available (e.g., "Monday_10:00-11:00"). You MUST respect these constraints and not schedule them during these times.
        4.  **Faculty Expertise:** Assign faculty to courses only if the course's subject matches one of the faculty's expertise areas.
        5.  **Credit Hours:** Schedule each course for the number of hours per week specified by its 'credits' field (1 credit = 1 hour/week).
        6.  **Room Type:** 'Practical' courses MUST be in 'Lab' rooms. 'Theory' courses MUST be in 'Lecture Hall' rooms.
        7.  **Distribution:** Distribute classes for each program throughout the week to avoid overloading any single day. Try to avoid large gaps for a single program on any given day.
        8.  **Completeness:** You MUST schedule all courses for all programs according to their credit hours. If a course has 3 credits, it must appear 3 times in the schedule for its program.

        Generate a complete and valid timetable in the specified JSON format, adhering strictly to all constraints.
    `;

    try {
        const aiInstance = getAiInstance();
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: timetableSchema,
                temperature: 0.2,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (parsedJson && parsedJson.timetable) {
            return parsedJson.timetable as GeneratedTimetable;
        } else {
            throw new Error("Invalid timetable format received from AI.");
        }

    } catch (error) {
        console.error("Error generating timetable:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate timetable: ${error.message}`);
        }
        throw new Error("Failed to generate timetable due to an unknown error. Please check your inputs or try again.");
    }
};
