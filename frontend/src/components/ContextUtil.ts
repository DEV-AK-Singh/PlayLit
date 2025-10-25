import React from "react";
import { MyContext } from "../Context";

export const useMyContext = () => {
  const context = React.useContext(MyContext);
  if (context === undefined) {
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return context;
};