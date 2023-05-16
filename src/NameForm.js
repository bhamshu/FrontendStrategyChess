import React, { useState } from "react";
import styled from "styled-components";

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
  padding: 40px;
  background-color: #f2f2f2;
  max-width: 500px;
  width: 100%;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  width: 100%;
`;

const Label = styled.label`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Input = styled.input`
  height: 40px;
  border-radius: 10px;
  border: none;
  padding: 10px;
  font-size: 16px;
`;

const SubmitButton = styled.button`
  height: 40px;
  border-radius: 10px;
  border: none;
  background-color: #6495ed;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #4169e1;
  }
`;

const NameForm = ({ onSubmit }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name);
  };

  const handleChange = (e) => {
    setName(e.target.value);
  };

  return (
    <FormWrapper>
      <FormContainer onSubmit={handleSubmit}>
        <InputWrapper>
          <Label htmlFor="name">
            Strategy Test #1 - Choose a Unique Username :
          </Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleChange}
            placeholder="Enter a unique username that no one else has chosen."
            required
          />
        </InputWrapper>
        <SubmitButton type="submit">Start Playing</SubmitButton>
      </FormContainer>
    </FormWrapper>
  );
};

export default NameForm;
