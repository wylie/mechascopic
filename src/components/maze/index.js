import React from 'react'
import PropTypes from "prop-types";
import cn from "classnames";
import Pico8 from 'react-pico-8'
import { Controls,
         Reset,
         Pause,
         Sound,
         Carts,
         Fullscreen } from 'react-pico-8/buttons'
import 'react-pico-8/styles.css'

import { MazeStyled } from "./styled.js";

const Maze = ({ className = "", children = "", ...mazeProps }) => {
  return (
    <MazeStyled className={cn(className)} {...mazeProps}>
      <Pico8 src="./maze.js"
        autoPlay={true}
        legacyButtons={false}
        hideCursor={false}
        center={true}
        blockKeys={false}
        usePointer={true}
        unpauseOnReset={true}
        placeholder="./placeholder.png"
      >
        <Controls/>
        <Reset/>
        <Pause/>
        <Sound/>
        <Carts/>
        <Fullscreen/>
      </Pico8>
    </MazeStyled>
  );
};

Maze.displayName = "Maze";

Maze.propTypes = {
  /**
   * Children of the component
   */
  children: PropTypes.string,
  /**
   * @ignore
   */
  className: PropTypes.string
};

export default Maze;