import "./all.css";
import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from './firebase';
import Modal from "react-modal";
import Header from "./Header";
import CsvUploader from "./CsvUploader"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpAZ, faCab, faFilter, faFloppyDisk, faMagnifyingGlass, faPen, faRectangleList, faTicket, faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title,Tooltip, Legend } from 'chart.js';
import { faMapLocation } from "@fortawesome/free-solid-svg-icons/faMapLocation";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { faArrowUpZA } from "@fortawesome/free-solid-svg-icons/faArrowUpZA";
import { faSort } from "@fortawesome/free-solid-svg-icons/faSort";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const LandingPage = () => {
  const [records, setRecords] = useState([]);
  const [ticketNumber, setTicketNumber] = useState("");
  const [dateOfApprehension, setDateOfApprehension] = useState("");
  const [timeOfApprehension, setTimeOfApprehension] = useState("");
  const [nameOfDriver, setNameOfDriver] = useState("");
  const [placeOfViolation, setPlaceOfViolation] = useState("");
  const [violationType, setViolationType] = useState("");
  const [violationTypes, setViolationTypes] = useState([
    "Driving without a valid license",
    "Unregistered vehicles",
    "Invalid or tampered vehicle plates",
    "Failure to carry the Official Receipt (OR) and Certificate of Registration (CR).",
    "Driving without a valid license",
    "No or expired vehicle insurance",
    "Failure to install early warning devices (EWDs)",
    "Non-compliance with seatbelt laws",
    "Overspeeding",
    "Reckless Driving",
    "Driving under the influence (DUI)",
    "Counterflow or overtaking in prohibited areas",
    "Disobeying traffic signs or signals",
    "Illegal parking",
    "Obstruction violations",
    "Use of a private vehicle for public transport without proper franchise",
    "Worn-out tires or other safety hazards",
    "No helmet ",
    "Carrying children under 7 years old as passengers",
    "Illegal use of motorcycle lanes",
    "Riding with more than one passenger",
    "Use of mobile phones while driving",
    "Operating other distracting devices while driving",
    "Failure to yield to pedestrians at marked crossings",
    "Parking on sidewalks, pedestrian lanes, or bike lanes",
    "Blocking fire lanes or emergency exits",
    "No loading/unloading in designated zones",
    "Unauthorized tricycle routes",
    "Illegal use of restricted roads for certain vehicles",
    "Failure to follow one-way street designations",
    "Smoke belching",
    "Idling for extended periods in prohibited zones",
    "Illegal dumping of waste from vehicles",
    "Fake or forged documents",
    "Failure to renew driver’s license or vehicle registration on time",
    "Carrying firearms or illegal substances in vehicles",
    "Transporting contraband or overloaded vehicles",
  ]);
  const [violationDes, setViolationDes]= useState("");
  const [fineStatus, setFineStatus] = useState("");
  const [apprehendingOfficer, setApprehendingOfficer] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [vehicleClassification, setVehicleClassification] = useState("");

  const handleAddViolation = () => {
    if (
      formState.violationType?.trim() && // Safeguard for non-string values
      !violationTypes.includes(formState.violationType)
    ) {
      setViolationTypes([...violationTypes, formState.violationType]);
    }
  };

  const [selectedData, setSelectedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  
  const [formState, setFormState] = useState({
    ticketNumber: "",
    dateOfApprehension: "",
    timeOfApprehension: "",
    nameOfDriver: "",
    placeOfViolation: "",  
    violationType: "",
    violationDes:"",
    fineStatus: "",
    apprehendingOfficer: "",
    gender: "",
    age: "",
    vehicleClassification: ""
  });

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const handleCsvData = (data) => {
    setRecords(data);
  };

  const [genderData, setGenderData] = useState({ Male: 0, Female: 0 });
  const [ageData, setAgeData] = useState([0, 0, 0, 0, 0]); // [0-18, 19-30, 31-40, 41-50, 51+]
  const [fineStatusData, setFineStatusData] = useState({ Paid: 0, Unpaid: 0 });
  const [vehicleClassificationData, setVehicleClassificationData] = useState({});//doughnut
  const [violationTypeData, setViolationTypeData] = useState({});//doughnut
  const [vehicleClassificationDataC, setVehicleClassificationDataC] = useState({}); //card
  const [violationTypeDataC, setViolationTypeDataC] = useState({});//card



  const [filteredData, setFilteredData] = useState([]);
// Function to fetch data for gender, fine status, and age groups
const fetchDemographicData = async (dataList) => {
  // Process gender data
  const genderCounts = dataList.reduce(
    (acc, record) => {
      if (record.gender === "Male") acc.Male += 1;
      if (record.gender === "Female") acc.Female += 1;
      return acc;
    },
    { Male: 0, Female: 0 }
  );
  setGenderData(genderCounts);

  // Process fine status data
  const fineStatusCounts = dataList.reduce(
    (acc, record) => {
      if (record.fineStatus === "Paid") acc.Paid += 1;
      if (record.fineStatus === "Unpaid") acc.Unpaid += 1;
      return acc;
    },
    { Paid: 0, Unpaid: 0 }
  );
  setFineStatusData(fineStatusCounts);

  // Process age data (grouping by age ranges)
  const ageCounts = [0, 0, 0, 0, 0]; // [0-18, 19-30, 31-40, 41-50, 51+]
  dataList.forEach((record) => {
    const age = record.age;
    if (age >= 0 && age <= 18) ageCounts[0] += 1;
    else if (age >= 19 && age <= 30) ageCounts[1] += 1;
    else if (age >= 31 && age <= 40) ageCounts[2] += 1;
    else if (age >= 41 && age <= 50) ageCounts[3] += 1;
    else if (age >= 51) ageCounts[4] += 1;
  });
  setAgeData(ageCounts);
};

// Function to fetch data for doughnut charts
const fetchDoughnutData = async (dataList) => {
  // Process vehicle classification data
  const vehicleCounts = {};
  dataList.forEach((record) => {
    const vehicle = record.vehicleClassification;
    if (vehicle) {
      vehicleCounts[vehicle] = vehicleCounts[vehicle] ? vehicleCounts[vehicle] + 1 : 1;
    }
  });
  setVehicleClassificationData(vehicleCounts);

  // Process violation type data dynamically
  const violationCounts = {};
  dataList.forEach((record) => {
    const violation = record.violationType;
    if (violation) {
      violationCounts[violation] = violationCounts[violation] ? violationCounts[violation] + 1 : 1;
    }
  });
  setViolationTypeData(violationCounts);
};

// Function to fetch data for cards
const fetchCardData = async (dataList) => {
  // Process vehicle classification data for cards
  const vehicleCountsC = {};
  dataList.forEach((record) => {
    const vehicle = record.vehicleClassification;
    if (vehicle) {
      vehicleCountsC[vehicle] = vehicleCountsC[vehicle] ? vehicleCountsC[vehicle] + 1 : 1;
    }
  });
  const highestVehicleClassification = Object.keys(vehicleCountsC).reduce((a, b) =>
    vehicleCountsC[a] > vehicleCountsC[b] ? a : b
  );
  const highestVehicleCountC = vehicleCountsC[highestVehicleClassification];
  setMostCommonVehicle({ count: highestVehicleCountC, classification: highestVehicleClassification });

  // Process violation type data for cards
  const violationCountsC = {};
  dataList.forEach((record) => {
    const violation = record.violationType;
    if (violation) {
      violationCountsC[violation] = violationCountsC[violation] ? violationCountsC[violation] + 1 : 1;
    }
  });
  const highestViolationTypeC = Object.keys(violationCountsC).reduce((a, b) =>
    violationCountsC[a] > violationCountsC[b] ? a : b
  );
  const highestViolationCount = violationCountsC[highestViolationTypeC];
  setMostCommonViolation({ count: highestViolationCount, type: highestViolationTypeC });

  // Calculate the total number of violations per place of violation
  const placeCounts = {};
  dataList.forEach((record) => {
    const place = record.placeOfViolation;
    if (place) {
      placeCounts[place] = placeCounts[place] ? placeCounts[place] + 1 : 1;
    }
  });
  const top3Places = Object.entries(placeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([place, count]) => ({ place, count }));
  setTop3Places(top3Places);
};

// Main fetch function
const fetchData = async () => {
  const recordsCollection = collection(db, "records");
  const recordsSnapshot = await getDocs(recordsCollection);
  const dataList = recordsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  setRecords(dataList);
  setFilteredData(dataList);

  // Fetch data for different purposes
  fetchDemographicData(dataList);
  fetchDoughnutData(dataList);
  fetchCardData(dataList);
};

useEffect(() => {
  fetchData();
}, []);

const [mostCommonViolation, setMostCommonViolation] = useState({ count: 0, type: "" });
const [mostCommonVehicle, setMostCommonVehicle] = useState({ count: 0, classification: "" });
const [top3Places, setTop3Places] = useState([]);
const totalViolations = records.length; // Use `records` state to calculate this.

  const handleDelete = async (id) => {
    const recordsDocRef = doc(db, "records", id);
    try {
      await deleteDoc(recordsDocRef);
      setRecords(records.filter((data) => data.id !== id));
      alert("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      if (selectedData) {
        const recordDocRef = doc(db, "records", selectedData.id);
        await updateDoc(recordDocRef, formState);
        alert("Data updated successfully!");
      } else {
        await addDoc(collection(db, "records"), formState);
        alert("Data added successfully!");
      }
  
      setFormState({
        ticketNumber: "",
        dateOfApprehension: "",
        timeOfApprehension: "",
        nameOfDriver: "",
        gender: "",
        age: "",
        vehicleClassification: "",
        placeOfViolation: "",
        violationType: "",
        violationDes: "",
        fineStatus: "",
        apprehendingOfficer: ""
      });
      setSelectedData(null);
      closeModal();
    } catch (error) {
      console.error("Error adding/updating document: ", error);
    }
  };

  const handleEdit = (record) => {
    setSelectedData(record);
    setFormState({
      ticketNumber: record.ticketNumber,
      dateOfApprehension: record.dateOfApprehension,
      timeOfApprehension: record.timeOfApprehension,
      nameOfDriver: record.nameOfDriver,
      gender: record.gender,
      age: record.age,
      vehicleClassification: record.vehicleClassification,
      placeOfViolation: record.placeOfViolation,
      violationType: record.violationType,
      violationDes: record.violationDes,
      fineStatus: record.fineStatus,
      apprehendingOfficer: record.apprehendingOfficer
    });
    openModal();
  };

  //search
  const [searchQuery, setSearchQuery] = useState("");
// Handle search input change
const handleSearchChange = (event) => {
  setSearchQuery(event.target.value);
  setCurrentPage(1); // Reset to first page when searching
};

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const filteredRecords = records.filter((record) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      record.ticketNumber.toString().toLowerCase().includes(lowerCaseQuery) ||
      record.nameOfDriver.toLowerCase().includes(lowerCaseQuery) ||
      record.vehicleClassification.toLowerCase().includes(lowerCaseQuery) ||
      record.placeOfViolation.toLowerCase().includes(lowerCaseQuery) ||
      record.violationType.toLowerCase().includes(lowerCaseQuery) ||
      record.apprehendingOfficer.toLowerCase().includes(lowerCaseQuery)
    );
  });

  // Sort the filtered records dynamically
const sortedRecords = [...filteredRecords].sort((a, b) => {
  if (!sortConfig.key) return 0; // No sorting if no key is selected
  if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "ascending" ? -1 : 1;
  if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "ascending" ? 1 : -1;
  return 0;
});


  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPageData = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

const goToNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage((prevPage) => prevPage + 1);
  }
};

const goToPreviousPage = () => {
  if (currentPage > 1) {
    setCurrentPage((prevPage) => prevPage - 1);
  }
};

const handlePageClick = (pageNumber) => {
  setCurrentPage(pageNumber);
};

useEffect(()=> {
  setFilteredData(records);
},[records]);

useEffect(() => {
  const lowerCaseQuery = searchQuery.toLowerCase();

  // Filter records based on the search query
  const filtered = records.filter((record) => {
    return (
      record.ticketNumber.toString().toLowerCase().includes(lowerCaseQuery) ||
      record.nameOfDriver.toLowerCase().includes(lowerCaseQuery) ||
      record.vehicleClassification.toLowerCase().includes(lowerCaseQuery) ||
      record.placeOfViolation.toLowerCase().includes(lowerCaseQuery) ||
      record.violationType.toLowerCase().includes(lowerCaseQuery) ||
      record.apprehendingOfficer.toLowerCase().includes(lowerCaseQuery)
    );
  });

  setFilteredData(filtered);
  setCurrentPage(1); // Reset to the first page when filtering
}, [searchQuery, records]);

useEffect(() => {
  if (sortConfig.key) {
    const sortedData = [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    setFilteredData(sortedData);
  }
}, [sortConfig, filteredData]);
  

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };


  return (
    <div className="app-container">
      <main className="main-section1">
        <div className="cards-container">
          <div className="card">
            <h3>Total Violations</h3>
            <p>{totalViolations}</p> {/* Display total violation count */}
            <FontAwesomeIcon icon={faTicket} size="2xl" rotation={90} style={{marginLeft:"210"}}/>
          </div>
          <div className="card">
          <h3>Highest Violation Type </h3>
          <p>{mostCommonViolation.count} for {mostCommonViolation.type}</p>
          <FontAwesomeIcon icon={faTicket} size="2xl" rotation={90} style={{marginLeft:"210"}}/>

            </div>
          <div className="card">
          <h3>Highest Vehicle Classification</h3>
          <p>{mostCommonVehicle.count} for {mostCommonVehicle.classification}</p>
          <FontAwesomeIcon icon={faCab} size="2xl" style={{marginLeft:"210"}}/>
            </div>

            <div className="card">
            <h3>Top 3 Places with Most Violations</h3>
                {top3Places.map((place, index) => (
                  <li key={index}>{place.place}: {place.count} violations</li>
                ))}
                <FontAwesomeIcon icon={faMapLocation}  size="2xl" style={{marginLeft:"210"}}/>
          </div>
        </div>
      </main>
    

      <section className="records-section1">
        <div className="csv-uploader-section">
          <CsvUploader onCsvUpload={handleCsvData} />
        </div>
        <div className="records-header">
          <h2 className="recorh2"><FontAwesomeIcon icon={faRectangleList} style={{marginRight:"10"}} />Records
          <div className="search-bar">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearchChange} className="search" /> <FontAwesomeIcon icon={faMagnifyingGlass} style={{marginLeft:"-50", marginTop:"30"}} />
          </div>
          </h2>
          <button onClick={() => handleSort('ticketNumber')} className="adddata1">
            {sortConfig.key === "ticketNumber" && sortConfig.direction === "ascending" ? (
              <FontAwesomeIcon icon={faArrowUpZA} style={{ color: "#fff", marginRight: "10px" }} />
            ) : (
              <FontAwesomeIcon icon={faArrowUpAZ} style={{ color: "#fff", marginRight: "10px" }} />
            )}
            Filter
          </button>
          <button onClick={openModal} className="adddata"> <FontAwesomeIcon icon={faUserPlus} style={{color: "#ffffff", marginRight:"10"}} />Add Record</button>

        </div>

        <div  className="records-table">
          
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('ticketNumber')}>Ticket Number <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th onClick={() => handleSort('dateOfApprehension')}>Date of Apprehension  <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th>Time of Apprehension</th>
                <th onClick={() => handleSort('nameOfDriver')} >Name of Driver  <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th>Gender</th>
                <th onClick={() => handleSort('age')}>Age </th>
                <th onClick={() => handleSort('vehicleClassification')}>Vehicle Type  <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th onClick={() => handleSort('placeOfViolation')}>Place of Violation <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th>Violation Type</th>
                <th>Violation Description</th>
                <th>Fine Status</th>
                <th onClick={() => handleSort('apprehendingOfficer')}>Apprehending Officer  <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.length > 0 ? (
                currentPageData.map((record, index) => (
                  <tr key={record.id || index}>
                    <td>{record.ticketNumber}</td>
                    <td>{record.dateOfApprehension}</td>
                    <td>{record.timeOfApprehension}</td>
                    <td>{record.nameOfDriver}</td>
                    <td>{record.gender}</td>
                    <td>{record.age}</td>
                    <td>{record.vehicleClassification}</td>
                    <td>{record.placeOfViolation}</td>
                    <td>{record.violationType}</td>
                    <td>{record.violationDes}</td>
                    <td>{record.fineStatus}</td>
                    <td>{record.apprehendingOfficer}</td>
                    <td>
                      <div className="buttons">
                        <button className="edit-button" onClick={() => handleEdit(record)}>
                           <FontAwesomeIcon icon={faPen} style={{color:"#fff"}} /> 
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(record.id)}
                        >
                           <FontAwesomeIcon icon={faTrashCan} style={{color:"#fff"}}   />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="norecord" ><p>No records to display
                    </p></td>
                </tr>
              )}
            </tbody>

          </table>

        </div>
        <div className="pagination">
          <button onClick={goToPreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => handlePageClick(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button onClick={goToNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>

      </section><br/><br/> <br/><br/>
 {/*  
<div className="records-section">
<Map onCsvUpload={handleCsvData} />
</div>*/}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Record"
        className="modal-content"
      >
        <h2>
          
          {selectedData ? "Edit Record" : "Add New Record"}</h2>
        <form onSubmit={handleSubmit} className="add-form">
          <label htmlFor="ticket-id">Ticket Number/ID</label>
          <input
            id="ticket-id"
            type="text"
            placeholder="Enter Ticket Number/ID"
            value={formState.ticketNumber}
            onChange={(e) => setFormState({ ...formState, ticketNumber: e.target.value })}
            required
          />

          <label htmlFor="date-of-apprehension">Date of Apprehension</label>
          <input 
            id="date-of-apprehension" 
            type="date" 
            value={formState.dateOfApprehension} 
            onChange={(e) => setFormState({ ...formState, dateOfApprehension: e.target.value })} 
            required 
          />

          <label htmlFor="time-of-apprehension">Time of Apprehension</label>
          <input
            id="time-of-apprehension"
            type="text"
            placeholder="Enter time (HH:MM:SS)"
            value={formState.timeOfApprehension}
            onChange={(e) => setFormState({ ...formState, timeOfApprehension: e.target.value })}
            required
          />

          <label htmlFor="driver-name">Name of Driver</label>
          <input 
            id="driver-name" 
            type="text" 
            placeholder="Enter Name of Driver" 
            value={formState.nameOfDriver} 
            onChange={(e) => setFormState({ ...formState, nameOfDriver: e.target.value })} 
            required 
          />

        <label htmlFor="gender">Gender</label>
            <select 
              id="gender" 
              value={formState.gender} 
              onChange={(e) => setFormState({ ...formState, gender: e.target.value })} 
              required 
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>

          <label htmlFor="age">Age</label>
          <input 
            id="age" 
            type="number" 
            placeholder="Enter Age" 
            value={formState.age} 
            onChange={(e) => setFormState({ ...formState, age: e.target.value })} 
            required 
          />

          <label htmlFor="classsification-of-vehicle">Classification of Vehicle</label>
              <select 
                id="classsification-of-vehicle" 
                value={formState.vehicleClassification} 
                onChange={(e) => setFormState({ ...formState, vehicleClassification: e.target.value })} 
                required 
              >
                <option value="" disabled>
                  Select classification of vehicle
                </option>
                <option value="PUV">PUV (Public Utility Vehicle)</option>
                <option value="Private">Private</option>
                <option value="Government">Government Vehicle</option>
                <option value="PUJ">PUJ (Public Utility Jeepney)</option>
                <option value="PUB">PUB (Public Utility Bus)</option>
                <option value="MC">Motorcycle</option>
                <option value="TRI">Tricycle</option>
              </select>

          <label htmlFor="place-of-violation">Place of Violation</label>
          <select 
            id="place-of-violation" 
            value={formState.placeOfViolation}  
            onChange={(e) => setFormState({ ...formState, placeOfViolation: e.target.value })} 
            required
          >
             <option value="" disabled>Select Place of Violation</option>
                <option value="Abuno">Abuno</option>
                <option value="Acmac-Mariano Badelles Sr.">Acmac-Mariano Badelles Sr.</option>
                <option value="Bagong Silang">Bagong Silang</option>
                <option value="Bonbonon">Bonbonon</option>
                <option value="Bunawan">Bunawan</option>
                <option value="Buru-un">Buru-un</option>
                <option value="Dalipuga">Dalipuga</option>
                <option value="Del Carmen">Del Carmen</option>
                <option value="Digkilaan">Digkilaan</option>
                <option value="Ditucalan">Ditucalan</option>
                <option value="Dulag">Dulag</option>
                <option value="Hinaplanon">Hinaplanon</option>
                <option value="Hindang">Hindang</option>
                <option value="Kabacsanan">Kabacsanan</option>
                <option value="Kalilangan">Kalilangan</option>
                <option value="Kiwalan">Kiwalan</option>
                <option value="Lanipao">Lanipao</option>
                <option value="Luinab">Luinab</option>
                <option value="Mahayahay">Mahayahay</option>
                <option value="Mainit">Mainit</option>
                <option value="Mandulog">Mandulog</option>
                <option value="Maria Cristina">Maria Cristina</option>
                <option value="Palao">Palao</option>
                <option value="Panoroganan">Panoroganan</option>
                <option value="Poblacion">Poblacion</option>
                <option value="Puga-an">Puga-an</option>
                <option value="Rogongon">Rogongon</option>
                <option value="San Miguel">San Miguel</option>
                <option value="San Roque">San Roque</option>
                <option value="Santa Elena">Santa Elena</option>
                <option value="Santa Filomena">Santa Filomena</option>
                <option value="Santiago">Santiago</option>
                <option value="Santo Rosario">Santo Rosario</option>
                <option value="Saray">Saray</option>
                <option value="Suarez">Suarez</option>
                <option value="Tambacan">Tambacan</option>
                <option value="Tibanga">Tibanga</option>
                <option value="Tipanoy">Tipanoy</option>
                <option value="Tomas L. Cabili (Tominobo Proper)">Tomas L. Cabili (Tominobo Proper)</option>
                <option value="Tubod">Tubod</option>
                <option value="Ubaldo Laya">Ubaldo Laya</option>
                <option value="Upper Hinaplanon">Upper Hinaplanon</option>
                <option value="Upper Tominobo">Upper Tominobo</option>
                <option value="Villa Verde">Villa Verde</option>
          </select>

          <label htmlFor="violation-type">Violation Type</label>
          <select 
            id="violation-type" 
            type="text" 
            placeholder="Enter Violation Type" 
            value={formState.violationType} 
            onChange={(e) => setFormState({ ...formState, violationType: e.target.value })} 
            required 
          >
          <option value="" disabled>
              Select Violation Type
            </option>
            {violationTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>

           <label htmlFor="violation-description">Violation Description</label>
            <textarea
              id="violation-description"
              placeholder="Enter details about the violation"
              value={formState.violationDes}
              onChange={(e) =>
                setFormState({ ...formState, violationDes: e.target.value })
              }
              rows="4"
              required
            ></textarea>
         

        <label htmlFor="fine-status">Fine Status</label>
            <select 
              id="fine-status" 
              value={formState.fineStatus} 
              onChange={(e) => setFormState({ ...formState, fineStatus: e.target.value })} 
              required 
            >
              <option value="" disabled>
                Select Fine Status
              </option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>

          <label htmlFor="apprehending-officer">Apprehending Officer</label>
          <input 
            id="apprehending-officer" 
            type="text" 
            value={formState.apprehendingOfficer} 
            onChange={(e) => setFormState({ ...formState, apprehendingOfficer: e.target.value })} 
            required 
          />

          <button type="submit" className="submitadd">Submit<FontAwesomeIcon icon={faFloppyDisk} style={{color: "#ffffff", marginLeft:"10"}} /></button>
          <button type="button" className="close-modal-btn" onClick={closeModal}>Cancel <FontAwesomeIcon icon={faXmark} style={{color: "#ffffff", marginLeft:"10"}} /> </button>
        </form>
      </Modal>
    </div>
  );
};

export default LandingPage;