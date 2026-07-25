from enum import Enum

from fastapi import FastAPI
from pydantic import BaseModel, Field


class Treatment(str, Enum):
    mitigate = "mitigate"
    avoid = "avoid"
    transfer = "transfer"
    accept = "accept"


class RiskInput(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    scenario: str = Field(min_length=10, max_length=1000)
    likelihood: int = Field(ge=1, le=5)
    impact: int = Field(ge=1, le=5)
    control_effectiveness: int = Field(ge=0, le=100)
    owner: str = Field(min_length=2, max_length=100)


class RiskAssessment(BaseModel):
    inherent_score: int
    residual_score: float
    rating: str
    suggested_treatment: Treatment
    rationale: str


def assess(risk: RiskInput) -> RiskAssessment:
    inherent = risk.likelihood * risk.impact
    residual = round(inherent * (1 - risk.control_effectiveness / 100), 1)
    rating = "critical" if residual >= 16 else "high" if residual >= 10 else (
        "medium" if residual >= 5 else "low"
    )
    treatment = "mitigate" if rating in {"critical", "high"} else "accept"
    return RiskAssessment(
        inherent_score=inherent,
        residual_score=residual,
        rating=rating,
        suggested_treatment=treatment,
        rationale=(
            f"Residual score {residual} applies the stated {risk.control_effectiveness}% "
            "control effectiveness to the 5x5 inherent score. Management must validate both inputs."
        ),
    )


class PortfolioSummary(BaseModel):
    total: int
    critical: int
    high: int
    average_residual_score: float


app = FastAPI(title="CyHelm AI Risk Register", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/risks/assess", response_model=RiskAssessment)
def assess_risk(risk: RiskInput) -> RiskAssessment:
    return assess(risk)


@app.post("/v1/risks/portfolio-summary", response_model=PortfolioSummary)
def portfolio_summary(risks: list[RiskInput]) -> PortfolioSummary:
    assessments = [assess(risk) for risk in risks]
    return PortfolioSummary(
        total=len(assessments),
        critical=sum(item.rating == "critical" for item in assessments),
        high=sum(item.rating == "high" for item in assessments),
        average_residual_score=round(
            sum(item.residual_score for item in assessments) / len(assessments), 1
        ) if assessments else 0,
    )

