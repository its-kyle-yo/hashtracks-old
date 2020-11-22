import React, { Component } from "react";
import moment from "moment";
import Month from "./Month";
import { FireStore } from "./Firebase";
import { If, Then, Else } from "react-if";
class Calendar extends Component {
  static contextType = FireStore;

  render() {
    const { posts, year, user } = this.context;
    const months = moment.months();

    return (
      <If condition={!!user}>
        <If condition={!!posts}>
          <Then>
            <div className="calendar">
              <ol className="months">
                <If condition={!!year && !!posts[year]}>
                  <Then>
                    {months.map((month, index) => {
                      return (
                        <Month
                          key={`${month}${year}`}
                          year={year}
                          month={month}
                          monthIndex={index}
                        />
                      );
                    })}
                  </Then>
                </If>
              </ol>
            </div>
          </Then>
          <Else>
            <div>Go post on Twitter and you'll start to see it here!</div>
          </Else>
        </If>
        <Else>Login to view your calendar!</Else>
      </If>
    );
  }
}

export default Calendar;
