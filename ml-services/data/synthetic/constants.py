"""
constants.py  —  Shared reference data for the Tamil Nadu Medical Inventory System.

Every generator imports from this single source of truth so that drug lists,
region coordinates, facility counts, seasonality rules, etc. are always
consistent across all four datasets.
"""

import os

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR    = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "processed"))

# ── Drug Master List ─────────────────────────────────────────────────────────
DRUGS = [
    "Paracetamol", "Amoxicillin", "Metformin", "Ibuprofen",
    "Omeprazole",  "Amlodipine",  "Artemether", "Ciprofloxacin",
    "Insulin",     "Salbutamol",  "Ondansetron", "Chloroquine",
]

# ── Regions  (city → (latitude, longitude)) ─────────────────────────────────
REGIONS = {
    "Chennai":     (13.0827, 80.2707),
    "Coimbatore":  (11.0168, 76.9558),
    "Madurai":     (9.9252,  78.1198),
    "Trichy":      (10.7905, 78.7047),
    "Salem":       (11.6643, 78.1460),
    "Tirunelveli": (8.7139,  77.7567),
    "Vellore":     (12.9165, 79.1325),
    "Erode":       (11.3410, 77.7172),
    "Thoothukudi": (8.7642,  78.1348),
    "Kanchipuram": (12.8185, 79.6947),
}

# ── Facility Types ───────────────────────────────────────────────────────────
FACILITY_TYPES = [
    "Government Hospital",
    "Private Hospital",
    "Primary Health Centre",
    "Pharmacy",
]

# ── Seasons (label → months) ────────────────────────────────────────────────
SEASONS = {
    "Northeast Monsoon": [10, 11, 12, 1],
    "Southwest Monsoon": [6, 7, 8, 9],
    "Winter":            [12, 1, 2],
    "Pre-monsoon":       [3, 4, 5],
}

# ── Disease-season flag months per drug ──────────────────────────────────────
DISEASE_SEASON_FLAGS = {
    "Paracetamol":   [10, 11, 12, 1, 2],
    "Salbutamol":    [12, 1, 2],
    "Amoxicillin":   [12, 1, 2],
    "Artemether":    [6, 7, 8, 9],
    "Chloroquine":   [6, 7, 8, 9],
    "Ciprofloxacin": [5, 6, 10, 11, 12, 1],
    "Ondansetron":   [5, 6],
    "Omeprazole":    [5, 6],
    "Metformin":     [10, 11],
    "Insulin":       [10, 11],
    "Amlodipine":    [],          # year-round, no spike
    "Ibuprofen":     [],          # year-round, no spike
}

# ── Seasonality multipliers (applied when disease_season_flag == 1) ──────────
SEASONALITY_MULTIPLIERS = {
    "Artemether":    2.5,
    "Chloroquine":   2.2,
    "Paracetamol":   1.8,
    "Salbutamol":    1.6,
    "Ciprofloxacin": 1.5,
    "Ondansetron":   1.7,
    "Omeprazole":    1.4,
    "Metformin":     1.4,
    "Insulin":       1.4,
    "Amoxicillin":   1.5,
    "Ibuprofen":     1.0,
    "Amlodipine":    1.0,
}

# ── Shelf life (months) ─────────────────────────────────────────────────────
SHELF_LIFE_MONTHS = {
    "Paracetamol":   36,
    "Amoxicillin":   24,
    "Metformin":     36,
    "Ibuprofen":     36,
    "Omeprazole":    24,
    "Amlodipine":    36,
    "Artemether":    24,
    "Ciprofloxacin": 24,
    "Insulin":       12,
    "Salbutamol":    24,
    "Ondansetron":   24,
    "Chloroquine":   60,
}

# ── Price per unit (INR) ────────────────────────────────────────────────────
PRICE_PER_UNIT_INR = {
    "Paracetamol":    2,
    "Amoxicillin":    8,
    "Metformin":      5,
    "Ibuprofen":      3,
    "Omeprazole":     6,
    "Amlodipine":     7,
    "Artemether":     45,
    "Ciprofloxacin":  12,
    "Insulin":        180,
    "Salbutamol":     25,
    "Ondansetron":    15,
    "Chloroquine":    10,
}

# ── Quantity ranges per facility type ────────────────────────────────────────
QUANTITY_RANGES = {
    "Government Hospital":     (1000, 8000),
    "Private Hospital":        (500,  4000),
    "Primary Health Centre":   (100,  800),
    "Pharmacy":                (200,  2000),
}

# ── Date range covered ──────────────────────────────────────────────────────
DATE_RANGE = {
    "start": "2023-01-01",
    "end":   "2024-12-31",      # 24 months
}

# ── Population estimates ─────────────────────────────────────────────────────
POPULATION_EST = {
    "Chennai":     7_100_000,
    "Coimbatore":  2_100_000,
    "Madurai":     1_500_000,
    "Trichy":      1_000_000,
    "Salem":         900_000,
    "Tirunelveli":   700_000,
    "Vellore":       600_000,
    "Erode":         550_000,
    "Thoothukudi":   500_000,
    "Kanchipuram":   450_000,
}

# ── Facility counts per region ───────────────────────────────────────────────
FACILITY_COUNT = {
    "Chennai":     420,
    "Coimbatore":  210,
    "Madurai":     180,
    "Trichy":      150,
    "Salem":       130,
    "Tirunelveli": 110,
    "Vellore":     100,
    "Erode":        90,
    "Thoothukudi":  85,
    "Kanchipuram":  80,
}

# ── Derived: facility-ID registry ───────────────────────────────────────────
# 10 regions × 4 types = 40 primary facility slots → FAC_001 … FAC_040
# FAC_041 … FAC_100 are reserved for master-list references.
FACILITY_REGISTRY = {}
_fac = 1
for _r in REGIONS:
    for _ft in FACILITY_TYPES:
        FACILITY_REGISTRY[(_r, _ft)] = f"FAC_{_fac:03d}"
        _fac += 1

ALL_FACILITY_IDS = [f"FAC_{i:03d}" for i in range(1, 101)]


# ── Helper: dominant season for a calendar month ─────────────────────────────
def get_season(month):
    """Return the primary season label for a given month (1-12).

    Priority mapping (each month → exactly one season):
      Oct, Nov, Dec  →  Northeast Monsoon
      Jan, Feb       →  Winter
      Mar, Apr, May  →  Pre-monsoon
      Jun–Sep        →  Southwest Monsoon
    """
    if month in (6, 7, 8, 9):
        return "Southwest Monsoon"
    if month in (10, 11, 12):
        return "Northeast Monsoon"
    if month in (1, 2):
        return "Winter"
    return "Pre-monsoon"          # 3, 4, 5
