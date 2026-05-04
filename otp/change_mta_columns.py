import zipfile
import os
from dotenv import load_dotenv
from sodapy import Socrata
import csv

load_dotenv()
API_KEY = os.getenv("DATA_NY_KEY")

def zipAllFiles(file_name):
    # Zip the files that were extracted
    set = {"agency.txt", "calendar.txt","calendar_dates.txt", "routes.txt", "shapes.txt", "stop_times.txt", "stops.txt", "transfers.txt", "trips.txt"}
    updated_zip = zipfile.ZipFile(file_name,'w',zipfile.ZIP_DEFLATED)
    for root,dirs,files in os.walk('.'):
        for file in files:
            if file in set:
                file_path = os.path.join(root, file)
                updated_zip.write(file_path, os.path.relpath(file_path, '.'))
    print("Zipped:", file_name)

def deleteUnZipFiles():
    # delete files after extracting them
    set = {"agency.txt", "calendar.txt","calendar_dates.txt", "routes.txt", "shapes.txt", "stop_times.txt", "stops.txt", "transfers.txt", "trips.txt"}
    for root, dirs, files in os.walk('./', topdown=False):
        for file in files:
            if file in set:
                os.remove(os.path.join(root, file))
    print("Deleted unZipped files\n")

def stopsADA(lines, outfile):
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

def addColumn(lines, outfile, column_name, mode):
    
    first_line = lines[0]
    first_line = first_line.rstrip('\n') + column_name
    outfile.write(first_line)
    if outfile.name == "trips.txt" or mode == "bus":
        for line in lines[1:]:
            new_line = ""
            if mode == "subway":
                new_line = line.rstrip('\n') + ",0\n"
            elif mode == "bus":
                new_line = line.rstrip('\n') + ",1\n" 
            outfile.write(new_line)
        
    return

def load_ada_data(csv_file):
    stops = {}
    with open(csv_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            key = row.get("gtfs_stop_id")
            if key:
                stops[key] = row
    return stops
def csv_stopsADA(lines,outfile):
    stops = load_ada_data("ada_stops.csv")  # <-- your saved CSV

    for line in lines[1:]:
        stop_id = line.split(",")[0]
        key = stop_id.rstrip("NS")
        row = stops.get(key)

        if not row:
            outfile.write(line.rstrip('\n') + ",\n")
            continue

        if stop_id.endswith("N"):
            val = row.get("ada_northbound", "")
        elif stop_id.endswith("S"):
            val = row.get("ada_southbound", "")
        else:
            val = row.get("ada", "")

        outfile.write(line.rstrip('\n') + f",{val}\n")
def subway():
    # extracts the needed files from the zip
    zObject = zipfile.ZipFile('gtfs_subway.zip', 'r')
    zObject.extractall()
    
    input_file = "stops.txt"
    output_file = "stops.txt"
    infile = open(input_file, 'r')
    lines = infile.readlines()
    outfile = open(output_file, "w")
    addColumn(lines, outfile, ",wheelchair_boarding\n","subway")
    # stopsADA(lines, outfile)
    csv_stopsADA(lines, outfile)
    infile.close()
    outfile.close()
    
    
    input_file = "trips.txt"
    output_file = "trips.txt"
    infile = open(input_file, 'r')
    lines = infile.readlines()
    outfile = open(output_file, "w")
    addColumn(lines, outfile, ",wheelchair_accessible\n","subway")
    infile.close()
    outfile.close()
    zipAllFiles("gtfs_subway.zip")
    deleteUnZipFiles()
                
    print("FINISHED SUBWAY\n")
    return

def Bus(file_name):
    zObject = zipfile.ZipFile(file_name, 'r')
    zObject.extractall()
    input_file = "stops.txt"
    output_file = "stops.txt"
    infile = open(input_file, 'r')
    lines = infile.readlines()
    outfile = open(output_file, "w")
    addColumn(lines,outfile,",wheelchair_boarding\n", "bus")
    infile.close()
    outfile.close()
    
    input_file = "trips.txt"
    output_file = "trips.txt"
    infile = open(input_file, 'r')
    lines = infile.readlines()
    outfile = open(output_file, "w")
    addColumn(lines,outfile,",wheelchair_accessible\n", "bus")
    infile.close()
    outfile.close()
    
    return
def main():
    subway()
    set = {"gtfs_b.zip","gtfs_busco.zip","gtfs_bx.zip","gtfs_m.zip","gtfs_q.zip","gtfs_si.zip"}
    for root,dirs,files in os.walk('.'):
        for file in files:
            if file in set:
                Bus(file)
                zipAllFiles(file)
                deleteUnZipFiles()
    return


if __name__ == "__main__":
    main()