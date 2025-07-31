About this app
GoalEats – Nutrition Calculator

GoalEats is a lightweight, responsive web app that helps users calculate personalized nutrition plans based on their goals, body metrics, and food preferences.
 Image Details
Docker Hub Repository:
[https://hub.docker.com/r/kevin368/nuty](https://hub.docker.com/r/kevin368/nuty)
- Image Name: `kevin368/nuty`
- Tags:  
  - `v1` –  as initial production release
 Build Instructions

To build the Docker image locally from your project directory (where your `dockerfile`, `index.html`, `style.css`, and `script.js` are located):
```bash
docker build -t kevin368/nuty:v1 .


Run Instructions (on Web01/Web02)

To run the container on your servers (e.g., Web01, Web02), execute:
docker run -d -p 80:80 --name nuty-app kevin368/nuty:v1


Optional Environment Variables or Volumes
This version doesn't require environment variables or volumes, but if secrets or dynamic configs were involved, you could use:
docker run -d -p 80:80 \
  -e API_KEY=your-api-key-here \
  -v /host/config.json:/app/config.json \
  --name nuty-app kevin368/nuty:v1


 Load Balancer Configuration (HAProxy Example)
To enable round-robin load balancing between two backend servers (Web01 and Web02), use the following HAProxy config snippet:
frontend http_front
    bind *:80
    default_backend servers
backend servers
    balance roundrobin
    server web01 192.168.1.10:80 check
    server web02 192.168.1.11:80 check


 Testing Steps & Evidence
Open a browser or use curl:
curl http://localhost 8080


 Project Structure
NUTY/
├── dockerfile
├── index.html
├── style.css
├── script.js
└── README.md



 Author
Ntare Kevin
GitHub: @Ntarekevin
