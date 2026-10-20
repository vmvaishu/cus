# Customer Service Management System

A full-stack web application for managing customer support tickets. Users can create support tickets, view existing tickets, update ticket details and status, filter tickets by status, and delete tickets.

## Features

- **Create Tickets:** Add customer name, email, issue subject, description, and priority.
- **View Tickets:** Retrieve and display tickets stored in the database.
- **Update Tickets:** Edit existing ticket details.
- **Manage Status:** Update ticket status to Open, In Progress, or Resolved.
- **Delete Tickets:** Remove tickets from the database.
- **Dashboard Statistics:** View total, open, in-progress, and resolved ticket counts.
- **Filter Tickets:** Filter tickets based on their current status.
- **Data Persistence:** Store ticket information in PostgreSQL.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development server |
| Python | Backend programming language |
| Flask | REST API development |
| Flask-SQLAlchemy | Database ORM |
| PostgreSQL | Relational database |
| Flask-CORS | Frontend-backend communication |
| python-dotenv | Environment variable management |

## Project Structure

```text
cus/
├── backend/
│   ├── app.py
│   ├── .env
│   └── venv/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
└── README.md
```

## Prerequisites

Install the following before running the project:

- Python 3.10 or later
- Node.js and npm
- PostgreSQL
- Git (optional)

## Installation and Setup

### 1. Clone the Repository

If the project is hosted on GitHub:

```bash
git clone <your-repository-url>
cd cus
```

Alternatively, open your existing project folder.

### 2. Create the PostgreSQL Database

Open PostgreSQL using pgAdmin or the PostgreSQL command-line tool and execute:

```sql
CREATE DATABASE customer_service_db;
```

### 3. Set Up the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Create and activate a Python virtual environment.

**Windows Command Prompt:**

```bat
python -m venv venv
venv\Scripts\activate.bat
```

Install the required Python packages:

```bash
pip install flask flask-cors flask-sqlalchemy "psycopg[binary]" python-dotenv
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/customer_service_db
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

If your password contains special URL characters, encode them appropriately before using the connection URL.

**Security:** Never commit your `.env` file or database password to GitHub.

### 5. Run the Backend

From the `backend` directory, run:

```bash
python app.py
```

The Flask server should start at:

```text
http://127.0.0.1:5000
```

Test the database connection by opening:

```text
http://127.0.0.1:5000/api/health
```

A successful response should look like:

```json
{
  "message": "Backend and database connected"
}
```

### 6. Set Up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

Keep both the Flask backend and Vite frontend running while using the application.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend and database connectivity |
| GET | `/api/tickets` | Retrieve all tickets and dashboard statistics |
| POST | `/api/tickets` | Create a new ticket |
| PATCH | `/api/tickets/<id>` | Update a ticket's status |
| PUT | `/api/tickets/<id>` | Update complete ticket details, if implemented |
| DELETE | `/api/tickets/<id>` | Delete a ticket |

**Note:** The PUT endpoint requires the corresponding update route in the Flask backend.

## Ticket Status and Priority

**Status values:**
- Open
- In Progress
- Resolved

**Priority values:**
- Low
- Medium
- High

## Database Design

The `Ticket` table contains the following fields:

| Field | Description |
|---|---|
| `id` | Unique ticket identifier |
| `customer_name` | Customer's name |
| `email` | Customer's email address |
| `subject` | Issue subject |
| `description` | Detailed issue description |
| `priority` | Ticket priority |
| `status` | Current ticket status |

The Flask-SQLAlchemy model maps the ticket data to a PostgreSQL table. The application creates the table during startup when it does not already exist.

## Testing

Verify the following operations:

1. Create a new support ticket.
2. Refresh the page and confirm the ticket remains visible.
3. Retrieve existing tickets from the database.
4. Edit ticket details and save the changes.
5. Change the ticket status and verify the dashboard counts.
6. Delete a ticket and refresh the page to confirm it no longer appears.
7. Check the health endpoint to verify database connectivity.

## Future Enhancements

- Customer and support-agent authentication
- Ticket search functionality
- Ticket assignment to support agents
- Email notifications
- Ticket creation and resolution timestamps
- Pagination and reporting

## Learning Outcomes

This project demonstrates full-stack application development, REST API integration, database connectivity, CRUD operations, data validation, and frontend-backend communication.

## License

This project is available for educational and learning purposes. Add a specific open-source license if you intend to distribute it publicly.
