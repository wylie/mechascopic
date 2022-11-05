import styled from "styled-components";

export const LandingH1 = styled.h1`
  margin: 0;
  color: var(--text-color-light);
  font-size: calc(32px + (80 - 32) * ((100vw - 350px) / (1600 - 350)));
  font-weight: 400;
`;

export const LandingHr = styled.hr`
  margin: .5rem 0 1rem;
  width: 100%;
`;