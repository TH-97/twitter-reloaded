import { Link } from "react-router-dom";
import { styled } from "styled-components";

const ResetButton = styled.span`
  margin-top: 20px;
  a{
    color: #1d9bf0;
  }
`;

export default function PasswordResetButton(){
  return (
    <ResetButton>
      Don't you remember the password? <Link to="/reset-password">&rarr;</Link>
    </ResetButton>
  )
}