import React, { Component } from "react";
import Week from "./Week";
import cal from "calendar";

const calendarMonths = new cal.Calendar();
class Month extends Component {
  render() {
    const { year, month, monthIndex } = this.props;
    const weeks = calendarMonths.monthDays(year, monthIndex);

    return (
      <li className="month" key={`${month}${year}${monthIndex}`}>
        <div className="name">{month}</div>
        <hr />
        <ol className="days" key={`${year}${month}${monthIndex}OL`}>
          {weeks.map(week => (
            <Week
              weekDays={week}
              year={year}
              month={month}
              key={`Week${week[week.length - 1]}${month}`}
            />
          ))}
        </ol>
      </li>
    );
  }
}

export default Month;
