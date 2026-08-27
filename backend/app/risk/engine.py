from typing import Dict, Any, List
from datetime import datetime, timezone


class RiskEngine:
    def __init__(self):
        self.risk_thresholds = {"LOW": 90, "MEDIUM": 70, "HIGH": 50, "CRITICAL": 0}
        self.risk_factor_weights = {
            "Identity Consistency": 1.0, "Statutory Compliance": 1.2,
            "Financial Eligibility": 1.1, "Technical Eligibility": 1.0,
            "Documentation": 0.8, "Tender Compliance": 1.3
        }

    def calculate(self, bid_id: str, compliance_result: Dict[str, Any] = None) -> Dict[str, Any]:
        if not compliance_result:
            # Default mock
            return {
                "bid_id": bid_id,
                "risk_level": "MEDIUM",
                "risk_score": 35,
                "risk_drivers": [
                    {"factor": "Local Content", "severity": "HIGH"},
                    {"factor": "OEM Authorization", "severity": "MEDIUM"}
                ],
                "compliance_score": 82,
                "factor_breakdown": {},
                "calculated_at": datetime.now(timezone.utc).isoformat()
            }

        score = compliance_result.get("score", 0)
        rule_results = compliance_result.get("rule_results", [])

        # Base risk level from score
        if score >= self.risk_thresholds["LOW"]:
            risk_level = "LOW"
        elif score >= self.risk_thresholds["MEDIUM"]:
            risk_level = "MEDIUM"
        elif score >= self.risk_thresholds["HIGH"]:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        # Analyze rule risks
        enhanced_drivers = self._analyze_rule_risks(rule_results)
        risk_drivers = compliance_result.get("risk_drivers", []) + enhanced_drivers
        risk_drivers = self._deduplicate_drivers(risk_drivers)

        # Calculate numeric risk score
        risk_score = self._calculate_risk_score(rule_results)

        return {
            "bid_id": bid_id,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "risk_drivers": risk_drivers,
            "compliance_score": score,
            "factor_breakdown": self._get_factor_breakdown(rule_results),
            "calculated_at": datetime.now(timezone.utc).isoformat()
        }

    def _analyze_rule_risks(self, rule_results: List[Dict]) -> List[Dict]:
        drivers = []
        factor_map = {
            "GST": "Statutory Compliance", "PAN": "Identity Consistency",
            "UDYAM": "Statutory Compliance", "INCOME_TAX": "Financial Eligibility",
            "EPFO": "Statutory Compliance", "ESIC": "Statutory Compliance",
            "LOCAL_CONTENT": "Tender Compliance", "OEM": "Technical Eligibility",
            "DOCUMENT_CHECK": "Documentation", "DEBARMENT": "Statutory Compliance",
            "STARTUP": "Technical Eligibility", "NSIC": "Technical Eligibility"
        }
        severity_map = {"CRITICAL": "HIGH", "HIGH": "HIGH", "MEDIUM": "MEDIUM", "LOW": "LOW"}

        for rule in rule_results:
            if rule.get("result") in ["FAIL", "EXPIRED", "VERIFICATION_FAILED", "MISSING"]:
                factor = factor_map.get(rule.get("source", ""), rule.get("type", ""))
                base_severity = severity_map.get(rule.get("severity", ""), "MEDIUM")
                weight = rule.get("weight", 10)

                severity = base_severity
                if weight >= 15 and base_severity == "MEDIUM":
                    severity = "HIGH"
                if weight >= 15 and base_severity == "LOW":
                    severity = "MEDIUM"

                drivers.append({
                    "factor": factor, "severity": severity,
                    "rule_id": rule.get("rule_id"), "rule_name": rule.get("rule_name"),
                    "weight": weight
                })
        return drivers

    def _calculate_risk_score(self, rule_results: List[Dict]) -> int:
        total_risk = 0
        max_risk = 0

        for rule in rule_results:
            factor_weight = self.risk_factor_weights.get(rule.get("source", ""), 1.0)
            rule_weight = rule.get("weight", 10)
            max_risk += rule_weight * factor_weight

            if rule.get("result") in ["FAIL", "EXPIRED", "VERIFICATION_FAILED"]:
                severity_mult = {"CRITICAL": 1.0, "HIGH": 0.8, "MEDIUM": 0.5, "LOW": 0.3}.get(rule.get("severity", ""), 0.5)
                total_risk += rule_weight * factor_weight * severity_mult
            elif rule.get("result") == "REVIEW":
                total_risk += rule_weight * factor_weight * 0.2

        return int((total_risk / max_risk) * 100) if max_risk > 0 else 0

    def _get_factor_breakdown(self, rule_results: List[Dict]) -> Dict:
        factors = {
            "Identity Consistency": {"pass": 0, "fail": 0, "total": 0},
            "Statutory Compliance": {"pass": 0, "fail": 0, "total": 0},
            "Financial Eligibility": {"pass": 0, "fail": 0, "total": 0},
            "Technical Eligibility": {"pass": 0, "fail": 0, "total": 0},
            "Documentation": {"pass": 0, "fail": 0, "total": 0},
            "Tender Compliance": {"pass": 0, "fail": 0, "total": 0}
        }
        factor_map = {
            "GST": "Statutory Compliance", "PAN": "Identity Consistency",
            "UDYAM": "Statutory Compliance", "INCOME_TAX": "Financial Eligibility",
            "EPFO": "Statutory Compliance", "ESIC": "Statutory Compliance",
            "LOCAL_CONTENT": "Tender Compliance", "OEM": "Technical Eligibility",
            "DOCUMENT_CHECK": "Documentation", "DEBARMENT": "Statutory Compliance",
            "STARTUP": "Technical Eligibility", "NSIC": "Technical Eligibility"
        }

        for rule in rule_results:
            factor = factor_map.get(rule.get("source", ""), rule.get("type", ""))
            if factor not in factors:
                continue
            factors[factor]["total"] += 1
            if rule.get("result") == "PASS":
                factors[factor]["pass"] += 1
            elif rule.get("result") in ["FAIL", "EXPIRED", "VERIFICATION_FAILED"]:
                factors[factor]["fail"] += 1

        breakdown = {}
        for factor, counts in factors.items():
            breakdown[factor] = {
                "total": counts["total"],
                "passed": counts["pass"],
                "failed": counts["fail"],
                "score": int((counts["pass"] / counts["total"]) * 100) if counts["total"] > 0 else 100
            }
        return breakdown

    def _deduplicate_drivers(self, drivers: List[Dict]) -> List[Dict]:
        seen = set()
        return [d for d in drivers if not (f"{d['factor']}-{d['severity']}" in seen or seen.add(f"{d['factor']}-{d['severity']}"))]

    def get_risk_level(self, score: int) -> str:
        if score >= self.risk_thresholds["LOW"]: return "LOW"
        if score >= self.risk_thresholds["MEDIUM"]: return "MEDIUM"
        if score >= self.risk_thresholds["HIGH"]: return "HIGH"
        return "CRITICAL"

    def update_thresholds(self, thresholds: Dict[str, int]):
        self.risk_thresholds = {**self.risk_thresholds, **thresholds}

    def update_factor_weights(self, weights: Dict[str, float]):
        self.risk_factor_weights = {**self.risk_factor_weights, **weights}


risk_engine = RiskEngine()