import "./all.css";
import React, { useState, useEffect } from "react";
import { Bar, Line, Scatter, Pie, Doughnut } from 'react-chartjs-2';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from './firebase';
import TopSection from "./timeflip";
import car from './cardash.gif';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpAZ, faCab, faFilter, faFloppyDisk, faMagnifyingGlass, faPen, faRectangleList, faTicket, faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title,Tooltip, Legend } from 'chart.js';
import { faMapLocation } from "@fortawesome/free-solid-svg-icons/faMapLocation";


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


  //graphs
  const genderChartData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        label: 'Gender Distribution',
        data: genderData, // Example: [50, 30] for male and female counts
        backgroundColor: ['#4e73df', '#1cc88a'],
        borderColor: ['#4e73df', '#1cc88a'],
        borderWidth: 1,
      },
    ],
  };
  const fineStatusChartData = {
    labels: ['Paid', 'Unpaid'], 
    datasets: [
      {
        label: 'Fine Status Distribution',
        data: fineStatusData, // Example: [10, 20, 30, 40, 50] for each age group count
        backgroundColor: ['#4e73df', '#1cc88a'],
        borderColor: ['#4e73df', '#1cc88a'],
        borderWidth: 1,
      },
    ],
  };
  const ageChartData = {
    labels: ['0-18', '19-30', '31-40', '41-50', '51+'], // Age groups
    datasets: [
      {
        label: 'Age Distribution',
        data: ageData, // Example: [10, 20, 30, 40, 50] for each age group count
        backgroundColor: '#ff6384',
        borderColor: '#ff6384',
        borderWidth: 1,
      },
    ],
  };
//time
const today = new Date();
const formattedDate = today.toLocaleDateString('en-US')

  return (
    <div className="app-container">
      <main className="main-section">
        <div>
          <div className="placeholder large">
            <img src={car} alt="Logo" className="banner" />
          </div>
          <TopSection formattedDate={formattedDate}/>
        </div>

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

        <div className="bottom-section">
          <div className="placeholder medium">
            {/* Gender Distribution Bar Chart */}
            <h2>Gender Distribution</h2>
            <Bar data={genderChartData} />

          </div>
          <div className="placeholder medium">
            {/* Age Distribution Bar Chart */}
            <h2>Age Distribution</h2>
            <Bar data={ageChartData} />


          </div>
          <div className="placeholder medium">
            {/* fine status Distribution Bar Chart */}
            <h2>Fine Status Distribution</h2>
            <Bar data={fineStatusChartData} />
          </div>
          
        </div>
      </main>
      <main className="main-section">
  
        <div className="bottom-section1">

          <div className="placeholder medium1">
           {/* Vehicle Classification Donut Chart */}
           <h2>Vehicle Classification</h2>
           <Doughnut
        data={{
          labels: Object.keys(vehicleClassificationData),
          datasets: [
            {
              data: Object.values(vehicleClassificationData),
              backgroundColor: [
                "#ff6384",
                "#36a2eb",
                "#ffcd56",
                "#ff9f40",
                "#4e73df",
                "#1cc88a",
                "#f6c23e",
                "#36b9cc",
                "#f1f1f1",
                "#e74a3b",
                "#5a5b8c",
                "#e77d8e",
                "#3b8b8c",
                "#b9c3c9",
                "#abb2b9",
              ],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "right", // You can adjust the position of the legend
            },
            tooltip: {
              enabled: true, // Enable tooltips to show more info on hover
            },
          },
        }}
      />
          </div>
          <div className="placeholder medium1">
           {/* violation type Donut Chart */}
           <h2>Violation Type</h2>
      <Doughnut
        data={{
          labels: Object.keys(violationTypeData), // Dynamic labels based on violation types
          datasets: [
            {
              data: Object.values(violationTypeData), // Data counts dynamically set from violationCounts
              backgroundColor: [
                "#ff6384", // Color for first category
                "#36a2eb", // Color for second category
                "#ffcd56", // Color for third category
                "#ff9f40", // Color for fourth category
                "#4caf50", // Additional colors for more categories (you can add more)
              ],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "right", // You can adjust the position of the legend
            },
            tooltip: {
              enabled: true, // Enable tooltips to show more info on hover
            },
          },
        }}
      />
          </div>
          
        </div>
      </main> <br/><br/><br/><br/><br/><br/><br/><br/>
    </div>
  );
};

export default LandingPage;