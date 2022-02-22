export class Invoice {
    constructor (invoiceNumber, date, monthYear, total, downloadURL ) {
        this.invoiceNumber = invoiceNumber;
        this.date = date;
        this.monthYear = monthYear;
        this.total = total;
        this.downloadURL = downloadURL;
    }
    toString() {
        return this.invoiceNumber + ', ' + this.date + ', ' + this.monthYear+ ', '+ this.total+ ", " +this.downloadURL;
    }
}

// Firestore data converter
export const invoiceConverter = {
    toFirestore: (invoice) => {
        return {
            invoiceNumber: invoice.invoiceNumber,
            date: invoice.date,
            monthYear: invoice.monthYear,
            total: invoice.total,
            downloadURL: invoice.downloadURL
            };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Invoice(data.invoiceNumber, data.date, data.monthYear, data.total, data.downloadURL);
    }
};