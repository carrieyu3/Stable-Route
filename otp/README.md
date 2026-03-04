# OpenTripPlanner Folder to get routes using GraphQL

Need 2 seperate files needed for OTP to run
- otp-shaded-2.8.1.jar
- new-york_new-york.osm.pbf

Once you have to these Files, you must run the jar file which would download a graph.obj into the same folder

## Running jar file
Before runnning, you need to be in the same directory as the jar file

- java -Xmx4G -jar otp-shaded-2.8.1.jar --build --save .

## Loading the graph

- java -Xmx2G -jar otp-shaded-2.8.1.jar --load .