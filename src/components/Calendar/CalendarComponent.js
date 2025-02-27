import axios from "axios";
import { format, getDay, parse, startOfWeek } from "date-fns";
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarComponent.css";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [resume, setResume] = useState(null);
  const [aadhar, setAadhar] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    description: "",
    position: "",
    createdBy: "",
    meetingLink: "",
    attachments: [],
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("/calendarfromtoenddate.json");
      console.log("response", response);
      setEvents(
        response.data.map((event) => ({
          id: event.id,
          title: event.summary,
          start: new Date(event.start),
          end: new Date(event.end),
          description: `Interviewer: ${event.user_det.handled_by.firstName} ${event.user_det.handled_by.lastName}`,
          position: event.job_id.jobRequest_Title,
          createdBy: event.created_by || "-",
          meetingLink: event.link || "",
          attachments: event.attachments || [],
        }))
      );
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (type === "resume") {
      setResume(file);
    } else if (type === "aadhar") {
      setAadhar(file);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newEventObj = {
      ...newEvent,
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
    };
    setEvents([...events, newEventObj]);
    setShowForm(false);
    setNewEvent({
      title: "",
      start: "",
      end: "",
      description: "",
      position: "",
      createdBy: "",
      meetingLink: "",
      attachments: [],
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>YOURS TODO'S</h2>
        <button className="create-schedule" onClick={() => setShowForm(true)}>
          + New Schedule
        </button>
      </div>

      {showForm && (
        <div className="schedule-form">
          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              required
            />
            <input
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) =>
                setNewEvent({ ...newEvent, start: e.target.value })
              }
              required
            />
            <input
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) =>
                setNewEvent({ ...newEvent, end: e.target.value })
              }
              required
            />
            <button type="submit">Save</button>
          </form>
        </div>
      )}

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleEventClick}
        view={view}
        onView={setView}
        date={currentDate}
        onNavigate={setCurrentDate}
      />

      {selectedEvent && (
        <div className="event-modal">
          <div className="modal-content">
            <button
              className="close-button"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>
            <h3>Interview With: {selectedEvent.description}</h3>
            <p>
              <strong>Position:</strong> {selectedEvent.position}
            </p>
            <p>
              <strong>Created By:</strong> {selectedEvent.createdBy}
            </p>
            <p>
              <strong>Interview Date:</strong>{" "}
              {format(selectedEvent.start, "dd MMM yyyy")}
            </p>
            <p>
              <strong>Interview Time:</strong>{" "}
              {format(selectedEvent.start, "hh:mm a")} -{" "}
              {format(selectedEvent.end, "hh:mm a")}
            </p>
            {selectedEvent &&
              selectedEvent.meetingLink &&
              selectedEvent.meetingLink.trim() !== "" && (
                <div className="meet-section">
                  <img src="googlemeet.jpeg" alt="Google Meet" width="50" />
                  <a
                    href={selectedEvent.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <button
                      className="join-button"
                      style={{ display: "block" }}
                    >
                      JOIN MEETING
                    </button>
                  </a>
                </div>
              )}

            <div className="file-section">
              <label>
                Upload Resume:
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, "resume")}
                />
              </label>
              <label>
                Upload Aadhaar:
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => handleFileChange(e, "aadhar")}
                />
              </label>

              <div className="uploaded-files">
                {resume && (
                  <div className="file-item">
                    <span>{resume.name}</span>
                    <a
                      href={URL.createObjectURL(resume)}
                      download={resume.name}
                    >
                      <button className="download-button">⬇️ Download</button>
                    </a>
                  </div>
                )}
                {aadhar && (
                  <div className="file-item">
                    <span>{aadhar.name}</span>
                    <a
                      href={URL.createObjectURL(aadhar)}
                      download={aadhar.name}
                    >
                      <button className="download-button">⬇️ Download</button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
