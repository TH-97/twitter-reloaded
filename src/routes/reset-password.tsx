import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { auth } from "../firebase.ts";
import { sendPasswordResetEmail } from "firebase/auth";
import { Form, Input, Tittle, Wrapper, Error } from "../components/auth-components";

export default function ResetPassword(){
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error,setError] = useState("");
  const onChange = (e : React.ChangeEvent<HTMLInputElement>) =>{
    const { target: {name, value} } =e;
    if(name ==="email"){
      setEmail(value);
    }
  };
  const onSubmit = async (e : React.FormEvent<HTMLFormElement>) =>{
    e.preventDefault();
    setError("");
    if(isLoading || email === "") return;
    try{
      setLoading(true);
      await sendPasswordResetEmail(auth,email)
      //아쉬운점 공식문서를 찾아봤지만 firebase ADK를 사용하지 않으면 이메일이 데이터베이스 안에 존재하는지 확인 할수가 없음
      navigate("/login")
    }catch(e){
      if(e instanceof FirebaseError){
        setError(e.message)
      }
    } finally{
      setLoading(false);
    }
  }
  return (
    <Wrapper>
      <Tittle>Reset password ntitter</Tittle>
      <Form onSubmit={onSubmit}>
        <Input onChange={onChange} name="email" value={email} placeholder="email" type="email" required/>
        <Input type="submit" value={isLoading ? "Loading": "reset password" }/>
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
    </Wrapper>
  );
}