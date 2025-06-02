import pandas as pd
import streamlit as st
import os


@st.cache_data
def load_data():
    data_path = os.path.join("data", "vin.csv")
    data = pd.read_csv(data_path)
    return data
