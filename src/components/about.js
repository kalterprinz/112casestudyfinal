import React, { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel CSS
import "./about.css";
import car2 from "./police.gif";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

const About = () => {
  // Declare the modal state and data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalText, setModalText] = useState("");

  // Function to open the modal
  const openModal = (image, description, text) => {
    setModalImage(image);
    setModalDescription(description);
    setModalText(text);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage("");
    setModalDescription("");
    setModalText("");
  };

  return (
    <div className="about-container">
      {/* Main Overview Section */}
      <div className="about-row">
        <div className="about-text">
          <div className="text-section">
            <h2>Traffic Violation Data Management System</h2>
            <p>
              Welcome to our Traffic Violation Management System. This
              web-based platform has been designed to streamline the process of
              managing and monitoring traffic violations, offering an efficient
              solution for law enforcement. The system provides a comprehensive,
              user-friendly interface for tracking violations, managing records,
              and generating insights through data analysis.
            </p>
            <p>
              <strong>Key Features of the System:</strong>
              <ul>
                <li>
                  <strong>Record Management</strong>: Easily add, update, and
                  manage traffic violation records with detailed information
                  such as ticket numbers, driver details, violation types, and
                  fine statuses.
                </li>
                <li>
                  <strong>Data Search & Filtering</strong>: Quickly search for
                  and filter violation records based on various parameters,
                  including ticket number, driver name, place of violation, and
                  more.
                </li>
                <li>
                  <strong>Sorting & Pagination</strong>: Sort records based on
                  key fields like ticket number, date of apprehension, and
                  driver name. Pagination ensures smooth navigation even with
                  large datasets.
                </li>
                <li>
                  <strong>Analytics & Reports</strong>: Visualize important
                  metrics through charts and graphs that display data about
                  violations, gender distribution, age groups, and violation
                  types.
                </li>
                <li>
                  <strong>Interactive Dashboard</strong>: An intuitive dashboard
                  displays key statistics and charts, helping users quickly
                  assess trends and make data-driven decisions.
                </li>
              </ul>
            </p>
            <p>
              With this system, we aim to enhance efficiency, accuracy, and
              transparency in traffic violation management, ultimately
              contributing to safer roads and a more organized traffic
              enforcement process.
            </p>
          </div>
          <div className="image-section">
            <img src={car2} alt="Traffic Management System" className="banner1" />
          </div>
        </div>
      </div>

      {/* Slideshow and Cards Section */}
      <div className="about-text">
        <div className="left-section">
          {/* Slideshow Carousel */}
          <Carousel
            showArrows={true}
            infiniteLoop={true}
            showThumbs={false}
            showStatus={false}
            autoPlay={true}
            interval={3000}
          >
            <div>
              <img src="/photo1.jpg" alt="Traffic Management" />
            </div>
            <div>
              <img src="/photo2.jpg" alt="Parking Management" />
            </div>
            <div>
              <img src="/photo3.jpg" alt="Urban Mobility" />
            </div>
          </Carousel>
        </div>

        <div className="right-section">
          <div className="about-box-container">
            {/* Card 1 */}
            <div
              className="about-box"
              onClick={() =>
                openModal(
                  "/ictpmo.jpg",
                  "Iligan City Traffic and Parking Management",
                  "The Iligan City Traffic and Parking Management Office (ICTPMO) plays a crucial role in ensuring smooth traffic flow and parking management within the city. Through the use of advanced technologies, ICTPMO monitors traffic violations, enforces parking regulations, and manages the issuance of tickets electronically. The office focuses on creating a safer, more organized environment for residents and visitors by facilitating efficient traffic management and streamlining enforcement processes."
                )
              }
            >
              <div className="image-container">
                <img src="/ictpmo.jpg" alt="ICTPMO" />
              </div>
              <div className="card-content">
                <p className="box-title">
                  Iligan City Traffic and Parking Management
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="about-box"
              onClick={() =>
                openModal(
                  "/lto.jpg",
                  "Land Transportation Office",
                  "The Land Transportation Office (LTO) E-Ticketing System provides a modern and efficient method for managing traffic-related violations. It offers quick issuance of tickets and digital record-keeping for better law enforcement. This system enhances the efficiency of traffic regulation by allowing authorities to issue tickets on the spot, reducing manual paperwork and ensuring accurate tracking of violations."
                )
              }
            >
              <div className="image-container">
                <img src="/lto.jpg" alt="LTO" />
              </div>
              <div className="card-content">
                <p className="box-title">Land Transportation Office</p>
              </div>
            </div>

            {/* Card 3 */}
            <div
              className="about-box"
              onClick={() =>
                openModal(
                  "/npa.png",
                  "Philippine National Police",
                  "The Philippine National Police (PNP) is the national law enforcement agency responsible for maintaining peace and order. The E-Ticketing System provides the PNP with a powerful digital tool for monitoring and managing traffic-related incidents, enabling efficient issuance of digital tickets and better law enforcement transparency."
                )
              }
            >
              <div className="image-container">
                <img src="/npa.png" alt="PNP" />
              </div>
              <div className="card-content">
                <p className="box-title">Philippine National Police</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal1" onClick={closeModal}>
          <div
            className="modal-content1"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on inner click
          >
            {/* Close Button */}
            <button className="close-btn1" onClick={closeModal}>
              <FontAwesomeIcon icon={faCircleXmark} />
            </button>

            {/* Modal Image */}
            {modalImage && (
              <img src={modalImage} alt="Modal Content" className="modal-image1" />
            )}

            {/* Modal Description */}
            <div className="modal-description1">
              <h3>{modalDescription}</h3>
              <p>{modalText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
