import React from "react";

import "./index.css"
import { Wrapper } from "./AppStyled.js";
import Landing from "./components/landing";
import Maze from "./components/maze";

const App = () => (
  <Wrapper>
    <Landing />
    <Maze />
  </Wrapper>  
);

export default App;
