import styled, { keyframes } from "styled-components";

const jiggle = keyframes`
  0%, 100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
  75% {
    transform: rotate(-3deg);
  }
`;

export const AnimatedIcon = styled.div`
  display: inline-block;
  color: #f97316; /* Tailwind orange-500 */
  animation: ${jiggle} 1.5s infinite;
  animation-delay: calc(var(--ant-menu-item-icon-index) * 0.1s);
`;
