import streamlit as st
import os
from data_loader import load_data
from data_analysis import run_data_analysis
from preprocessing import run_preprocessing
from machine_learning import run_machine_learning
from deep_learning import run_deep_learning

st.set_page_config(
    page_title="Projet ML - Analyse de Vin",
    page_icon=":wine_glass:",
    layout="wide",
    initial_sidebar_state="expanded",
)


import webbrowser


def show_documentation():
    st.title("Documentation Technique")

    docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")

    if not os.path.exists(docs_dir):
        st.warning(
            "La documentation n'a pas encore été générée. Veuillez exécuter generate_docs.py d'abord."
        )
        return

    index_path = os.path.join(docs_dir, "index.html")
    if os.path.exists(index_path):
        # Ouvrir le fichier index.html dans le navigateur par défaut
        webbrowser.open("file://" + os.path.realpath(index_path))
        st.success("La documentation a été ouverte dans votre navigateur.")
    else:
        st.error(
            "Le fichier index.html n'a pas été trouvé dans le dossier de documentation."
        )


def main():
    data = load_data()

    st.sidebar.title("Navigation")
    page = st.sidebar.radio(
        "Aller à",
        [
            "Accueil",
            "Analyse des données",
            "Prétraitement",
            "Machine Learning",
            "Évaluation",
            "Bonus",
            "Documentation",
        ],
    )

    if page == "Accueil":
        st.title("Projet ML - Analyse de Vin")
        st.markdown(
            """
        <a href="https://github.com/N-DevZ/TP_IA_NathanDEVOISE.git" target="_blank">
            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="50">
        </a>
        """,
            unsafe_allow_html=True,
        )
        st.write("Bienvenue dans mon application d'analyse de vin!")
        st.dataframe(data.head())
    elif page == "Analyse des données":
        run_data_analysis(data)
    elif page == "Prétraitement":
        run_preprocessing(data)
    elif page == "Machine Learning":
        features = st.multiselect(
            "Sélectionnez les features", data.columns[:-2], key="feature_selection_main"
        )
        target = "target_encoded"
        if features:
            run_machine_learning(data, features, target)
        else:
            st.warning("Veuillez sélectionner au moins une feature pour continuer.")
    elif page == "Évaluation":
        # Ajoutez la logique d'évaluation ici
        st.title("Évaluation")
        st.write("Cette section est en cours de développement.")
    elif page == "Bonus":
        run_deep_learning(data)
    elif page == "Documentation":
        show_documentation()

    st.sidebar.markdown("---")
    st.sidebar.text("© 2023 Projet ML - Analyse de Vin")


if __name__ == "__main__":
    main()
