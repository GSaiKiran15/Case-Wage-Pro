import pandas as pd

import os

# Get directory of current script
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(CURRENT_DIR, "../OFLC_Wages_2025-26_Updated")

# Load CSV files
alc = pd.read_csv(os.path.join(DATA_DIR, "ALC_Export.csv"))          # Annual wages
edc = pd.read_csv(os.path.join(DATA_DIR, "EDC_Export.csv"))          # Hourly wages
geo = pd.read_csv(os.path.join(DATA_DIR, "Geography.csv"))           # Geography lookup
soc = pd.read_csv(os.path.join(DATA_DIR, "oes_soc_occs.csv"))        # SOC job titles

alc.columns = alc.columns.str.lower()
edc.columns = edc.columns.str.lower()
geo.columns = geo.columns.str.lower()
soc.columns = soc.columns.str.lower()

wages = alc.merge(
    edc,
    on=["soccode", "area", "geolvl"],
    suffixes=("_annual", "_hourly"),
    how="inner"
)

wages = wages.merge(
    geo,
    on="area",
    how="left"
)

wages = wages.merge(
    soc[["soccode", "title"]],
    on="soccode",
    how="left"
)

final_df = wages[[
    # Job
    "soccode",
    "title",

    # Geography
    "area",
    "areaname",
    "stateab",
    "state",
    "countytownname",
    "geolvl",

    # Annual wages
    "level1_annual",
    "level2_annual",
    "level3_annual",
    "level4_annual",

    # Hourly wages
    "level1_hourly",
    "level2_hourly",
    "level3_hourly",
    "level4_hourly",
]]

final_df = final_df.rename(columns={
    "soccode": "soc_code",
    "title": "job_title",
    "areaname": "area_name",
    "stateab": "state_abbr",
    "countytownname": "county_or_town",
    "geolvl": "geography_level"
})

final_df.to_csv(os.path.join(CURRENT_DIR, "prevailing_wages_combined.csv"), index=False)