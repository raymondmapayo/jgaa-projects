import { Rate } from "antd";
import styled from "styled-components";

// Styled Rate with responsive star sizing
const StyledRate = styled(Rate)`
  && {
    font-size: clamp(12px, 2.5vw, 15px); /* Scales between 12px and 15px */
    color: hsl(32, 100%, 59%); /* Yellow stars */
  }
`;

interface CustomRateProps {
  value: number;
}

export const CustomRate: React.FC<CustomRateProps> = ({ value }) => {
  return <StyledRate value={value} disabled />;
};
