
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

VALID_STATUSES = {"Open", "In Progress", "Resolved"}
VALID_PRIORITIES = {"Low", "Medium", "High"}


class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), default="Medium")
    status = db.Column(db.String(20), default="Open")

    def to_dict(self):
        return {
            "id": self.id,
            "customer_name": self.customer_name,
            "email": self.email,
            "subject": self.subject,
            "description": self.description,
            "priority": self.priority,
            "status": self.status
        }


# Check server and database connection
@app.route("/api/health", methods=["GET"])
def health():
    db.session.execute(db.text("SELECT 1"))
    return jsonify({"message": "Backend and database connected"})


# Get all tickets and dashboard counts
@app.route("/api/tickets", methods=["GET"])
def get_tickets():
    tickets = Ticket.query.order_by(Ticket.id.desc()).all()

    return jsonify({
        "tickets": [ticket.to_dict() for ticket in tickets],
        "total": len(tickets),
        "open": sum(t.status == "Open" for t in tickets),
        "in_progress": sum(
            t.status == "In Progress" for t in tickets
        ),
        "resolved": sum(t.status == "Resolved" for t in tickets)
    })


# Create a customer support ticket
@app.route("/api/tickets", methods=["POST"])
def create_ticket():
    data = request.get_json(silent=True) or {}

    required = [
        "customer_name", "email", "subject", "description"
    ]

    if any(
        not isinstance(data.get(field), str)
        or not data[field].strip()
        for field in required
    ):
        return jsonify({
            "error": "All customer and complaint fields are required"
        }), 400

    if len(data["customer_name"]) > 100:
        return jsonify({"error": "Customer name is too long"}), 400

    if len(data["email"]) > 150 or "@" not in data["email"]:
        return jsonify({"error": "Enter a valid email address"}), 400

    if len(data["subject"]) > 200:
        return jsonify({"error": "Subject is too long"}), 400

    priority = data.get("priority", "Medium")

    if priority not in VALID_PRIORITIES:
        return jsonify({"error": "Invalid priority"}), 400

    ticket = Ticket(
        customer_name=data["customer_name"].strip(),
        email=data["email"].strip(),
        subject=data["subject"].strip(),
        description=data["description"].strip(),
        priority=priority,
        status="Open"
    )

    try:
        db.session.add(ticket)
        db.session.commit()
        return jsonify({
            "message": "Ticket created successfully",
            "ticket": ticket.to_dict()
        }), 201
    except Exception:
        db.session.rollback()
        app.logger.exception("Could not create ticket")
        return jsonify({"error": "Could not save ticket"}), 500


# Update ticket status
@app.route("/api/tickets/<int:ticket_id>", methods=["PATCH"])
def update_ticket(ticket_id):
    ticket = db.session.get(Ticket, ticket_id)

    if ticket is None:
        return jsonify({"error": "Ticket not found"}), 404

    data = request.get_json(silent=True) or {}
    status = data.get("status")

    if status not in VALID_STATUSES:
        return jsonify({"error": "Invalid ticket status"}), 400

    ticket.status = status

    try:
        db.session.commit()
        return jsonify({
            "message": "Ticket status updated",
            "ticket": ticket.to_dict()
        })
    except Exception:
        db.session.rollback()
        app.logger.exception("Could not update ticket")
        return jsonify({"error": "Could not update ticket"}), 500
@app.route("/api/tickets/<int:ticket_id>", methods=["DELETE"])
def delete_ticket(ticket_id):
    ticket = db.session.get(Ticket, ticket_id)

    if ticket is None:
        return {"error": "Ticket not found"}, 404

    db.session.delete(ticket)
    db.session.commit()

    return {
        "message": "Ticket deleted successfully"
    }, 200

if __name__ == "__main__":
    if not app.config["SQLALCHEMY_DATABASE_URI"]:
        raise RuntimeError("Set DATABASE_URL in backend/.env")

    with app.app_context():
        db.create_all()

    app.run(debug=True)
