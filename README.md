# SmartDKDH - Home Automation System

SmartDKDH is a comprehensive IoT-based home automation system that allows users to monitor and control various home devices through a mobile application. The system integrates with the Adafruit IO platform to provide real-time device control and sensor monitoring.

## Project Structure
The project consists of two main components:
- **Mobile Application (home-app)**: A React Native app built with Expo
- **Backend Server**: A FastAPI-based server handling data and device management

## Features

### Mobile Application
- **User Authentication**: Secure login and registration system
- **Device Control**: Control LED lights and fans remotely
- **Sensor Monitoring**: View real-time data from temperature and humidity sensors
- **Profile Management**: User profile updates with secure data handling
- **Voice Control**: Voice commands for device operation
- **Real-time Updates**: WebSocket connection for instant device status updates

### Backend Server
- **REST API**: RESTful endpoints for data access and modification
- **WebSocket Service**: Real-time communication with client applications
- **MongoDB Integration**: Persistent data storage with MongoDB
- **Adafruit IO Integration**: Connection to Adafruit IoT platform
- **User Management**: CRUD operations for user accounts
- **Device Management**: Registration and control of connected devices

## Technologies

### Mobile Application
- **React Native / Expo**: Cross-platform mobile framework
- **Expo Router**: File-based navigation system
- **AsyncStorage**: Local data persistence
- **React Native Animated**: UI animations
- **WebSocket**: Real-time communication

### Backend
- **FastAPI**: Modern, high-performance web framework for Python
- **MongoDB**: NoSQL database for data storage
- **PyMongo**: MongoDB driver for Python
- **Pydantic**: Data validation and settings management
- **WebSockets**: Real-time communication protocol

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- MongoDB
- Adafruit IO account
- Android Studio / Xcode (for mobile development)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   Create a `.env` file and add the following:
   ```
   MONGODB_URI=<your-mongodb-uri>
   ADAFRUIT_IO_KEY=<your-adafruit-io-key>
   ADAFRUIT_IO_USERNAME=<your-adafruit-io-username>
   SECRET_KEY=<your-secret-key>
   ```
5. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### Mobile App Setup
1. Navigate to the home-app directory:
   ```bash
   cd home-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure API endpoint:
   Update the `API_BASE_URL` in the appropriate files to point to your backend server
4. Start the Expo development server:
   ```bash
   npx expo start
   ```
5. Run on a device or emulator:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan the QR code with the Expo Go app on your physical device

## API Endpoints

### User Management
- `POST /api/users`: Register a new user
- `GET /api/users/{user_no}`: Get user details
- `PATCH /api/users/{user_no}`: Update user profile
- `DELETE /api/users/{user_no}`: Delete a user

### Authentication
- `POST /api/auth/login`: User login
- `POST /api/auth/logout`: User logout

### Device Management
- `GET /led-devices`: List all LED devices
- `GET /fan-devices`: List all fan devices
- `POST /led-control`: Control LED device
- `POST /fan-control`: Control fan device

### WebSocket
- `/ws`: WebSocket endpoint for real-time updates

## Project Architecture

### Mobile App
- **Flux Pattern (Redux)**: For state management
- **Component Composition Pattern**: For UI building
- **Container/Presentational Pattern**: For separating logic and UI
- **Observer Pattern**: For real-time updates
- **Command Pattern**: For voice control

### Backend
- **MVC Pattern**: For API organization
- **Repository Pattern**: For data access
- **REST API Pattern**: For HTTP endpoints
- **WebSocket Pattern**: For real-time communication
- **Middleware Pattern**: For request processing

## Future Enhancements
- **Automation Rules**: Allow users to create custom automation rules
- **Energy Monitoring**: Track energy usage of connected devices
- **Scene Management**: Create and save device configurations as scenes
- **Two-factor Authentication**: Add additional security layer
- **Offline Mode**: Basic functionality when internet is unavailable

## Contributors
This project is maintained by the SmartDKDH team.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Adafruit IO for the IoT platform
- FastAPI for the efficient API framework
- Expo for simplifying mobile development
- MongoDB for database services
