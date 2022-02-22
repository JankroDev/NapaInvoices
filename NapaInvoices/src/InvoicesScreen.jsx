import React, { useReducer, useState, useEffect } from "react";
import { Dimensions } from "react-native";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Invoice } from "./invoice";
import { InvoiceView } from "./InvoiceView";
import headerImage from "./images/Napa_Auto_Parts_Logo_full.png";
import { ScrollView } from "react-native-web";
import app from "./initialize";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAuth } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import "./InvoiceScreen.css";
import { Button } from "react-bootstrap";
import { useAuth } from "./contexts/AuthContext";

const initialState = {
  invoices: [],
  invoiceNumbers: [],
  accountType: "Main account",
  labels: [],
  sortOrder: "ascending",
  date: "",
};

const ACTION = {
  setInvoices: "setInvoices",
  setInvoiceNumbers: "setInvoiceNumbers",
  setAccount: "setAccountType",
  setLabels: "setLabels",
  date: "setDate",
  setIsClicked: "setIsClicked",
  setSortOrder: "setSortOrder",
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION.setInvoices:
      return { ...state, invoices: action.payload };
    case ACTION.setInvoiceNumbers:
      return { ...state, invoiceNumbers: action.payload };
    case ACTION.setAccount:
      return { ...state, accountType: action.payload };
    case ACTION.setLabels:
      return { ...state, labels: action.payload };
    case ACTION.setDate:
      return { ...state, date: action.payload };
    case ACTION.setIsClicked:
      return { ...state, isClicked: action.payload };
    case ACTION.setSortOrder:
      return { ...state, sortOrder: action.payload };
    default:
      return state;
  }
};

function InvoicesScreen() {
  const navigate = useNavigate();
  const firestore = getFirestore();
  const { logout } = useAuth();
  const [isClicked, setIsClicked] = useState(false);
  const [source, setSource] = useState("");
  const [state, dispatch] = useReducer(reducer, initialState);
  const [invoiceViews, setInvoiceViews] = useState([]);

  useEffect(() => {
    getLabels();
    setCurrentDate();
  }, []);

  useEffect(() => {
    getLabels();
    getInvoices();
  }, [state.accountType, state.date]);

  const getInvoiceNumbersFromList = (invoiceList) => {
    var invoiceNumberList = [];
    invoiceList.forEach((invoice) => {
      invoiceNumberList.push(invoice.invoiceNumber);
    });

    dispatch({ type: ACTION.setInvoiceNumbers, payload: invoiceNumberList });
  };

  function setCurrentDate() {
    if (state.date === "") {
      console.log("Labels is empty");
      let date = new Date();
      const monthString = date.toLocaleString("default", { month: "long" });
      const yearString = date.getFullYear();
      var dateToSearch = monthString + " " + yearString;

      dispatch({ type: ACTION.setDate, payload: dateToSearch });
    }
  }

  async function getLabels() {
    const docRef = doc(firestore, state.accountType, "Labels");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      dispatch({ type: ACTION.setLabels, payload: docSnap.get("labels") });
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  async function getInvoices() {
    var invoicesHolder = [];
    var invoiceViewHolder = [];
    var account = state.accountType;
    console.log("Calling Get invoices for: ", state.accountType);
    var dateToSearch = "";
    if (state.date == "") {
      console.log("Labels is empty");
      let date = new Date();
      const monthString = date.toLocaleString("default", { month: "long" });
      const yearString = date.getFullYear();
      dateToSearch = monthString + " " + yearString;

      dispatch({
        type: ACTION.setDate,
        payload: monthString + " " + yearString,
      });
    } else {
      dateToSearch = state.date;
    }
    const querySnapshot = await getDocs(
      collection(firestore, state.accountType, dateToSearch, "Invoices")
    );
    console.log("Searching for date: " + dateToSearch);
    querySnapshot.forEach((doc) => {
      var invoiceNumber = doc.get("invoiceNumber");
      var monthYear = doc.get("monthYear");
      var date = doc.get("date");
      var total = doc.get("total");
      var downloadURL = doc.get("downloadURL");
      var invoice = new Invoice(
        invoiceNumber,
        date,
        monthYear,
        total,
        downloadURL
      );
      invoicesHolder.push(invoice);
      invoiceViewHolder.push({
        invoice: invoice,
        isClicked: false,
        source: "",
      });
    });
    setInvoiceViews(invoiceViewHolder);

    dispatch({ type: ACTION.setInvoices, payload: invoicesHolder });
    getInvoiceNumbersFromList(state.invoices);
  }

  const handleAccountChange = (e) => {
    dispatch({ type: ACTION.setAccount, payload: e.target.value });
    dispatch({ type: ACTION.setLabels, payload: [] });
    dispatch({ type: ACTION.setDate, payload: "" });
  };

  const listOfLabels = state.labels.map((label) => {
    try {
      return <option value={label}>{label}</option>;
    } catch (e) {
      console.log("Couldn't list Labels : " + e);
    }
  });

  //Invoice Display
  const invoiceDisplay = state.invoices.map((invoice) => {
    if (!state.invoices) {
      console.log("Invoices is empty");
    }
    try {
      return (
        <InvoiceView
          invoice={invoice}
          downloadURL={invoice.downloadURL}
          source={source}
          setSource={setSource}
          setIsClicked={setIsClicked}
          isClicked={isClicked}
        />
      );
    } catch (e) {
      console.log("Couldn't list Invoices : " + e);
    }
  });

  const handleDateChange = (e) => {
    dispatch({ type: ACTION.setDate, payload: e.target.value });
  };

  const queryHandler = async (e) => {
    if (e.target.value === "") {
      getInvoices();
    }

    const citiesRef = collection(
      firestore,
      state.accountType,
      state.date,
      "Invoices"
    );

    // Create a query against the collection.
    const q = query(citiesRef, where("invoiceNumber", "==", e.target.value));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      var invoiceNumber = doc.get("invoiceNumber");
      var monthYear = doc.get("monthYear");
      var date = doc.get("date");
      var total = doc.get("total");
      var downloadURL = doc.get("downloadURL");
      var invoice = new Invoice(
        invoiceNumber,
        date,
        monthYear,
        total,
        downloadURL
      );
      console.log(doc.id, " => ", doc.data());
      dispatch({ type: ACTION.setInvoices, payload: [invoice] });
    });
  };

  const sortInvoices = (e) => {
    if (state.sortOrder == "descending") {
      var invoices = state.invoices;
      invoices.sort((a, b) => a.invoiceNumber - b.invoiceNumber);
      dispatch({ type: ACTION.setInvoices, payload: invoices });
      dispatch({ type: ACTION.setSortOrder, payload: "ascending" });
    }
    if (state.sortOrder == "ascending") {
      var invoices = state.invoices;
      invoices.sort((a, b) => b.invoiceNumber - a.invoiceNumber);
      dispatch({ type: ACTION.setInvoices, payload: invoices });
      dispatch({ type: ACTION.setSortOrder, payload: "descending" });
    }
    console.log("Sort order" + state.sortOrder);
    console.log(state.invoices);
  };

  const sortDate = (e) => {
    if (state.sortOrder === "descending") {
      var invoices = state.invoices;
      invoices.sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
      });
      dispatch({ type: ACTION.setInvoices, payload: invoices });
      dispatch({ type: ACTION.setSortOrder, payload: "ascending" });
    }
    if (state.sortOrder === "ascending") {
      var invoices = state.invoices;
      invoices.sort((a, b) => {
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
        return 0;
      });
      dispatch({ type: ACTION.setInvoices, payload: invoices });
      dispatch({ type: ACTION.setSortOrder, payload: "descending" });
    }
    console.log("Sort order" + state.sortOrder);
    console.log(state.invoices);
  };

  const sortTotal = (e) => {
    if (state.sortOrder === "descending") {
      var invoices = state.invoices;
      invoices.sort((a, b) => {
        var aTotal = parseFloat(a.total.slice(1));
        var bTotal = parseFloat(b.total.slice(1));
        if (aTotal > bTotal) return -1;
        if (aTotal < bTotal) return 1;
        return 0;
      });
      dispatch({ type: ACTION.setInvoices, payload: invoices });
      dispatch({ type: ACTION.setSortOrder, payload: "ascending" });
    }
    if (state.sortOrder === "ascending") {
      var invoices = state.invoices;
      invoices.sort((a, b) => {
        var aTotal = parseFloat(a.total.slice(1));
        var bTotal = parseFloat(b.total.slice(1));
        if (aTotal > bTotal) return 1;
        if (aTotal < bTotal) return -1;
        return 0;
      });
      dispatch({ type: ACTION.setInvoices, payload: invoices });
      dispatch({ type: ACTION.setSortOrder, payload: "descending" });
    }
    console.log("Sort order" + state.sortOrder);
    console.log(state.invoices);
  };

  const handleLogout = () => {
    const auth = getAuth();
    logout(auth)
      .then(() => {
        navigate("/login");
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <div>
      <div className="pageHeader">
        <img
          style={{
            minwidth: Dimensions.get("window").width / 2,
            maxHeight: 200,
          }}
          src={headerImage}
          alt=""
        ></img>
        <div className="pageHeaderAccount">
          <div className="pageHeaderAccountWrapper">
            <b className="pageHeaderAccountText">Main Account Invoices</b>
          </div>
        </div>
        {/* Date and Account Selection div */}
      </div>
      <div className="accountDateSearch">
        <div>
          <label className="accountDateSearchText"> Choose the Account: </label>
          <select className="form-select-sm" onChange={handleAccountChange}>
            <option value="Main Account">Main Account</option>
            <option value="CoreAccount">Core Account</option>
          </select>
        </div>
        <div>
          <label className="accountDateSearchText"> Date Range: </label>
          <select
            className="form-select-sm "
            onChange={handleDateChange}
            value={state.date}
          >
            {listOfLabels}
          </select>
        </div>
        <div>
          <label className="accountDateSearchText"> Search Invoice #: </label>
          <input type="text" onChange={queryHandler} />
        </div>
      </div>
      {/* Column Header */}
      <div>
        <div className="columnHeader">
          <div className="columnHeaderRow">
            <label className="columnHeaderText">Invoice</label>
            <Button variant="outline-light" onClick={sortDate}>
              Sort
            </Button>
          </div>
          <div className="columnHeaderRow">
            <label className="columnHeaderText">Date</label>
            <Button variant="outline-light" onClick={sortDate}>
              Sort
            </Button>
          </div>
          <div className="columnHeaderRow">
            <label className="columnHeaderText">Total</label>
            <Button variant="outline-light" onClick={sortDate}>
              Sort
            </Button>
          </div>
          <div className="columnHeaderRow">
            <label className="columnHeaderText">Download</label>
          </div>
        </div>
        <ScrollView>{invoiceDisplay}</ScrollView>
      </div>
      {/* Bottom info */}
      <div className="columnFooter">
        <b>
          Questions?
          <a href="mailto: sudoStoreEmail@gmail.com"> Email the store</a>
        </b>

        <b s>Or call the store at: Sudo Phone number</b>
        <b>Thank you for your business!</b>
        <Link to="/entryform"> Store Use </Link>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default InvoicesScreen;
