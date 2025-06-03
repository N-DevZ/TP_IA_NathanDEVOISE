import streamlit as st
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from configparser import ConfigParser
import os

# Charger les chaînes de caractères depuis Strings.ini
config = ConfigParser()
config.read(
    os.path.join(os.path.dirname(__file__), "..", "conf", "Strings.ini"),
    encoding="utf-8",
)

if "data_analysis" not in config:
    raise KeyError(
        f"La section 'data_analysis' n'existe pas dans le fichier Strings.ini"
    )

strings = config["data_analysis"]


def run_data_analysis(data):
    st.title(strings["data_analysis_title"])

    if st.checkbox(strings["show_description"]):
        st.write(data.describe())

    if st.checkbox(strings["show_correlation"]):
        corr = data.corr()
        fig, ax = plt.subplots(figsize=(10, 8))
        sns.heatmap(corr, annot=True, cmap=strings["colormap"], ax=ax)
        st.pyplot(fig)

    if st.checkbox(strings["show_pairplot"]):
        fig = sns.pairplot(data, hue=strings["target"])
        st.pyplot(fig)

    if st.checkbox(strings["show_distribution"]):
        column = st.selectbox(strings["select_column"], data.columns)
        fig, ax = plt.subplots()
        sns.histplot(data=data, x=column, hue=strings["target"], kde=True, ax=ax)
        st.pyplot(fig)

    if st.checkbox(strings["show_frequencies"]):
        column = st.selectbox(strings["select_frequency_column"], data.columns)
        st.write(data[column].value_counts())


# Assurez-vous que cette ligne est présente à la fin du fichier
__all__ = ["run_data_analysis"]
