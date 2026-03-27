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

export interface transit {
    publicCode: string,
    stopId: String,
    directionId ?: Number
}

export interface busAlert {
  alert_description: String
}
export interface busPlannedWork{
  pw_end_date : String
  pw_header: String
  pw_description: String
}