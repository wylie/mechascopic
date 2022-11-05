import React from "react";
import PropTypes from "prop-types";
import cn from "classnames";

import { LandingH1, LandingHr } from "./styled.js";

const Landing = ({ className = "", children = "", ...landingProps }) => {
  return (
    <>
      <LandingH1>Mechascopic</LandingH1>
      <LandingHr />
    </>
  );
};

Landing.displayName = "Landing";

Landing.propTypes = {
  /**
   * Children of the component
   */
  children: PropTypes.string,
  /**
   * @ignore
   */
  className: PropTypes.string
};

export default Landing;