# Slackr - A Real-time Messaging Application

## Overview
Slackr is a modern, responsive web-based messaging application built with vanilla JavaScript. It's a simplified version of Slack, designed to demonstrate advanced frontend development skills and best practices in web application architecture.

## Features
- **User Authentication**
  - Secure login and registration system
  - JWT-based authentication
  - Password management and profile customization

- **Channel Management**
  - Create and join public/private channels
  - Channel details viewing and editing
  - Channel member management
  - Real-time channel updates

- **Messaging System**
  - Real-time message sending and receiving
  - Message editing and deletion
  - Message reactions and pinning
  - Support for both text and image messages
  - Infinite scroll message loading

- **User Profiles**
  - Profile photo upload and management
  - User information editing
  - Profile viewing for other users

- **Advanced Features**
  - Push notifications for new messages
  - Offline access to recently viewed channels
  - Fragment-based URL routing
  - Responsive design for all device sizes

## Technical Stack
- **Frontend**
  - Vanilla JavaScript (ES6+)
  - CSS3 with Bootstrap 5.3.2
  - Local Storage for state management
  - Promise-based asynchronous operations

- **Backend**
  - RESTful API architecture
  - Node.js with Express
  - JWT authentication
  - Persistent data storage

## Key Technical Achievements
1. Implemented a single-page application (SPA) architecture without using any frontend frameworks
2. Developed a robust state management system using vanilla JavaScript
3. Created a responsive UI that works seamlessly across desktop, tablet, and mobile devices
4. Implemented real-time features using polling mechanisms
5. Built an offline-capable application with local storage caching
6. Developed a clean, maintainable codebase following best practices

## Project Highlights
- **Performance**: Optimized for fast loading and smooth user experience
- **Accessibility**: Built with WCAG guidelines in mind
- **Security**: Implemented secure authentication and data handling
- **User Experience**: Intuitive interface with real-time updates
- **Code Quality**: Clean, well-documented, and maintainable code

## Getting Started

### Prerequisites
- Node.js
- npm (Node Package Manager)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
4. Start the frontend server:
   ```bash
   npx http-server frontend -p 8000
   ```
5. Open `http://localhost:8000` in your browser

## Development
This project was developed as part of a university assignment to demonstrate proficiency in:
- Modern JavaScript development
- Web application architecture
- User interface design
- State management
- API integration
- Responsive design
- Accessibility implementation

## License
This project is proprietary and confidential.
