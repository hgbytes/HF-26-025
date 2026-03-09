from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/health")
def health():
    return {"status": "ok"}


# Register blueprints
# from src.api import predictions
# app.register_blueprint(predictions.bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
