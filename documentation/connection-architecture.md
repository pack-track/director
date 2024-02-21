# Connection Architecture
ACTS needs to be in constant contact with various devices and traction units.
The connections must be reliable, fast and fault-tolerant.
Most of this is handled by the TCP/IP stack and redundant networking infrastructure.

We generally use **TCP port 141**, and **UDP port 142 / 143** for discovery.

## Detecting failing devices
Devices may fail at any time, due to software, hardware, networking or power issues. 
This has to be detected as quickly as possible.
The devices on our network may only send packets once a year, yet we must make sure that when that time comes, nothing will prevent those packets from being sent.

TCP allows us to send keep alive packets.
This sends a empty TCP packet on a given interval.
Those packages generate small but repeating work for the networking gear.

We have settled on **5000ms** idle time. 
This is very short, the linux system default is two hours.
The load on the network should not be an issue.

The keep-alive is sent from the server side.

## Server / Client assignment
There is only one server in an ACTS district.
The server is running the ACTS controller.
All other devices connect to the server and receive commands from it.

When disconnected, the devices enable their emergency mode and try to reconnect to the server continuously.
For example, a level crossing will close its gates until it is reconnected and gets a open command.

## Protocol Message Size
Altho a small bytes-only protocol might seem more efficient, they do not speed up transmissions.
TCP usually sends packets up to 1500 bytes at a time, where routing makes up for the most latency, not the data size.
A human readable protocol is easier to debug, maintain and upgrade.

## Service Discovery
Service discovery is done using a UDP broadcast packet.