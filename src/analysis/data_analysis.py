import streamlit as st
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
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


@st.cache_data
def get_numeric_data(data):
    return data.select_dtypes(include=[np.number])


@st.cache_data
def get_correlation_matrix(numeric_data):
    return numeric_data.corr()


@st.cache_data
def generate_correlation_matrix(corr):
    fig, ax = plt.subplots(figsize=(10, 8))
    sns.heatmap(corr, annot=True, cmap=strings["colormap"], ax=ax)
    return fig


@st.cache_data
def generate_pairplot(data):
    return sns.pairplot(data, hue=strings["target"])


@st.cache_data
def generate_distribution_plot(data, column):
    fig, ax = plt.subplots()
    sns.histplot(data=data, x=column, hue=strings["target"], kde=True, ax=ax)
    return fig


def run_data_analysis(data):
    st.title(strings["data_analysis_title"])

    container_size = st.slider(
        "Taille des Figures (%)", min_value=50, max_value=100, value=80, step=5
    )

    # Description statistique
    st.subheader(strings["show_description"])
    st.write(data.describe())

    # Fonction pour créer un conteneur redimensionnable
    def resizable_container(fig):
        with st.container():
            col1, fig_col, col2 = st.columns(
                [
                    int((100 - container_size) / 2),
                    container_size,
                    int((100 - container_size) / 2),
                ]
            )
            with fig_col:
                st.pyplot(fig)

    # Matrice de corrélation
    if st.checkbox(strings["show_correlation"]):
        st.subheader(strings["show_correlation"])
        numeric_data = get_numeric_data(data)
        corr = get_correlation_matrix(numeric_data)
        fig = generate_correlation_matrix(corr)
        resizable_container(fig)

    # Pairplot
    if st.checkbox(strings["show_pairplot"]):
        st.subheader(strings["show_pairplot"])
        fig = generate_pairplot(data)
        resizable_container(fig)

    # Distribution
    if st.checkbox(strings["show_distribution"]):
        st.subheader(strings["show_distribution"])
        column = st.selectbox(
            strings["select_column"],
            [col for col in data.columns if col != strings["target"]],
        )
        fig = generate_distribution_plot(data, column)
        resizable_container(fig)

    # Fréquences
    if st.checkbox(strings["show_frequencies"]):
        st.subheader(strings["show_frequencies"])
        column = st.selectbox(strings["select_frequency_column"], data.columns)
        st.write(f"Fréquences pour {column}:")
        st.write(data[column].value_counts())


# Assurez-vous que cette ligne est présente à la fin du fichier
__all__ = ["run_data_analysis"]
