"""
JATAYU Transparent Scoring & Priority Engine
Severity Formula:
severity_score = 100 * (0.30 * extent + 0.30 * population + 0.20 * infrastructure + 0.20 * accessibility)
When Tier 2 exists:
tier2_bonus = min(20.0, 0.40 * destroyed_count + 0.20 * major_count)
overall_score = min(100.0, base_score + tier2_bonus)

Priority Rule:
- P1 (CRITICAL): overall_score >= 75.0 OR (overall_score >= 50.0 AND critical_facilities affected (hospitals > 0 or schools > 0))
- P2 (HIGH/MODERATE): overall_score >= 50.0 and < 75.0 (without hospital/school)
- P3 (LOW): overall_score < 50.0
"""

from typing import Dict, Any

class ScoringEngine:
    @staticmethod
    def calculate_zone_score(
        extent_ratio: float,          # 0.0 - 1.0 (normalized against max basin extent)
        population_ratio: float,      # 0.0 - 1.0 (normalized against max density)
        infrastructure_ratio: float,  # 0.0 - 1.0 (weighted count of roads, bridges, substations)
        accessibility_ratio: float,   # 0.0 - 1.0 (isolation factor: bridge cuts, road severance)
        critical_facilities: Dict[str, int],  # hospitals, schools, bridges
        tier2_buildings: list = None,
    ) -> Dict[str, Any]:
        extent_norm = max(0.0, min(1.0, extent_ratio))
        pop_norm = max(0.0, min(1.0, population_ratio))
        infra_norm = max(0.0, min(1.0, infrastructure_ratio))
        access_norm = max(0.0, min(1.0, accessibility_ratio))

        base_score = 100.0 * (
            0.30 * extent_norm +
            0.30 * pop_norm +
            0.20 * infra_norm +
            0.20 * access_norm
        )

        tier2_factor = 0.0
        destroyed_count = 0
        major_count = 0

        if tier2_buildings:
            for bldg in tier2_buildings:
                dmg = bldg.get("damage_class", "")
                if dmg == "destroyed":
                    destroyed_count += 1
                elif dmg == "major":
                    major_count += 1

            # Bonus up to 15 points based on verified structural collapses
            tier2_factor = min(15.0, (destroyed_count * 2.5) + (major_count * 1.2))

        final_score = round(min(100.0, base_score + tier2_factor), 1)

        hospitals = critical_facilities.get("hospitals", 0)
        schools = critical_facilities.get("schools", 0)
        has_critical_facility_hit = (hospitals > 0) or (schools > 0)

        # Priority P1/P2/P3 determination
        if final_score >= 75.0 or (final_score >= 50.0 and has_critical_facility_hit):
            priority = "P1"
        elif final_score >= 50.0:
            priority = "P2"
        else:
            priority = "P3"

        return {
            "severity_score": final_score,
            "base_score": round(base_score, 1),
            "tier2_damage_factor": round(tier2_factor, 1),
            "priority": priority,
            "score_breakdown": {
                "weights": {
                    "extent": 0.30,
                    "population": 0.30,
                    "infrastructure": 0.20,
                    "accessibility": 0.20,
                },
                "inputs": {
                    "extent_ratio": extent_norm,
                    "population_ratio": pop_norm,
                    "infrastructure_ratio": infra_norm,
                    "accessibility_ratio": access_norm,
                },
                "components": {
                    "extent_contrib": round(extent_norm * 30.0, 1),
                    "population_contrib": round(pop_norm * 30.0, 1),
                    "infrastructure_contrib": round(infra_norm * 20.0, 1),
                    "accessibility_contrib": round(access_norm * 20.0, 1),
                    "tier2_bonus": round(tier2_factor, 1),
                },
                "critical_triggers": {
                    "hospitals_hit": hospitals,
                    "schools_hit": schools,
                    "p1_escalation": has_critical_facility_hit and final_score < 75.0,
                },
            },
        }
