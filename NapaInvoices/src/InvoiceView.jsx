import React from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./InvoiceScreen.css";

export function InvoiceView(props) {
  return (
    <div className="invoiceViewRow">
      <b className="invoiceViewText" key={props.invoice.invoiceNumber}>
        {props.invoice.invoiceNumber}
      </b>

      <b className="invoiceViewText" key={props.invoice.date}>
        {props.invoice.date}
      </b>

      <b className="invoiceViewText" key={props.invoice.total}>
        {props.invoice.total}
      </b>

      <Button
        variant="info"
        size="sm"
        style={{ borderRadius: 10, margin: 5 }}
        onClick={() => window.open(props.downloadURL, "_blank")}
      >
        <b
          style={{
            textAlign: "center",
            fontWeight: "bold",
            color: "white",
          }}
        >
          View
        </b>
      </Button>
    </div>
  );
}
