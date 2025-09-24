// src/AppTour.jsx
import { useState, useEffect } from "react";
import Joyride from "react-joyride";

export default function AppTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("seenTour")) {
      setRun(true);
    }
  }, []);

  const handleCallback = ({ status }) => {
    if (["finished", "skipped"].includes(status)) {
      localStorage.setItem("seenTour", "true");
      setRun(false);
    }
  };

  const steps = [
    {
      target: ".teacher-dashboard",
      content: "This is your dashboard where you can see all students and assignments."
    },
    {
      target: ".uploadButton",
      content: "Use this button to upload student grades."
    },
    {
      target: ".downloadTemplate",
      content: "Click here to download a CSV template for uploading."
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
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
