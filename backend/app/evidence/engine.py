from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import hashlib


class EvidenceRecord:
    def __init__(self, **kwargs):
        self.id = kwargs.get("id", self._generate_id())
        self.requirement_id = kwargs.get("requirement_id", "")
        self.document_id = kwargs.get("document_id", "")
        self.page_number = kwargs.get("page_number", 1)
        self.extracted_value = str(kwargs.get("extracted_value", ""))
        self.expected_value = str(kwargs.get("expected_value", ""))
        self.actual_value = str(kwargs.get("actual_value", ""))
        self.verification_source = kwargs.get("verification_source", "")
        self.rule_id = kwargs.get("rule_id", "")
        self.result = kwargs.get("result", "")
        self.confidence = float(kwargs.get("confidence", 0))
        self.details = kwargs.get("details", {})
        self.created_at = kwargs.get("created_at", datetime.now(timezone.utc).isoformat())
        self.hash = kwargs.get("hash", self._generate_hash())

    def _generate_id(self) -> str:
        return f"EVD-{int(datetime.now().timestamp() * 1000)}-{hashlib.md5(str(datetime.now()).encode()).hexdigest()[:9]}"

    def _generate_hash(self) -> str:
        data = f"{self.requirement_id}-{self.document_id}-{self.extracted_value}"
        return "sha256:" + hashlib.sha256(data.encode()).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "requirement_id": self.requirement_id,
            "document_id": self.document_id,
            "page_number": self.page_number,
            "extracted_value": self.extracted_value,
            "expected_value": self.expected_value,
            "actual_value": self.actual_value,
            "verification_source": self.verification_source,
            "rule_id": self.rule_id,
            "result": self.result,
            "confidence": self.confidence,
            "details": self.details,
            "created_at": self.created_at,
            "hash": self.hash
        }


class EvidenceEngine:
    """In-memory evidence store.

    The canonical evidence record for a tender/bid lives in the ``documents``
    table as JSON (``Document.ai_extracted``).  This in-memory store is used
    only for the compliance and evidence API routes that return structured
    evidence objects.  When the server restarts the in-memory store is cleared.

    TODO: replace with a dedicated ``evidence_records`` DB table so that
    evidence survives restarts and can be queried with SQL joins.
    """

    def __init__(self):
        self.evidence_store: Dict[str, EvidenceRecord] = {}

    def create_evidence(self, params: Dict[str, Any]) -> EvidenceRecord:
        evidence = EvidenceRecord(**params)
        self.evidence_store[evidence.id] = evidence
        return evidence

    def create_evidence_from_rules(self, rule_results: List[Dict], verifications: Dict,
                                    extracted_fields: Dict, documents: List) -> List[EvidenceRecord]:
        evidence_list = []
        for rule in rule_results:
            if not rule.get("evidence_ref"):
                continue
            evidence = self.create_evidence({
                "requirement_id": rule.get("rule_id"),
                "document_id": rule.get("evidence_ref"),
                "page_number": self._get_page_number(rule, extracted_fields),
                "extracted_value": rule.get("actual", ""),
                "expected_value": rule.get("expected", ""),
                "actual_value": rule.get("actual", ""),
                "verification_source": rule.get("source", rule.get("rule_type", "")),
                "rule_id": rule.get("rule_id"),
                "result": rule.get("result"),
                "confidence": rule.get("confidence", 0),
                "details": rule.get("details", {})
            })
            evidence_list.append(evidence)
        return evidence_list

    def get_evidence(self, evidence_id: str) -> Optional[EvidenceRecord]:
        return self.evidence_store.get(evidence_id)

    def get_evidence_for_bid(self, bid_id: str) -> List[EvidenceRecord]:
        return [e for e in self.evidence_store.values()
                if e.details.get("bid_id") == bid_id or bid_id in e.requirement_id]

    def get_evidence_by_requirement(self, requirement_id: str) -> List[EvidenceRecord]:
        return [e for e in self.evidence_store.values() if e.requirement_id == requirement_id]

    def get_evidence_by_document(self, document_id: str) -> List[EvidenceRecord]:
        return [e for e in self.evidence_store.values() if e.document_id == document_id]

    def search_evidence(self, query: Dict[str, Any]) -> List[EvidenceRecord]:
        results = list(self.evidence_store.values())

        if query.get("result"):
            results = [e for e in results if e.result == query["result"]]
        if query.get("verification_source"):
            results = [e for e in results if e.verification_source == query["verification_source"]]
        if query.get("rule_id"):
            results = [e for e in results if e.rule_id == query["rule_id"]]
        if query.get("min_confidence"):
            results = [e for e in results if e.confidence >= query["min_confidence"]]
        if query.get("bid_id"):
            results = [e for e in results if e.details.get("bid_id") == query["bid_id"]]

        return sorted(results, key=lambda e: e.created_at, reverse=True)

    def add_override_evidence(self, params: Dict[str, Any]) -> EvidenceRecord:
        evidence = self.create_evidence({
            "requirement_id": params.get("requirement_id"),
            "document_id": f"OVERRIDE-{int(datetime.now().timestamp() * 1000)}",
            "page_number": 0,
            "extracted_value": params.get("original_result", ""),
            "expected_value": params.get("original_result", ""),
            "actual_value": params.get("new_result", ""),
            "verification_source": "MANUAL_OVERRIDE",
            "rule_id": params.get("rule_id"),
            "result": params.get("new_result"),
            "confidence": 1.0,
            "details": {
                "officer_id": params.get("officer_id"),
                "original_result": params.get("original_result"),
                "new_result": params.get("new_result"),
                "reason": params.get("reason"),
                "override": True,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        })
        return evidence

    def get_evidence_summary(self, bid_id: str) -> Dict[str, Any]:
        evidence = self.get_evidence_for_bid(bid_id)
        by_result = {}
        by_source = {}
        for e in evidence:
            by_result[e.result] = by_result.get(e.result, 0) + 1
            by_source[e.verification_source] = by_source.get(e.verification_source, 0) + 1
        return {
            "bid_id": bid_id,
            "total_evidence": len(evidence),
            "by_result": by_result,
            "by_source": by_source,
            "evidence": [e.to_dict() for e in evidence]
        }

    def export_for_audit(self, bid_id: str) -> Dict[str, Any]:
        evidence = self.get_evidence_for_bid(bid_id)
        return {
            "bid_id": bid_id,
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "total_records": len(evidence),
            "records": [e.to_dict() for e in evidence]
        }

    def _get_page_number(self, rule: Dict, fields: Dict) -> int:
        if rule.get("rule_id") == "REQ-LC-01":
            return fields.get("local_content_source_page", 1)
        if rule.get("rule_id") == "REQ-OEM-01":
            return fields.get("oem_source_page", 1)
        return rule.get("details", {}).get("source_page", 1)

    def clear(self):
        self.evidence_store.clear()


evidence_engine = EvidenceEngine()