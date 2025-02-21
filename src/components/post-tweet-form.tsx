import { addDoc, collection } from "firebase/firestore";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { auth, db } from "../firebase";
import imageCompression from "browser-image-compression";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;
const AttachFileButton = styled.label`
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const SubmitButton = styled.input`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

const AttachFileInput = styled.input`
  display: none;
  //이렇게 하는 이는 input 버튼은 이쁘게 만들기 어렵기 때문
`;
const Img = styled.img`
  width: 100%;
  height: auto;
`;

//파일 압축
const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1, // 최대 1MB로 압축
    maxWidthOrHeight: 800, // 최대 가로/세로 크기 800px
    useWebWorker: true, // 성능 최적화
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log("압축된 파일 크기:", compressedFile.size);
    return compressedFile;
  } catch (error) {
    console.error("이미지 압축 실패:", error);
  }
};

export default function PostTweetForm() {
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState("");
  const [base64, setBase64] = useState<string | null>(null);
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value);
  };
  // base64 인코딩
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      const compressedFile = await compressImage(files[0]);
      if (!compressedFile) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
        setBase64(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    }
  };
  // base64가 변경되었을 때, 동적으로 img의 src를 업데이트
  useEffect(() => {
    if (base64) {
      const imgElement = document.querySelector(".img") as HTMLImageElement;
      if (imgElement) {
        imgElement.src = base64; // base64 값으로 img 태그의 src 변경
      }
    }
  }, [base64]); // base64가 변경될 때마다 실행

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || tweet === "" || tweet.length > 180) return;
    try {
      setLoading(true);
      await addDoc(collection(db, "tweets"), {
        tweet,
        createdAt: Date.now(),
        username: user.displayName || "Anonymous",
        userId: user.uid,
        file: base64,
      });
      setTweet("");
      setBase64("");
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Form onSubmit={onSubmit}>
        <TextArea
          rows={5}
          maxLength={180}
          onChange={onChange}
          value={tweet}
          placeholder="What is happening?"
        />
        <AttachFileButton htmlFor="file">
          {base64 ? "Photo added" : "Add photo"}
        </AttachFileButton>
        <AttachFileInput
          onChange={onFileChange}
          type="file"
          id="file"
          accept="image/*"
        />
        <SubmitButton
          type="submit"
          value={isLoading ? "Posting..." : "Post Tweet"}
        />
        <Img className="img" />
      </Form>
    </>
  );
}
