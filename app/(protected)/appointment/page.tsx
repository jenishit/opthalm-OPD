import { Button } from "@/components/shadcn/button";
import SectionHeading from "../dashboard/_components/SectionHeading";
import { CalendarCheck, CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Download, Filter, Plus } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { Badge } from "@/components/shadcn/badge";

export default function AppointmentPage() {
  return (
    <>
      <SectionHeading
        eyebrow="DAILY SCHEDULE"
        title="Appointments"
        description="A clear view of your day, from check-in to checkout."
        actions={
          <>
            <Button
              variant="secondary"
              
              onClick={() => notify("Calendar view changed")}
            >
              <CalendarDays />
              Today, 27 May <ChevronDown size={14} />
            </Button>
            <Button  onClick={() => setModal("New appointment")}>
              <Plus />
              Book appointment
            </Button>
          </>
        }
      />
      <div className="stats-grid compact-stats">
        <StatCard
          label="Scheduled today"
          value="12"
          change="3 more"
          foot="than yesterday"
          icon={CalendarDays}
        />
        <StatCard
          label="Checked in"
          value="04"
          change="33%"
          foot="of today's schedule"
          icon={CheckCircle2}
          kind="blue"
        />
        <StatCard
          label="Waiting"
          value="03"
          change="Average 8 min"
          foot="current wait"
          icon={Clock3}
          kind="amber"
        />
        <StatCard
          label="Available slots"
          value="06"
          change="Today"
          foot="open appointments"
          icon={CalendarCheck}
          kind="violet"
        />
      </div>
      <div className="panel schedule-panel">
        <div className="schedule-toolbar">
          <div className="view-switch">
            <button className="selected">Day</button>
            <button onClick={() => notify("Week view selected")}>Week</button>
            <button onClick={() => notify("Month view selected")}>Month</button>
          </div>
          <div className="toolbar-right">
            <Button
              variant="secondary"
              
              onClick={() => notify("Schedule filters opened")}
            >
              <Filter />
              Filter
            </Button>
            <Button
              variant="secondary"
              
              onClick={() => notify("Schedule exported")}
            >
              <Download />
              Export
            </Button>
          </div>
        </div>
        <div className="schedule-date">
          <button className="icon-button">
            <ChevronLeft size={17} />
          </button>
          <h3>Tuesday, 27 May 2025</h3>
          <button className="icon-button">
            <ChevronRight size={17} />
          </button>
          <span className="today-tag">Today</span>
        </div>
        <div className="day-calendar">
          {[
            "09:00 AM",
            "09:30 AM",
            "10:00 AM",
            "10:30 AM",
            "11:00 AM",
            "11:30 AM",
            "12:00 PM",
            "12:30 PM",
          ].map((time, i) => (
            <div className="time-slot" key={time}>
              <span className="time-label">{time}</span>
              <div className="slot-content">
                {i < 5 && (
                  <div className={"calendar-event event-" + i}>
                    <b>
                      {
                        [
                          "Sarah Johnson",
                          "Michael Chen",
                          "Emily Davis",
                          "David Wilson",
                          "Olivia Martinez",
                        ][i]
                      }
                    </b>
                    <span>
                      {
                        [
                          "Comprehensive eye exam",
                          "Refraction",
                          "Follow-up visit",
                          "New patient consultation",
                          "Contact lens fitting",
                        ][i]
                      }
                    </span>
                    <small>
                      {
                        [
                          "Dr. Mitchell",
                          "Dr. Lee",
                          "Dr. Mitchell",
                          "Dr. Lee",
                          "Dr. Mitchell",
                        ][i]
                      }
                    </small>
                    <Badge
                      tone={i === 0 ? "green" : i === 1 ? "amber" : "blue"}
                    >
                      {
                        [
                          "In consultation",
                          "Waiting",
                          "Checked in",
                          "Upcoming",
                          "Upcoming",
                        ][i]
                      }
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
