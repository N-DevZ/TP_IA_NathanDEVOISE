import sys
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier
import streamlit as st
import pandas as pd
import os
import webbrowser
from configparser import ConfigParser
from sklearn.preprocessing import LabelEncoder
from src.data.data_loader import load_data
from src.data.data_cleaner import clean_data
from src.analysis.data_analysis import run_data_analysis
from src.preprocessing.preprocessing import run_preprocessing
from src.models.machine_learning import run_machine_learning
from src.models.deep_learning.deep_learning import run_deep_learning
from src.evaluation.evaluation import run_evaluation

if getattr(sys, "frozen", False):
    # Si l'application est "gelée" (compilée)
    base_path = sys._MEIPASS
else:
    # En développement
    base_path = os.path.dirname(os.path.abspath(__file__))
# Configuration
config = ConfigParser()
base_path = os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(base_path, "src", "conf", "Strings.ini")

if not os.path.exists(config_path):
    config_path = os.path.join(base_path, "Strings.ini")

if not os.path.exists(config_path):
    raise FileNotFoundError(f"Le fichier de configuration n'existe pas : {config_path}")

config.read(config_path, encoding="utf-8")

if "main" not in config.sections():
    raise KeyError("La section 'main' n'existe pas dans le fichier de configuration")

strings = config["main"]

st.set_page_config(
    page_title=strings.get("project_title", "Projet ML - Wine Analyzer"),
    page_icon=strings.get("wine_emoji", "🍷"),
    layout=strings.get("layout", "wide"),
    initial_sidebar_state="collapsed",  # Change this to collapse the sidebar
)


@st.cache_data
def load_and_clean_data():
    data = load_data()
    cleaned_data = clean_data(data)
    return cleaned_data


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

    # Dictionnaire de mapping pour les noms de fichiers
    file_name_mapping = {
        "data_loader.html": "Chargement des données",
        "data_analysis.html": "Analyse des données",
        "preprocessing.html": "Prétraitement",
        "machine_learning.html": "Machine Learning",
        "deep_learning.html": "Deep Learning",
        "evaluation.html": "Évaluation",
    }

    # Récupérer tous les fichiers HTML, en excluant index.html et les fichiers dans les sous-dossiers
    html_files = [
        f
        for f in os.listdir(docs_dir)
        if f.endswith(".html")
        and f != "index.html"
        and not os.path.isdir(os.path.join(docs_dir, f))
    ]

    if not html_files:
        st.error(
            strings.get(
                "no_html_files",
                "Aucun fichier HTML n'a été trouvé dans le dossier de documentation.",
            )
        )
        return

    # Créer une liste de tuples (nom affiché, nom de fichier) sans doublons
    display_options = []
    for f in html_files:
        display_name = file_name_mapping.get(f, f[:-5].replace("_", " ").title())
        display_options.append((display_name, f))

    # Supprimer les doublons en conservant la première occurrence
    display_options = list(dict.fromkeys(display_options))

    # Trier les options par nom affiché
    display_options.sort(key=lambda x: x[0])

    # Créer un menu déroulant pour sélectionner le fichier HTML
    selected_display, selected_file = st.selectbox(
        "Sélectionnez un document", options=display_options, format_func=lambda x: x[0]
    )

    # Afficher le contenu du fichier HTML sélectionné
    file_path = os.path.join(docs_dir, selected_file)
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            html_content = file.read()

        # Ajouter du CSS pour que le texte soit en blanc et ajouter une marge en bas
        styled_html = f"""
        <style>
        .doc-content {{
            color: white;
            margin-bottom: 250px;
        }}
        </style>
        <div class="doc-content">
        {html_content}
        </div>
        """

        st.components.v1.html(styled_html, height=600, scrolling=True)

        # Ajouter un espace supplémentaire après le composant HTML
        st.markdown("<div style='height: 100px;'></div>", unsafe_allow_html=True)
    else:
        st.error(
            strings.get(
                "file_not_found",
                f"Le fichier {selected_file} n'a pas été trouvé dans le dossier de documentation.",
            )
        )


def show_home(data):
    col1, col2 = st.columns([0.95, 0.05])
    with col1:
        st.title(strings.get("project_title", "Wine Analysis"))
    with col2:
        if "github_repo" in strings:
            st.markdown(
                f"""
                <a href="{strings['github_repo']}" target="_blank" title="Voir le dépôt GitHub">
                    <img src="{strings.get('github_icon', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')}" width="50">
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


def main():
    # CSS personnalisé pour les onglets et pour masquer les éléments non désirés
    st.markdown(
        """
    <style>
    #MainMenu {visibility: hidden;}
    header {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Style de base pour les onglets */
    .stTabs {
        position: sticky;
        width: 100vw !important;
        top: 0;
        left: 0;
        right: 0;
        z-index: 999;
        background-color: #260031;
        margin-left: -2rem;
        padding: 20px 40px;
        border-bottom: 1px solid #444;
        box-shadow: 0 2px 10px rgba(0,0,0,0.4);
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 6vw;
        justify-content: center;
        flex-wrap: wrap;
    }
    .stTabs [data-baseweb="tab"] {
        height: 30px;
        padding: 0 15px;
        color: white;
        background-color: transparent;
        border-radius: 4px;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
    }
    .stTabs [aria-selected="true"] {
        background-color: rgba(255,255,255,0.1);
    }
    
    /* Ajustements responsifs */
    @media (max-width: 1200px) {
        .stTabs [data-baseweb="tab-list"] {
            gap: 4vw;
        }
        .stTabs [data-baseweb="tab"] {
            padding: 0 10px;
            font-size: 12px;
            max-width: 120px;
        }
    }
    
    @media (max-width: 768px) {
        .stTabs {
            padding: 10px 20px;
        }
        .stTabs [data-baseweb="tab-list"] {
            gap: 2vw;
        }
        .stTabs [data-baseweb="tab"] {
            padding: 0 8px;
            font-size: 11px;
            max-width: 100px;
        }
    }
    
    @media (max-width: 480px) {
        .stTabs [data-baseweb="tab-list"] {
            flex-direction: column;
            align-items: stretch;
        }
        .stTabs [data-baseweb="tab"] {
            max-width: none;
            margin-bottom: 5px;
        }
    }
    
    /* Ajuster le contenu principal */
    .main .block-container {
        padding-top: 5rem;
    }
    .block-container {
        padding-top: 0rem !important;
        padding-left: 0rem !important;
        padding-right: 0rem !important;
        max-width: 95% !important;
        max-height: 100%;
    }
    
    /* Supprime aussi tout margin/padding au niveau global */
    .main, html, body {
        padding: 0 !important;
        margin: 0 !important;
    }
    
    /* Si la classe change (nom généré), tu peux aussi la surcharger de force */
    [class^="st-emotion-cache"][class*="block-container"] {
        padding-top: 0rem !important;
        padding-left: 0rem !important;
        padding-right: 0rem !important;
        max-width: 100% !important;
    }
    </style>
    """,
        unsafe_allow_html=True,
    )

    # Création des onglets
    tabs = st.tabs(
        [
            f"{strings.get('home', '')} 🏠",
            f"{strings.get('data_analysis', 'Analyse')} 📊",
            f"{strings.get('preprocessing', 'Prétraitement')} 🔧",
            f"{strings.get('machine_learning', 'Machine Learning')} 🤖",
            f"{strings.get('evaluation', 'Évaluation')} 📈",
            f"{strings.get('bonus', 'Bonus')} 🎁",
            f"{strings.get('documentation', 'Documentation')} 📚",
        ]
    )

    data = load_and_clean_data()

    if "target_encoded" not in data.columns:
        le = LabelEncoder()
        data["target_encoded"] = le.fit_transform(data["target"])
        st.session_state["le"] = le
    # Ajout d'un espace pour compenser la hauteur des onglets fixes
    st.markdown("<div style='height: 100px;'></div>", unsafe_allow_html=True)

    # Contenu des onglets
    with tabs[0]:  # Accueil
        show_home(data)

    with tabs[1]:  # Analyse des données
        run_data_analysis(data)

    with tabs[2]:  # Prétraitement
        data = run_preprocessing(data)

    with tabs[3]:  # Machine Learning
        features = st.multiselect(
            strings.get("select_features", "Sélectionnez les features"),
            data.columns[:-2],
            key="feature_selection_main",
        )
        target = strings.get("target_encoded", "target_encoded")
        if features:
            X = data[features]
            y = data[target]
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            st.session_state.update(
                {
                    "X_train": X_train,
                    "X_test": X_test,
                    "y_train": y_train,
                    "y_test": y_test,
                    "features": features,
                }
            )

            algorithm = st.selectbox(
                strings.get("choose_algorithm", "Choisissez un algorithme"),
                [
                    "Logistic Regression",
                    "Decision Tree",
                    "Random Forest",
                    "SVM",
                    "KNN",
                    "Naive Bayes",
                    "MLP",
                ],
            )

            model = {
                "Logistic Regression": LogisticRegression(),
                "Decision Tree": DecisionTreeClassifier(),
                "Random Forest": RandomForestClassifier(),
                "SVM": SVC(probability=True),
                "KNN": KNeighborsClassifier(),
                "Naive Bayes": GaussianNB(),
                "MLP": MLPClassifier(max_iter=1000),
            }[algorithm]

            if st.button(
                strings.get("train_model", "Entraîner le modèle"),
                key="train_model_main",
            ):
                try:
                    model.fit(X_train, y_train)
                    st.session_state["model"] = model
                    st.success(
                        strings.get(
                            "model_trained", "Le modèle a été entraîné avec succès!"
                        )
                    )
                    accuracy = model.score(X_test, y_test)
                    st.write(f"Précision sur l'ensemble de test : {accuracy:.2f}")
                except Exception as e:
                    st.error(
                        f"Une erreur s'est produite lors de l'entraînement : {str(e)}"
                    )

            if st.checkbox(
                strings.get("predict_new_data", "Prédire sur de nouvelles données")
            ):
                if "model" in st.session_state:
                    new_data = {
                        feature: st.number_input(f"Entrez la valeur pour {feature}")
                        for feature in features
                    }
                    new_df = pd.DataFrame([new_data])
                    prediction = st.session_state["model"].predict(new_df)
                    st.write(
                        f"Prédiction : {st.session_state['le'].inverse_transform(prediction)[0]}"
                    )
                else:
                    st.warning(
                        strings.get(
                            "train_model_first", "Veuillez d'abord entraîner le modèle."
                        )
                    )
        else:
            st.warning(
                strings.get(
                    "select_feature_warning",
                    "Veuillez sélectionner au moins une feature pour continuer.",
                )
            )

    with tabs[4]:  # Évaluation
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

    with tabs[5]:  # Bonus
        run_deep_learning(data)

    with tabs[6]:  # Documentation
        show_documentation()

    # Pied de page
    # st.markdown("---")
    # st.text(strings.get("\n\ncopyright", "© 2023 Projet ML - Analyse de Vin"))


if __name__ == "__main__":
    main()
