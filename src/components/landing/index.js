import React from "react";
import PropTypes from "prop-types";
import cn from "classnames";

import { LandingStyled } from "./styled.js";

const Landing = ({ className = "", children = "", ...landingProps }) => {
  return (
    <LandingStyled className={cn(className)} {...landingProps}>
      Mechascopic
    </LandingStyled>
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