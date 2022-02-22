import React, { useRef, useState, useEffect } from "react";
import { Card, Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import imageUrl from "./images/favicon.ico";
import { useAuth } from "./contexts/AuthContext";
import "./InvoiceScreen.css";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState("");

  let navigate = useNavigate();
  const { login, currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate("/invoicesScreen");
    }
  }, [currentUser]);

  const loginHandler = async (e) => {
    setError("");
    e.preventDefault();

    await login(emailRef.current.value, passwordRef.current.value)
      .then((user) => {
        navigate("/invoicesScreen");
        console.log("User = ", currentUser);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div
      style={{
        display: "flex",
        marginTop: 30,
        justifyContent: "center",
        alignContent: "center",
        height: "100%",
        alignSelf: "center",
      }}
    >
      <div className="translate">
        <div className="storefrontimage"></div>
      </div>
      <Card
        style={{
          width: "500px",
          borderWidth: 2,
          borderColor: "white",
          opacity: ".87",
        }}
      >
        <Card.Header className="text-center mt-20">
          {error && <Alert variant="danger">{error}</Alert>}
          {currentUser && <p style={{ color: "green" }}>Logged in</p>}
          <Card.Img style={{ width: 100 }} src={imageUrl}></Card.Img>
          <Card.Text>Login</Card.Text>
        </Card.Header>
        <Form>
          <Form.Group className="mb-3 m-2">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" ref={emailRef} id="email" />
          </Form.Group>
          <Form.Group className="mb-3 m-2">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" ref={passwordRef} id="password" />
          </Form.Group>
          <Form.Group className="mb-3 m-2">
            <Form.Check type="checkbox" label="Remember Me" />
          </Form.Group>
          <Button
            variant="primary"
            style={{ width: 400, marginLeft: 40, marginBottom: 10 }}
            type="submit"
            onClick={loginHandler}
          >
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
