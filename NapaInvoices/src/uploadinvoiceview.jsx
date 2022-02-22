import React from "react";
import { Component, useState } from "react/cjs/react.development";
import { StyleSheet, Text, View, Image } from "react-native";
import { Card, Button, Form } from "react-bootstrap";
import ProgressBar from "./progressbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./InvoiceScreen.css";

export function UploadInvoiceView(props) {
  return (
    <div className="uploadInvoiceViewRow">
      <b className="invoiceViewText" key={props.invoiceNumber}>
        {props.invoiceNumber}
      </b>

      <b className="invoiceViewText" key={props.date}>
        {props.date}
      </b>

      <b className="invoiceViewText" key={props.total}>
        {props.total}
      </b>
      {props.progress ? (
        <ProgressBar bgcolor={"#1b2487"} completed={props.progress} />
      ) : (
        <></>
      )}
    </div>
  );
}
