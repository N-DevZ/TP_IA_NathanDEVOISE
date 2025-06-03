import streamlit as st
import pandas as pd
import os
import webbrowser
from configparser import ConfigParser
from src.data.data_loader import load_data
from src.analysis.data_analysis import run_data_analysis
from src.preprocessing.preprocessing import run_preprocessing
from src.models.machine_learning import run_machine_learning
from src.models.deep_learning.deep_learning import run_deep_learning
from src.evaluation.evaluation import run_evaluation

# Configuration
config = ConfigParser()
base_path = os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(base_path, "src/conf", "Strings.ini")

print(f"Chemin de configuration recherché : {config_path}")  # Débogage

if not os.path.exists(config_path):
    raise FileNotFoundError(f"Le fichier de configuration n'existe pas : {config_path}")

config.read(config_path, encoding="utf-8")
print(f"Sections disponibles : {config.sections()}")  # Débogage

if "main" not in config.sections():
    raise KeyError("La section 'main' n'existe pas dans le fichier de configuration")

strings = config["main"]

st.set_page_config(
    page_title=strings.get("project_title", "Projet ML - Analyse de Vin"),
    page_icon=strings.get("wine_emoji", "🍷"),
    layout=strings.get("layout", "wide"),
    initial_sidebar_state=strings.get("sidebar_state", "expanded"),
)


def show_documentation():
    st.title(strings.get("technical_documentation", "Documentation Technique"))
    docs_dir = os.path.join(os.path.dirname(__file__), strings.get("docs_dir", "docs"))
    if not os.path.exists(docs_dir):
        st.warning(
            strings.get(
                "docs_not_generated", "La documentation n'a pas encore été générée."
            )
        )
        return
    index_path = os.path.join(docs_dir, strings.get("index_file", "index.html"))
    if os.path.exists(index_path):
        webbrowser.open(f"file://{os.path.realpath(index_path)}")
        st.success(
            strings.get(
                "docs_opened", "La documentation a été ouverte dans votre navigateur."
            )
        )
    else:
        st.error(
            strings.get(
                "index_not_found",
                "Le fichier index.html n'a pas été trouvé dans le dossier de documentation.",
            )
        )


def main():
    data = load_data()

    st.sidebar.title(strings.get("navigation", "Navigation"))
    page = st.sidebar.radio(
        strings.get("navigation_prompt", "Aller à"),
        [
            strings.get("home", "Accueil"),
            strings.get("data_analysis", "Analyse des données"),
            strings.get("preprocessing", "Prétraitement"),
            strings.get("machine_learning", "Machine Learning"),
            strings.get("evaluation", "Évaluation"),
            strings.get("bonus", "Bonus"),
            strings.get("documentation", "Documentation"),
        ],
    )

    if page == strings.get("home", "Accueil"):
        st.title(strings.get("project_title", "Projet ML - Analyse de Vin"))
        if "github_repo" in strings:
            st.markdown(
                f"""
                <a href="{strings['github_repo']}" target="{strings.get('blank_target', '_blank')}">
                    <img src="{strings.get('github_icon', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')}" width="{strings.get('github_icon_size', '50')}">
                </a>
                """,
                unsafe_allow_html=True,
            )
        st.write(
            strings.get(
                "welcome_message", "Bienvenue dans mon application d'analyse de vin!"
            )
        )
        st.dataframe(data.head())

    elif page == strings.get("data_analysis", "Analyse des données"):
        run_data_analysis(data)

    elif page == strings.get("preprocessing", "Prétraitement"):
        run_preprocessing(data)

    elif page == strings.get("machine_learning", "Machine Learning"):
        features = st.multiselect(
            strings.get("select_features", "Sélectionnez les features"),
            data.columns[:-2],
            key=strings.get("feature_selection_key", "feature_selection_main"),
        )
        target = strings.get("target_encoded", "target_encoded")
        if features:
            run_machine_learning(data, features, target)
        else:
            st.warning(
                strings.get(
                    "select_feature_warning",
                    "Veuillez sélectionner au moins une feature pour continuer.",
                )
            )

    elif page == strings.get("evaluation", "Évaluation"):
        if all(key in st.session_state for key in ["model", "X_test", "y_test"]):
            run_evaluation(
                st.session_state["model"],
                st.session_state["X_test"],
                st.session_state["y_test"],
                st.session_state.get("le"),
            )
        else:
            st.warning(
                strings.get(
                    "train_model_first",
                    "Veuillez d'abord entraîner un modèle dans la section Machine Learning.",
                )
            )

    elif page == strings.get("bonus", "Bonus"):
        run_deep_learning(data)

    elif page == strings.get("documentation", "Documentation"):
        show_documentation()

    st.sidebar.markdown(strings.get("separator", "---"))
    st.sidebar.text(strings.get("copyright", "© 2023 Projet ML - Analyse de Vin"))


if __name__ == "__main__":
    main()
