import { Rate } from "antd";
import styled from "styled-components";

// Styled component for the Rate component from Ant Design
const StyledRate = styled(Rate)`
  && {
    font-size: 24px; /* Adjust the size */
    color: hsl(32, 100%, 59%); /* Set the color of the stars */
  }
`;

// Accept the 'value' prop to dynamically display the rating
interface CustomRateProps {
  value: number; // The value of the rating (avg_rating)
}

export const CustomRate: React.FC<CustomRateProps> = ({ value }) => {
  return <StyledRate value={value} disabled />; // Display the rating value and make it read-only (disabled)
};
