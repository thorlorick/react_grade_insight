import { useState, useEffect } from "react";
import Joyride from "react-joyride";

export default function AppTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check localStorage to see if the tour was already shown
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
      target: ".sidebar",
      content: "This is the sidebar where you can navigate through sections.",
    },
    {
      target: ".dashboard",
      content: "Here’s your dashboard with an overview of everything.",
    },
    {
      target: ".settings",
      content: "Click here to access settings.",
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: "#181ED9", // match your theme
          zIndex: 10000,
        },
      }}
    />
  );
}
