// src/components/AppTour.jsx
import { useState, useEffect } from "react";
import Joyride from "react-joyride";

export default function AppTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const startTour = () => {
      if (!localStorage.getItem("seenTour")) {
        // Wait for elements to be available
        const checkElements = () => {
          const elements = ['.teacher-dashboard', '.uploadButton', '.downloadTemplate'];
          const allExist = elements.every(selector => {
            const element = document.querySelector(selector);
            console.log(`Checking ${selector}:`, element ? 'Found' : 'Not found');
            return element !== null;
          });
          
          if (allExist) {
            console.log('All elements found, starting tour');
            setRun(true);
          } else {
            setTimeout(checkElements, 100);
          }
        };
        
        setTimeout(checkElements, 500);
      }
    };
    
    startTour();
  }, []);

  const handleCallback = ({ status, type, index }) => {
    console.log("Joyride callback:", { status, type, index });
    
    if (["finished", "skipped"].includes(status)) {
      localStorage.setItem("seenTour", "true");
      setRun(false);
    }
  };

  const steps = [
    {
      target: ".teacher-dashboard",
      content: "This is your dashboard where you can see all students and assignments.",
      placement: "center"
    },
    {
      target: ".uploadButton",
      content: "Use this button to upload student grades.",
      placement: "bottom"
    },
    {
      target: ".downloadTemplate", 
      content: "Click here to download a CSV template for uploading.",
      placement: "bottom"
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: "#181ED9",
          zIndex: 10000,
        },
      }}
    />
  );
}
