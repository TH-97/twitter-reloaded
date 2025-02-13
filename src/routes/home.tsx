import { signOut } from "firebase/auth";
import styled from "styled-components";
import { auth } from "../firebase";

const LogOut = styled.button`
  height: 30px;
`;

export default function Home(){
  const onClick = () =>{
    signOut(auth)
    window.location.reload();
  }
  return (
    <LogOut onClick={onClick}>Log out</LogOut>
  );
}