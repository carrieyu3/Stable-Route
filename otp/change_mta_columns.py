import zipfile
import os
from dotenv import load_dotenv
from sodapy import Socrata

load_dotenv()
API_KEY = os.getenv("DATA_NY_KEY")

def stopsADA(lines, outfile):
    # Load in the data of all stops -> make a dictionary for easy look up
    client = Socrata("data.ny.gov", API_KEY)
    data = client.get("39hk-dx4f", limit=50000)
    stops = {}
    for row in data:
        stops[row["gtfs_stop_id"]] = row
    for line in lines[1:]:
        stop_id = line.split(",")[0]
        key = stop_id[:3]
        row = stops.get(key)
        if not row:
            continue
        # Stops are either northbound, southbound, or the parent
        if stop_id[-1] == "N":
            ada_northbound = row["ada_northbound"]
            updated_line = line.rstrip('\n') + ','+str(ada_northbound) +'\n'
        elif stop_id[-1] == "S":
            ada_southbound = row["ada_southbound"]
            updated_line = line.rstrip('\n') + ','+str(ada_southbound)+'\n'
        else:
            ada = row["ada"]
            updated_line = line.rstrip('\n') + ','+str(ada)+'\n'
        outfile.write(updated_line)
        
    return

def addColumn(lines, outfile, column_name):
    
    first_line = lines[0]
    first_line = first_line.rstrip('\n') + column_name
    outfile.write(first_line)
    if outfile.name == "trips.txt":
        for line in lines[1:]:
            new_line = line.rstrip('\n') + ",0\n"
            outfile.write(new_line)
    return
def main():
    # extracts the needed files from the zip
    zObject = zipfile.ZipFile('gtfs_subway.zip', 'r')
    zObject.extractall()
    
    # Add ADA field for stops 
    input_file = "stops.txt"
    output_file = "stops.txt"
    infile = open(input_file, 'r')
    lines = infile.readlines()
    outfile = open(output_file, "w")
    addColumn(lines, outfile, ",wheelchair_boarding\n")
    stopsADA(lines, outfile)
    infile.close()
    outfile.close()
    
    # Add ADA field for trips
    input_file = "trips.txt"
    output_file = "trips.txt"
    infile = open(input_file, 'r')
    lines = infile.readlines()
    outfile = open(output_file, "w")
    addColumn(lines, outfile, ",wheelchair_accessible\n")
    infile.close()
    outfile.close()
    
    # Zip the files that were extracted
    set = {"agency.txt", "calendar.txt","calendar_dates.txt", "routes.txt", "shapes.txt", "stop_times.txt", "stops.txt", "transfers.txt", "trips.txt"}
    updated_zip = zipfile.ZipFile("gtfs_subway.zip",'w',zipfile.ZIP_DEFLATED)
    for root,dirs,files in os.walk('.'):
        for file in files:
            if file in set:
                file_path = os.path.join(root, file)
                updated_zip.write(file_path, os.path.relpath(file_path, '.'))
    
    
    
    # delete files after extracting them
    for root, dirs, files in os.walk('./', topdown=False):
        for file in files:
            if file in set:
                os.remove(os.path.join(root, file))
    print("FINISHED")
    return


if __name__ == "__main__":
    main()