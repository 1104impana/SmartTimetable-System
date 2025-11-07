import React, { useState, useMemo } from 'react';
import { TimetableEntry, Program, Faculty, Room, Role } from '../types';
import { DAYS_OF_WEEK, TIME_SLOTS, LUNCH_BREAK_SLOT } from '../constants';
import * as XLSX from 'xlsx';
import { DownloadIcon } from './icons/DownloadIcon';


interface TimetableDisplayProps {
  timetable: TimetableEntry[];
  programs: Program[];
  faculty: Faculty[];
  rooms: Room[];
  userRole: Role;
}

const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ timetable, programs, faculty, rooms, userRole }) => {
  const [filterType, setFilterType] = useState('program');
  const [filterValue, setFilterValue] = useState('');

  const handleDownloadExcel = () => {
      const wb = XLSX.utils.book_new();
      const ws_data: (string | null)[][] = [];

      // Header row
      const header = ["Time", ...DAYS_OF_WEEK];
      ws_data.push(header);

      // Data rows
      TIME_SLOTS.forEach(slot => {
          if (slot === LUNCH_BREAK_SLOT) {
              ws_data.push([slot, "LUNCH BREAK"]); // Merged cell placeholder
          } else {
              const row: (string | null)[] = [slot];
              DAYS_OF_WEEK.forEach(day => {
                  const entries = timetable.filter(e => e.day === day && e.timeSlot === slot);
                  const cellContent = entries.map(e => `${e.courseCode} (${e.program})\n${e.facultyName}\n@${e.roomName}`).join('\n\n');
                  row.push(cellContent || null);
              });
              ws_data.push(row);
          }
      });
      
      const ws = XLSX.utils.aoa_to_sheet(ws_data);

      // Add merges for lunch break
      if (!ws['!merges']) ws['!merges'] = [];
      const lunchRowIndex = TIME_SLOTS.indexOf(LUNCH_BREAK_SLOT);
      if (lunchRowIndex !== -1) {
          ws['!merges'].push({ s: { r: lunchRowIndex + 1, c: 1 }, e: { r: lunchRowIndex + 1, c: DAYS_OF_WEEK.length } });
      }

      // Auto-fit columns and set text wrapping
      const cols = header.map((_, colIndex) => {
          const maxWidth = ws_data.reduce((w, r) => Math.max(w, r[colIndex]?.length || 0), 10);
          return { wch: Math.min(maxWidth, 40), s: { wrapText: true } };
      });
      ws['!cols'] = cols;

      XLSX.utils.book_append_sheet(wb, ws, "Timetable");
      XLSX.writeFile(wb, "timetable.xlsx");
  };

  const filteredTimetable = useMemo(() => {
    if (!filterValue) return timetable;
    return timetable.filter(entry => {
      switch (filterType) {
        case 'program':
          return entry.program === filterValue;
        case 'faculty':
          return entry.facultyName === filterValue;
        case 'room':
          return entry.roomName === filterValue;
        default:
          return true;
      }
    });
  }, [timetable, filterType, filterValue]);

  const timetableGrid = useMemo(() => {
    const grid: { [key: string]: TimetableEntry[] } = {};
    filteredTimetable.forEach(entry => {
      const key = `${entry.day}-${entry.timeSlot}`;
      if (!grid[key]) {
        grid[key] = [];
      }
      grid[key].push(entry);
    });
    return grid;
  }, [filteredTimetable]);

  const getCellColor = (courseCode: string) => {
    let hash = 0;
    for (let i = 0; i < courseCode.length; i++) {
        hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 90%, 92%)`;
    return color;
  };
  
  if (!timetable || timetable.length === 0) {
    return (
      <div className="mt-8 text-center p-12 bg-white rounded-xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700">Your Timetable Awaits</h2>
        <p className="text-gray-500 mt-2">
            {userRole === 'Admin' 
              ? 'Add your data and click "Generate Timetable" to see the magic happen!'
              : 'The timetable has not been generated yet. Please check back later.'
            }
        </p>
        <div className="mt-6 text-5xl text-gray-300">📅</div>
      </div>
    );
  }

  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <select 
        value={filterType} 
        onChange={e => {
          setFilterType(e.target.value);
          setFilterValue('');
        }}
        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="program">Program</option>
        <option value="faculty">Faculty</option>
        <option value="room">Room</option>
      </select>
      <select 
        value={filterValue} 
        onChange={e => setFilterValue(e.target.value)}
        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        disabled={!filterType}
      >
        <option value="">Show All</option>
        {filterType === 'program' && programs.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
        {filterType === 'faculty' && faculty.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
        {filterType === 'room' && rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
      </select>
      {userRole === 'Admin' && (
        <button onClick={handleDownloadExcel} className="bg-gray-700 text-white p-2 rounded-md hover:bg-gray-800 flex items-center transition-colors">
          <DownloadIcon />
          Download Excel
        </button>
      )}
    </div>
  );

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-gray-800">Generated Timetable</h2>
            {renderFilters()}
        </div>
      <div className="overflow-x-auto">
        <div className="grid gap-px bg-gray-200" style={{ gridTemplateColumns: `minmax(100px, 1fr) repeat(${DAYS_OF_WEEK.length}, minmax(150px, 1fr))` }}>
          <div className="bg-gray-100 p-3 font-semibold text-gray-600 text-center sticky left-0 z-10">Time</div>
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="bg-gray-100 p-3 font-semibold text-gray-600 text-center">{day}</div>
          ))}
          
          {TIME_SLOTS.map(slot => {
            if (slot === LUNCH_BREAK_SLOT) {
              return (
                <React.Fragment key={slot}>
                  <div className="bg-gray-100 p-3 font-semibold text-gray-600 text-center sticky left-0 z-10">{slot}</div>
                  <div 
                    className="bg-gray-200 p-3 font-semibold text-gray-700 text-center italic" 
                    style={{ gridColumn: `span ${DAYS_OF_WEEK.length}` }}
                  >
                    LUNCH BREAK
                  </div>
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={slot}>
                <div className="bg-gray-100 p-3 font-semibold text-gray-600 text-center sticky left-0 z-10">{slot}</div>
                {DAYS_OF_WEEK.map(day => {
                  const key = `${day}-${slot}`;
                  const entries = timetableGrid[key] || [];
                  return (
                    <div key={day} className="bg-white p-2 min-h-[100px] flex flex-col gap-1">
                      {entries.map((entry, index) => (
                         <div key={index} className="p-2 rounded-md text-xs leading-tight" style={{backgroundColor: getCellColor(entry.courseCode)}}>
                           <p className="font-bold">{entry.courseCode}</p>
                           <p>{entry.program}</p>
                           <p className="text-gray-600">{entry.facultyName}</p>
                           <p className="text-gray-500 italic">@{entry.roomName}</p>
                         </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default TimetableDisplay;