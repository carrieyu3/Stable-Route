interface coordinates {
    latitude ?: Long
    longitude ?: Long  
}

export interface route {
    origin:coordinates
    destination: coordinates
    transportModes: Array<JSON>
    numTripPatterns: Number
}
