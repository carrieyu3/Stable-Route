import React, { useEffect, useState } from "react";
import { ArrowLeft , ArrowRight } from 'react-bootstrap-icons';

const StartDisplay = () => {
  return (
    <>
      <p><b>Starting location</b>: [originHere]</p>
      <br/>
    </>
  )
}

const EndDisplay = () => {
  return (
    <>
    <br/>
      <p><b>Ending location</b>: [detinationHere]</p>
    </>
  )
}

const WalkRoute = () => {
  return (
    <>
      <div style={{color: "#000", width: "90%" , borderLeft: "6px dotted #000" , padding: "9px"}}>
        <p style={{fontSize: "1.2em" , fontWeight: "bold"}}>Walk from PointA to PointB</p>
        <p>x:xx to x:xx</p>
        <p>[time] minutes</p>
      </div>
    </>
  )
}

const TrainRoute = () => {
  return (
    <>
      <div style={{color: "#000", width: "90%" , borderLeft: "6px solid #000" , padding: "9px"}}>
        <p style={{fontSize: "1.2em" , fontWeight: "bold"}}>Take the [train] train from PointA to PointB</p>
        <p>Train | Uptown or downtown?</p>
        <p>x:xx to x:xx</p>
        <p>[time] minutes</p>
        <p>Next train arrives in: xx </p>
      </div>
    </>
  )
}

const BusRoute = () => {
  return (
    <>
      <div style={{color: "#000", width: "90%" , borderLeft: "6px dashed #000" , padding: "9px"}}>
        <p style={{fontSize: "1.2em" , fontWeight: "bold"}}>Take the [bus] bus from PointA to PointB</p>
        <p>Bus | Uptown or downtown?</p>
        <p>x:xx to x:xx</p>
        <p>[time] minutes</p>
        <p>Next bus arrives in: xx </p>
      </div>
    </>
  )
}

type BoxVIsible = {
  isVisible: boolean;
};

export const Box: React.FC<BoxVIsible> = ({ isVisible }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isVisible) return null;

  return (
    <div
      style={{ position: "absolute", top: "150px", transform: isCollapsed ? "translateX(-420px)" : "translateX(0)", transition: "transform 0.3s ease", width: "450px", height: "70%", backgroundColor: "white", border: "1px solid #ccc", marginTop: "0px", overflow: "hidden", zIndex: 1000 }}
    >
      {/* Content (hidden when collapsed) */}
      {!isCollapsed && (
        <div style={{ padding: "10px", flex: 1 }}>

          <div style={{overflowY: "scroll" , width: "95%"}}>
            {StartDisplay()}
            {WalkRoute()}
            {TrainRoute()}
            {BusRoute()}
            {EndDisplay()}

            {/* once i have the below working, we wont need the above */}
            {/* {DisplayRoute()} */}

          </div>
          
        </div>
      )}

      {/* Close / Open Button */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        style={{
          position: "absolute",
          right: "5px",  top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "white",
          zIndex: 2,
          height: "100%",
        }}
      >
        {isCollapsed ? <ArrowRight/> : <ArrowLeft/>}
      </button>
    </div>
  );
};
