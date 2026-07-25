from fastapi.testclient import TestClient

from cyhelm.main import app

client = TestClient(app)

RISK = {
    "title": "Cloud administrator compromise",
    "scenario": "A privileged cloud identity is compromised through phishing.",
    "likelihood": 5, "impact": 5, "control_effectiveness": 20, "owner": "CIO"
}


def test_explainable_risk_score():
    response = client.post("/v1/risks/assess", json=RISK)
    assert response.status_code == 200
    assert response.json()["residual_score"] == 20
    assert response.json()["rating"] == "critical"


def test_empty_portfolio():
    assert client.post("/v1/risks/portfolio-summary", json=[]).json()["total"] == 0
