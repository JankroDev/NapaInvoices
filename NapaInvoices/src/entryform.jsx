import { useState, useEffect } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getFirestore, getDoc } from "firebase/firestore";
import { Invoice, invoiceConverter } from "./invoice";
import { Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { UploadInvoiceView } from "./uploadinvoiceview";

function EntryForm() {
  const [selectedFiles, setSelectedFile] = useState([]);
  const [account, setAccount] = useState("Main Account");
  const [labels, setlabels] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingInvoices, setUploadingInvoices] = useState([]);

  const firestore = getFirestore();

  // Get a reference to the storage service, which is used to create references in your storage bucket

  const storage = getStorage();

  let navigate = useNavigate();

  useEffect(() => {
    var invoiceList = getInvoiceList();
    setInvoices(invoiceList);
    getLabelsDoc();
  }, [selectedFiles, uploadingInvoices]);

  async function getLabelsDoc() {
    if (labels.length > 1) {
    } else {
      const docRef = doc(firestore, account, "Labels");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setlabels(docSnap.get("labels"));
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
  }

  const changeHandler = (event) => {
    setSelectedFile(event.target.files);
    setlabels([]);
    getLabelsDoc();
    var invoicesList = getInvoiceList();
    setInvoices(invoicesList);
  };

  const getInvoiceList = () => {
    var invoiceHolder = [];
    Array.from(selectedFiles).forEach((file) => {
      var month = getDateFromString(file.name);
      var localInvoiceNumber = getInvoiceNumber(file.name);
      var invoiceDate = getInvoiceDate(file.name);
      var localMonthYear = month + " " + invoiceDate.slice(6, 10);
      var localTotal = getInvoiceTotal(file.name);
      invoiceHolder.push(
        new Invoice(
          localInvoiceNumber,
          invoiceDate,
          localMonthYear,
          localTotal,
          ""
        )
      );
    });
    return invoiceHolder;
  };

  const invoiceViews = invoices.map((invoice) => {
    return (
      <UploadInvoiceView
        invoiceNumber={invoice.invoiceNumber}
        date={invoice.date}
        total={invoice.total}
        progress={0}
      />
    );
  });

  const uploadingInvoiceViews = uploadingInvoices.map((entry) => {
    return (
      <UploadInvoiceView
        invoiceNumber={entry.invoiceNumber}
        date={entry.date}
        total={entry.total}
        progress={entry.progress}
      />
    );
  });

  const handleSubmission = async () => {
    getLabelsDoc();
    uploadFiles();
  };

  async function uploadLabelsDoc() {
    await setDoc(doc(firestore, account, "Labels"), {
      labels: labels,
    });
  }

  async function uploadFiles() {
    Array.from(selectedFiles).forEach((file) => {
      var localInvoiceNumber = getInvoiceNumber(file.name);
      var invoiceDate = getInvoiceDate(file.name);
      var localTotal = getInvoiceTotal(file.name);
      var storageRef = ref(storage, localInvoiceNumber);
      uploadingInvoices.push({
        invoiceNumber: localInvoiceNumber,
        date: invoiceDate,
        total: localTotal,
        progress: 0,
      });
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setIsUploading(true);
          var tempList = [...uploadingInvoices];
          uploadingInvoices.forEach((entry) => {
            if (snapshot.ref.name === entry.invoiceNumber) {
              var objIndex = tempList.findIndex(
                (obj) => obj.invoiceNumber === entry.invoiceNumber
              );
              tempList[objIndex].progress = progress;
              console.log(
                snapshot.ref.name +
                  " Progress: " +
                  uploadingInvoices[objIndex].progress
              );
            }
          });
          setUploadingInvoices(tempList);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
            default:
              console.log("Something went Wrong");
          }
        },
        (error) => {
          // Handle unsuccessful uploads
          console.log("Error on upload");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            var month = getDateFromString(file.name);
            var localInvoiceNumber = getInvoiceNumber(file.name);
            var invoiceDate = getInvoiceDate(file.name);
            var localMonthYear = month + " " + invoiceDate.slice(6, 10);
            var localTotal = getInvoiceTotal(file.name);
            const firestoreRef = doc(
              firestore,
              account,
              localMonthYear,
              "Invoices",
              localInvoiceNumber
            ).withConverter(invoiceConverter);
            setDoc(
              firestoreRef,
              new Invoice(
                localInvoiceNumber,
                invoiceDate,
                localMonthYear,
                localTotal,
                downloadURL
              )
            );

            var labelsList = [];
            labelsList = [...labels];
            labelsList.push(localMonthYear);
            updateLabels(labelsList);
            uploadLabelsDoc();

            setIsUploading(false);
            setUploadingInvoices([]);
          });
        }
      );
    });
  }

  function updateLabels(labelsToSort) {
    labelsToSort.forEach((label) => {
      if (labels.includes(label.toString())) {
      }
      if (!labels.includes(label.toString())) {
        labels.push(label);
      }
    });
    return;
  }

  function getInvoiceDate(filename) {
    var splitString = filename.split("_");
    var dateString = splitString[1];
    var formattedDateString =
      dateString.slice(0, 2) +
      "/" +
      dateString.slice(2, 4) +
      "/" +
      dateString.slice(4, 9);
    return formattedDateString;
  }

  function getInvoiceTotal(filename) {
    var splitString = filename.split("_");
    var totalOnly = splitString[2];
    var noJpeg = totalOnly.replace(/\.[^/.]+$/, "");
    return "$" + noJpeg;
  }

  function getInvoiceNumber(filename) {
    return filename.slice(0, 6);
  }

  function getDateFromString(dateString) {
    var splitString = dateString.split("_");
    var dateOnly = splitString[1];
    var firstTwo = dateOnly.slice(0, 2);
    switch (firstTwo) {
      case "01":
        return "January";
      case "02":
        return "February";
      case "03":
        return "March";
      case "04":
        return "April";
      case "05":
        return "May";
      case "06":
        return "June";
      case "07":
        return "July";
      case "08":
        return "August";
      case "09":
        return "September";
      case "10":
        return "October";
      case "11":
        return "November";
      case "12":
        return "December";
      default:
        console.log(`Couldn't find`);
    }
  }
  function handleAccountSelection(e) {
    setAccount(e.target.value);
  }

  function onBackHandler() {
    navigate("/invoicesScreen");
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gap: "20px",
          fontWeight: "bold",
          fontSize: "28px",
          padding: 20,
        }}
      >
        <Button
          style={{ width: 150 }}
          disabled={isUploading}
          onClick={onBackHandler}
          variant="dark"
        >
          Go Back{" "}
        </Button>
        <label>Select the Account to Upload for:</label>
        <select className="form-select-lg" onChange={handleAccountSelection}>
          <option value="Main Account">Main Account</option>
          <option value="CoreAccount">Core Account</option>
        </select>
      </div>

      <Form.Group
        controlId="formFileMultiple"
        className="mb-3"
        onChange={changeHandler}
      >
        <Form.Label>Choose Files to Upload</Form.Label>
        <Form.Control type="file" multiple />
      </Form.Group>
      <ul>
        <b>Instructions:</b>
      </ul>
      <li style={{ paddingLeft: 10 }}>
        {" "}
        1) Select the Account you are uploading the invoices for{" "}
      </li>
      <li style={{ paddingLeft: 10 }}>
        {" "}
        2) Select the invoices to upload from your device{" "}
      </li>
      <li style={{ paddingLeft: 10 }}>
        {" "}
        3) Double check the data of the invoices after you have selected them{" "}
      </li>
      <li style={{ paddingLeft: 10, color: "red" }}>
        {" "}
        !! Uploads ARE Final !!{" "}
      </li>
      <li style={{ paddingLeft: 10 }}>
        {" "}
        4) Click Submit and wait for them to complete{" "}
      </li>

      {isUploading ? uploadingInvoiceViews : invoiceViews}

      <div style={{ textAlign: "center", padding: 20 }}>
        <Button
          className="btn btn-primary w-25"
          size="large"
          disabled={isUploading}
          onClick={handleSubmission}
        >
          Submit{" "}
        </Button>
      </div>
    </div>
  );
}
export default EntryForm;
