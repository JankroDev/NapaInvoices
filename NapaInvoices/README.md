Napa Auto Parts doesn't provide online invoice lookup for their customers. One of their customers stated they would love to do business with their local store but in order for that to happen, online invoicing is a MUST.

Thats where this site comes in to play. The manager at the store has access to the store use link, where they can error check and select which invoices will be sent to the data base.

The site reads from a combination of Googles Firestore API for the invoice #'s the dates, totals, labels etc, as well as Cloud storage (also a Google API) for storing the actual scanned invoice.

Scanning of invoices is done with a combination of python plugins that pulls all of the relevant information from the invoices such as Invoice number, Date, and Total. These are used to create the file name as 11111_01012022_1024.23.jpg. This is then sent to Firestore as a document after the information is extracted and formated as a document. It simultaneously sends the scanned image to Googles cloud storage so the customer can then view the invoice if they wish to do so.

DISCLAIMER: The public version will not work with NPM start. All variables have been changed to protect the privacy of the store and the customers involved. This version is to show the code ONLY. If you want to see it action you can see the screen shots in the portfolio or contact myself for a tour of the program or if you have any questions.
