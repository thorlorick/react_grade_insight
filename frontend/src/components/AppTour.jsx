// src/components/AppTour.jsx
import { useState, useEffect } from "react";
import Joyride from "react-joyride";
import styles from './AppTour.module.css';


export default function AppTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    
    if (!hasSeenTour) {
      // Start the tour after a small delay to ensure elements are loaded
      setTimeout(() => {
        setRun(true);
      }, 1000);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    
    // Tour is finished or skipped
    if (status === 'finished' || status === 'skipped') {
      localStorage.setItem("hasSeenTour", "true");
      setRun(false);
    }
  };

  const steps = [
    {
      target: 'input[type="text"]', // Target the search input directly
      content: "Use this search bar to find specific students or assignments quickly.",
    },
    {
      target: `.${styles.uploadButton}`, // Use your existing CSS module class
      content: "Click here to upload your student grades from a CSV file.",
    },
    {
      target: `.${styles.downloadTemplate}`, // Use your existing CSS module class
      content: "Download a CSV template to see the correct format for uploading grades.",
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#181ED9',
        }
      }}
    />
  );
}
