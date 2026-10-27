"""
Shoreline survey API for the OCS Flask backend.

Drop this file into your Flask repo at  api/shoreline.py , then in main.py add:

    from api.shoreline import shoreline_api
    app.register_blueprint(shoreline_api)

and run  python main.py  (the model's table is created by db.create_all() / initUsers
on first run; if your project uses explicit init scripts, call initShorelineSurveys()).

Routes (all under /api/shoreline, JWT cookie required — same cookie /api/id uses):
    POST /api/shoreline/survey   body {"choice": "donate" | "volunteer" | "none"}
    GET  /api/shoreline/survey   -> the caller's latest choice
    GET  /api/shoreline/survey/all  (Admin only) -> every user's latest choice
"""

from datetime import datetime

from flask import Blueprint, g, jsonify, request
from flask_restful import Api, Resource
from sqlalchemy.exc import IntegrityError

from __init__ import app, db
from api.jwt_authorize import token_required

shoreline_api = Blueprint("shoreline_api", __name__, url_prefix="/api/shoreline")
api = Api(shoreline_api)

VALID_CHOICES = {"donate", "volunteer", "none"}


class ShorelineSurvey(db.Model):
    """One row per user: what they said they wanted to do (donate / volunteer / none)."""

    __tablename__ = "shoreline_surveys"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    choice = db.Column(db.String(16), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, user_id, choice):
        self.user_id = user_id
        self.choice = choice

    def read(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "choice": self.choice,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class SurveyAPI(Resource):
    @token_required()
    def post(self):
        user = g.current_user
        body = request.get_json(silent=True) or {}
        choice = str(body.get("choice", "")).strip().lower()
        if choice not in VALID_CHOICES:
            return {"message": f"choice must be one of {sorted(VALID_CHOICES)}"}, 400

        row = ShorelineSurvey.query.filter_by(user_id=user.id).first()
        if row:
            row.choice = choice
        else:
            row = ShorelineSurvey(user_id=user.id, choice=choice)
            db.session.add(row)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"message": "could not save survey"}, 500
        return jsonify(row.read())

    @token_required()
    def get(self):
        row = ShorelineSurvey.query.filter_by(user_id=g.current_user.id).first()
        if not row:
            return {"message": "no survey on file"}, 404
        return jsonify(row.read())


class SurveyAllAPI(Resource):
    @token_required("Admin")
    def get(self):
        return jsonify([r.read() for r in ShorelineSurvey.query.order_by(ShorelineSurvey.updated_at.desc()).all()])


api.add_resource(SurveyAPI, "/survey")
api.add_resource(SurveyAllAPI, "/survey/all")


def initShorelineSurveys():
    with app.app_context():
        db.create_all()
