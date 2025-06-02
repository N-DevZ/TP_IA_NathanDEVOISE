import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from configparser import ConfigParser
import os

config = ConfigParser()
config.read(
    os.path.join(os.path.dirname(__file__), "..", "Strings.ini"), encoding="utf-8"
)
strings = config["data_analysis"]


def run_data_analysis(data):
    st.title("Analyse des données")

    st.write(f"Forme des données : {data.shape[0]} lignes et {data.shape[1]} colonnes")

    st.subheader("Informations sur les données")
    st.write(data.info())

    st.subheader("Description des données")
    st.write(data.describe())

    st.subheader("Matrice de corrélation")
    corr = data.corr()
    fig, ax = plt.subplots(figsize=(10, 8))
    sns.heatmap(corr, annot=True, cmap="coolwarm", ax=ax)
    st.pyplot(fig)

    st.subheader("Graphiques de distribution")
    for column in data.columns:
        if data[column].dtype != "object":
            fig, ax = plt.subplots()
            sns.histplot(data[column], kde=True, ax=ax)
            plt.title(f"Distribution de {column}")
            st.pyplot(fig)

    st.subheader("Pairplot")
    fig = sns.pairplot(data, hue="target")
    st.pyplot(fig)
