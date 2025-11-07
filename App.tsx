
import React, { useState, useCallback } from 'react';
import { Course, Faculty, Room, Program, GeneratedTimetable } from './types';
import InputCard from './components/InputCard';
import TimetableDisplay from './components/TimetableDisplay';
import { generateTimetableWithGemini } from './services/geminiService';
import { PlusIcon } from './components/icons/PlusIcon';
import { BrainCircuitIcon } from './components/icons/BrainCircuitIcon';
import { v4 as uuidv4 } from 'uuid';


// Sample Data
const sampleCourses: Course[] = [
    { id: uuidv4(), code: 'CS101', name: 'Intro to Programming', credits: 3, type: 'Theory', subject: 'Computer Science' },
    { id: uuidv4(), code: 'CS101L', name: 'Intro to Programming Lab', credits: 1, type: 'Practical', subject: 'Computer Science' },
    { id: uuidv4(), code: 'PH102', name: 'Classical Mechanics', credits: 3, type: 'Theory', subject: 'Physics' },
    { id: uuidv4(), code: 'MA101', name: 'Calculus I', credits: 4, type: 'Theory', subject: 'Mathematics' },
];

const sampleFaculty: Faculty[] = [
    { id: uuidv4(), name: 'Dr. Alan Turing', expertise: ['Computer Science', 'Mathematics'], unavailableSlots: "Friday_15:00-16:00, Friday_16:00-17:00" },
    { id: uuidv4(), name: 'Dr. Marie Curie', expertise: ['Physics', 'Chemistry'] },
    { id: uuidv4(), name: 'Dr. Ada Lovelace', expertise: ['Computer Science'], unavailableSlots: "Monday_09:00-10:00" },
];

const sampleRooms: Room[] = [
    { id: uuidv4(), name: 'LH-1', type: 'Lecture Hall', capacity: 60 },
    { id: uuidv4(), name: 'LH-2', type: 'Lecture Hall', capacity: 60 },
    { id: uuidv4(), name: 'CS-Lab', type: 'Lab', capacity: 30 },
];

const samplePrograms: Program[] = [
    { id: uuidv4(), name: 'FYUP-CS', courses: ['CS101', 'CS101L', 'PH102', 'MA101'] },
    { id: uuidv4(), name: 'FYUP-Physics', courses: ['PH102', 'MA101'] },
];

// Define state types for form inputs to enforce union types.
interface NewCourseState {
    code: string;
    name: string;
    credits: string;
    type: 'Theory' | 'Practical';
    subject: string;
}

interface NewFacultyState {
    name: string;
    expertise: string;
    unavailableSlots: string;
}

interface NewRoomState {
    name: string;
    type: 'Lecture Hall' | 'Lab';
    capacity: string;
}

const App: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>(sampleCourses);
    const [faculty, setFaculty] = useState<Faculty[]>(sampleFaculty);
    const [rooms, setRooms] = useState<Room[]>(sampleRooms);
    const [programs, setPrograms] = useState<Program[]>(samplePrograms);

    const [timetable, setTimetable] = useState<GeneratedTimetable>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use the new state types for better type inference and safety.
    const [newCourse, setNewCourse] = useState<NewCourseState>({ code: '', name: '', credits: '1', type: 'Theory', subject: '' });
    const [newFaculty, setNewFaculty] = useState<NewFacultyState>({ name: '', expertise: '', unavailableSlots: '' });
    const [newRoom, setNewRoom] = useState<NewRoomState>({ name: '', type: 'Lecture Hall', capacity: '30' });

    const handleAddCourse = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCourse.code && newCourse.name && newCourse.subject && parseInt(newCourse.credits) > 0) {
            setCourses([...courses, { ...newCourse, id: uuidv4(), credits: parseInt(newCourse.credits) }]);
            setNewCourse({ code: '', name: '', credits: '1', type: 'Theory', subject: '' });
        }
    };

    const handleAddFaculty = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFaculty.name && newFaculty.expertise) {
            const facultyToAdd: Faculty = {
                id: uuidv4(),
                name: newFaculty.name,
                expertise: newFaculty.expertise.split(',').map(s => s.trim()),
            };
            if (newFaculty.unavailableSlots) {
                facultyToAdd.unavailableSlots = newFaculty.unavailableSlots;
            }
            setFaculty([...faculty, facultyToAdd]);
            setNewFaculty({ name: '', expertise: '', unavailableSlots: '' });
        }
    };
    
    const handleAddRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRoom.name && parseInt(newRoom.capacity) > 0) {
            setRooms([...rooms, { ...newRoom, id: uuidv4(), capacity: parseInt(newRoom.capacity) }]);
            setNewRoom({ name: '', type: 'Lecture Hall', capacity: '30' });
        }
    };
    
    const handleDelete = useCallback(<T extends {id: string}>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (id: string) => {
        setter(prev => prev.filter(item => item.id !== id));
    }, []);

    const handleGenerateTimetable = async () => {
        setIsLoading(true);
        setError(null);
        setTimetable([]);
        try {
            const generated = await generateTimetableWithGemini(courses, faculty, rooms, programs);
            setTimetable(generated);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const CourseForm = (
        <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <input value={newCourse.code} onChange={e => setNewCourse({ ...newCourse, code: e.target.value })} placeholder="Course Code (e.g., CS101)" className="p-2 border rounded w-full" required/>
            <input value={newCourse.name} onChange={e => setNewCourse({ ...newCourse, name: e.target.value })} placeholder="Course Name" className="p-2 border rounded w-full" required/>
            <input value={newCourse.subject} onChange={e => setNewCourse({ ...newCourse, subject: e.target.value })} placeholder="Subject" className="p-2 border rounded w-full" required/>
            <input type="number" value={newCourse.credits} onChange={e => setNewCourse({ ...newCourse, credits: e.target.value })} placeholder="Credits" className="p-2 border rounded w-full" min="1" required/>
            {/* Correctly cast select value to the expected union type. */}
            <select value={newCourse.type} onChange={e => setNewCourse({ ...newCourse, type: e.target.value as 'Theory' | 'Practical' })} className="p-2 border rounded w-full">
                <option>Theory</option>
                <option>Practical</option>
            </select>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors w-full"><PlusIcon/> Add Course</button>
        </form>
    );

    const FacultyForm = (
        <form onSubmit={handleAddFaculty} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <input value={newFaculty.name} onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })} placeholder="Faculty Name" className="p-2 border rounded w-full" required/>
             <input value={newFaculty.expertise} onChange={e => setNewFaculty({ ...newFaculty, expertise: e.target.value })} placeholder="Expertise (comma-separated)" className="p-2 border rounded w-full" required/>
             <input value={newFaculty.unavailableSlots} onChange={e => setNewFaculty({ ...newFaculty, unavailableSlots: e.target.value })} placeholder="Unavailable (e.g. Day_Slot,...)" className="p-2 border rounded w-full md:col-span-2"/>
             <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors w-full md:col-span-2"><PlusIcon/> Add Faculty</button>
        </form>
    );
     
    const RoomForm = (
        <form onSubmit={handleAddRoom} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <input value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} placeholder="Room Name (e.g., LH-1)" className="p-2 border rounded w-full" required/>
             <input type="number" value={newRoom.capacity} onChange={e => setNewRoom({ ...newRoom, capacity: e.target.value })} placeholder="Capacity" className="p-2 border rounded w-full" min="1" required/>
             {/* Correctly cast select value to the expected union type. */}
             <select value={newRoom.type} onChange={e => setNewRoom({ ...newRoom, type: e.target.value as 'Lecture Hall' | 'Lab' })} className="p-2 border rounded w-full">
                <option>Lecture Hall</option>
                <option>Lab</option>
             </select>
             <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors w-full"><PlusIcon/> Add Room</button>
        </form>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Timetable Generator</h1>
                    <p className="text-gray-500 mt-1">Optimizing academic schedules with AI, aligned with NEP 2020.</p>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <InputCard title="Courses" items={courses} renderItem={c => <><span className="font-semibold">{c.code}</span>: {c.name} ({c.credits}cr, {c.type})</>} onDelete={handleDelete(setCourses)} formContent={CourseForm} />
                    <InputCard title="Faculty" items={faculty} renderItem={f => (
                        <div>
                            <p><span className="font-semibold">{f.name}</span>: {f.expertise.join(', ')}</p>
                            {f.unavailableSlots && <p className="text-xs text-orange-600">Unavailable: {f.unavailableSlots}</p>}
                        </div>
                    )} onDelete={handleDelete(setFaculty)} formContent={FacultyForm}/>
                    <InputCard title="Rooms" items={rooms} renderItem={r => <><span className="font-semibold">{r.name}</span>: {r.type} (Cap: {r.capacity})</>} onDelete={handleDelete(setRooms)} formContent={RoomForm}/>
                </div>
                
                <div className="text-center my-10">
                    <button 
                        onClick={handleGenerateTimetable}
                        disabled={isLoading}
                        className="bg-green-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center gap-3 mx-auto"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            <>
                                <BrainCircuitIcon/>
                                Generate Timetable with AI
                            </>
                        )}
                    </button>
                    {error && <p className="text-red-600 mt-4 bg-red-100 p-3 rounded-md">{error}</p>}
                </div>
                
                <TimetableDisplay timetable={timetable} programs={programs} faculty={faculty} rooms={rooms} />

            </main>
        </div>
    );
};

export default App;
