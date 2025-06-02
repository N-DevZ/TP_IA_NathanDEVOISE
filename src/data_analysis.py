import streamlit as st
import matplotlib.pyplot as plt
import seaborn as sns


def run_data_analysis(data):
    st.title("Analyse des données")

    # Analyse descriptive
    if st.checkbox("Afficher l'analyse descriptive"):
        st.write(data.describe())

    # Graphiques de distribution
    if st.checkbox("Afficher les graphiques de distribution"):
        column = st.selectbox("Choisissez une colonne", data.columns[:-1])
        fig, ax = plt.subplots()
        sns.histplot(data[column], ax=ax)
        st.pyplot(fig)

    # Matrice de corrélation
    if st.checkbox("Afficher la matrice de corrélation"):
        fig, ax = plt.subplots(figsize=(10, 8))
        sns.heatmap(
            data.drop(["target", "target_encoded"], axis=1).corr(),
            annot=True,
            cmap="coolwarm",
            ax=ax,
        )
        st.pyplot(fig)

    # Pairplot
    if st.checkbox("Afficher le pairplot"):
        fig = sns.pairplot(data.drop("target_encoded", axis=1), hue="target")
        st.pyplot(fig)

    # Fréquences
    if st.checkbox("Afficher les fréquences"):
        column = st.selectbox(
            "Choisissez une colonne pour les fréquences", data.columns[:-1]
        )
        st.write(data[column].value_counts())
