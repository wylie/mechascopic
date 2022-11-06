import styled from "styled-components";

export const LandingH1 = styled.h1`
  margin: 0;
  color: var(--text-color-dark);
  font-size: calc(32px + (80 - 32) * ((100vw - 350px) / (1600 - 350)));
  font-weight: 400;
  @media (prefers-color-scheme: dark) {
    color: var(--text-color-light);
  }
`;

export const LandingHr = styled.div`
  margin: .5rem 0 2rem;
  width: 100%;
  height: 4px;
  background: var(--background-color-dark);
  @media (prefers-color-scheme: dark) {
    background: var(--background-color-light)
  }
`;