import React, { Component } from "react";
import { FireStore } from "./Firebase";
import ScrollMenu from "react-horizontal-scrolling-menu";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const Arrow = ({ text, className }) => {
  return <div className={className}>{text}</div>;
};

const ArrowLeft = Arrow({ text: "<", className: "arrow-prev" });
const ArrowRight = Arrow({ text: ">", className: "arrow-next" });

const Menu = yearList => {
  return yearList.map(year => (
    <div key={year} value={year} className="menu-item">
      {year}
    </div>
  ));
};

const animatedComponents = makeAnimated();
class NavControls extends Component {
  static contextType = FireStore;
  selectRef = React.createRef();
  state = {
    selected: 0
  };

  handleSelect = async args => {
    console.log(await this.selectRef.current.state.value);
  };

  render() {
    const { selected } = this.state;
    const {
      updateSelectedYear,
      updateSelectedHashtag,
      yearList,
      year
    } = this.context;
    const menu = Menu(yearList, selected);

    return (
      <div className="control-center">
        <div className="year-selector">
          <ScrollMenu
            data={menu}
            arrowLeft={ArrowLeft}
            arrowRight={ArrowRight}
            selected={year}
            onSelect={updateSelectedYear}
          />
        </div>
        <div className="select-container">
          <Select
            ref={this.selectRef}
            options={[
              { value: "#HelloWorld", label: "#HelloWorld" },
              { value: "testing", label: "123" }
            ]}
            onMenuClose={this.handleSelect}
            components={animatedComponents}
            placeholder="Hashtag(s)"
            className="hashtag-selector"
            classNamePrefix="select"
          />
        </div>
      </div>
    );
  }
}

export default NavControls;
