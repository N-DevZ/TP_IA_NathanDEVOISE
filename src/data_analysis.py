import streamlit as st
import seaborn as sns
import matplotlib.pyplot as plt


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
        # Vérifiez si 'target_encoded' existe dans les colonnes
        columns_to_drop = ["target"]
        if "target_encoded" in data.columns:
            columns_to_drop.append("target_encoded")

        correlation_matrix = data.drop(columns_to_drop, axis=1, errors="ignore").corr()
        sns.heatmap(correlation_matrix, annot=True, cmap="coolwarm", ax=ax)
        st.pyplot(fig)

    # Pairplot
    if st.checkbox("Afficher le pairplot"):
        fig = sns.pairplot(
            data.drop("target_encoded", axis=1, errors="ignore"), hue="target"
        )
        st.pyplot(fig)

    # Fréquences
    if st.checkbox("Afficher les fréquences"):
        column = st.selectbox(
            "Choisissez une colonne pour les fréquences", data.columns[:-1]
        )
        st.write(data[column].value_counts())
