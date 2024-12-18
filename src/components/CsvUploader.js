import React, { useState } from 'react';
import Papa from 'papaparse';  // Import PapaParse
import { db } from './firebase'; // Import Firebase configuration
import { collection, addDoc } from 'firebase/firestore';
import './CsvUploader.css'; // Import CSS for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

function CsvUploader({ onCsvUpload }) { // Accept callback as prop
  const [csvFile, setCsvFile] = useState(null);

  const handleFileChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file to upload.");
      return;
    }

    // Using PapaParse to parse the CSV file
    Papa.parse(csvFile, {
      complete: async (result) => {
        const data = result.data;
        
        // Map the CSV data to the correct fields
        const parsedData = data.slice(1).map((row) => { // Skip the header row
          return {
            ticketNumber: row[0].trim(),
            dateOfApprehension: row[1].trim(),
            timeOfApprehension: row[2].trim(),
            nameOfDriver: row[3].trim(),
            gender: row[4].trim(),
            age: row[5].trim(),
            vehicleClassification:row[6].trim(),
            placeOfViolation: row[7].trim(),  // Ensure this is not split
            violationType: row[8].trim(),
            violationDes: row[9].trim(),
            fineStatus: row[10].trim(),
            apprehendingOfficer: row[11].trim(),
          };
        });

        try {
          // Upload the data to Firestore
          const batch = parsedData.map(async (item) => {
            await addDoc(collection(db, 'records'), item); // Upload each item to Firestore
          });

          await Promise.all(batch);
          alert('CSV data uploaded successfully!');

          // Pass the parsed data back to LandingPage via onCsvUpload prop
          onCsvUpload(parsedData);
        } catch (error) {
          console.error('Error uploading CSV data:', error);
        }
      },
      header: false,  // We are manually handling the header row
      skipEmptyLines: true,  // Skip empty lines
    });
  };

  return (
    <div className="csv-uploader">
      <input type="file" accept=".csv" onChange={handleFileChange} className="file-input" />
      <button className="upload-csv-button" onClick={handleFileUpload}> <FontAwesomeIcon icon={faUpload} style={{color: "#ffffff", marginRight:"10"}}/>Upload CSV</button>
    </div>
  );
}

export default CsvUploader;