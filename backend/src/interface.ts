interface coordinates {
    latitude : Long
    longitude : Long  
}

export interface route {
    origin:coordinates
    destination: coordinates
    transportModes: Array<JSON>
    numTripPatterns: Number
}

export interface bus {
    publicCode: String,
    stopId: String,
    directionId: Number
}

export interface busAlert {
  alert_description: String
}
export interface busPlannedWork{
  PW_end_date : String
  PW_header: String
  PW_description: String
}