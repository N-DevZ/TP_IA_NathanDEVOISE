import streamlit as st
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
        ],
    )

    if page == "Accueil":
        st.title("Projet ML - Analyse de Vin")
        st.write("Bienvenue dans notre application d'analyse de vin!")
        st.dataframe(data.head())
    elif page == "Analyse des données":
        run_data_analysis(data)
    elif page == "Prétraitement":
        run_preprocessing(data)
    elif page == "Machine Learning":
        run_machine_learning(data)
    elif page == "Évaluation":
        # Ajoutez la logique d'évaluation ici
        pass
    elif page == "Bonus":
        run_deep_learning(data)

    st.sidebar.markdown("---")
    st.sidebar.text("© 2023 Projet ML - Analyse de Vin")


if __name__ == "__main__":
    main()
