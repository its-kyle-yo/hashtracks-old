import React, { Component } from "react";
import Day from "./Day";
import { FireStore } from "./Firebase";
import EmptyDay from "./EmptyDay";

class Week extends Component {
  static contextType = FireStore;
  render() {
    const { year, month, weekDays } = this.props;
    const { getPost } = this.context;

    return (
      <>
        {weekDays.map((date, index) => {
          if (!!date) {
            const post = getPost(year, month, date);
            if (post) {
              return (
                <Day
                  year={year}
                  month={month}
                  date={date}
                  key={`${date}${year}${month}`}
                  post={getPost(year, month, date)}
                />
              );
            }
            return (
              <EmptyDay date={date} key={`${year}${month}-empty-${index}`} />
            );
          }
          return <li key={`${year}${month}-0-${index}`} />;
        })}
      </>
    );
  }
}

export default Week;
