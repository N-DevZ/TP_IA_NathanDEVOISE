import streamlit as st
from sklearn.preprocessing import LabelEncoder
from src import (
    load_data,
    run_data_analysis,
    run_preprocessing,
    run_machine_learning,
    run_evaluation,
    run_bonus,
)

# Configuration de la page Streamlit
st.set_page_config(
    page_title="Projet ML - Analyse de Vin",
    page_icon=":wine_glass:",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Chargement des données
data = load_data()

# Encodage de la variable cible
le = LabelEncoder()
data["target_encoded"] = le.fit_transform(data["target"])

# Initialisation de data_preprocessed
data_preprocessed = data.copy()

# Sidebar pour la navigation
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
    data_preprocessed = run_preprocessing(data)

elif page == "Machine Learning":
    features = st.multiselect(
        "Sélectionnez les features", data_preprocessed.columns[:-2]
    )
    target = "target_encoded"
    if features:
        model = run_machine_learning(data_preprocessed, features, target)

elif page == "Évaluation":
    if (
        "model" in st.session_state
        and "X_test" in st.session_state
        and "y_test" in st.session_state
    ):
        run_evaluation(
            st.session_state["model"],
            st.session_state["X_test"],
            st.session_state["y_test"],
            le,
        )
    else:
        st.warning(
            "Veuillez d'abord entraîner un modèle dans la section Machine Learning."
        )

elif page == "Bonus":
    if "X_train" in st.session_state and "y_train" in st.session_state:
        run_bonus(
            st.session_state["X_train"],
            st.session_state["X_test"],
            st.session_state["y_train"],
            st.session_state["y_test"],
            st.session_state["features"],
        )
    else:
        st.warning(
            "Veuillez d'abord entraîner un modèle dans la section Machine Learning."
        )

# Ajout d'un pied de page
st.sidebar.markdown("---")
st.sidebar.text("© 2023 Projet ML - Analyse de Vin")
