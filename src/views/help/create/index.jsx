import React from "react";
import { useNavigate } from "react-router-dom";
import TicketCreateView from "@/pages/help/components/TicketCreateView";

function CreateHelpPage() {
  const navigate = useNavigate();

  return (
    <TicketCreateView
      setActiveView={(view) => {
        if (view === "list") navigate("/help");
      }}
    />
  );
}

export default CreateHelpPage;
