import streamlit as st
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier
import joblib
import os
from configparser import ConfigParser

# Configuration
config = ConfigParser()
config_path = os.path.join(os.path.dirname(__file__), "..", "conf", "Strings.ini")
config.read(config_path, encoding="utf-8")
strings = config["machine_learning"]


def run_machine_learning(data, features, target):
    st.title(strings["machine_learning_title"])

    # Vérifications initiales
    if target not in data.columns:
        st.error(f"La colonne cible '{target}' n'existe pas dans les données.")
        return None

    if not features:
        st.error("Aucune feature n'a été sélectionnée.")
        return None

    X = data[features]
    y = data[target]

    # Séparation des données
    if "X_train" not in st.session_state:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        st.session_state["X_train"] = X_train
        st.session_state["X_test"] = X_test
        st.session_state["y_train"] = y_train
        st.session_state["y_test"] = y_test
    else:
        X_train, X_test, y_train, y_test = (
            st.session_state["X_train"],
            st.session_state["X_test"],
            st.session_state["y_train"],
            st.session_state["y_test"],
        )

    # Normalisation des données
    if "scaler" not in st.session_state:
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        st.session_state["scaler"] = scaler
        st.session_state["X_train_scaled"] = X_train_scaled
        st.session_state["X_test_scaled"] = X_test_scaled
    else:
        scaler = st.session_state["scaler"]
        X_train_scaled, X_test_scaled = (
            st.session_state["X_train_scaled"],
            st.session_state["X_test_scaled"],
        )

    # Sélection du modèle
    model_choice = st.selectbox(
        strings["choose_algorithm"],
        [
            strings["logistic_regression"],
            strings["decision_tree"],
            strings["random_forest"],
            strings["svm"],
            strings["knn"],
            strings["naive_bayes"],
            strings["mlp"],
        ],
        key="model_choice",
    )

    # Création et entraînement du modèle
    if model_choice == strings["logistic_regression"]:
        model = LogisticRegression(random_state=42)
    elif model_choice == strings["decision_tree"]:
        model = DecisionTreeClassifier(random_state=42)
    elif model_choice == strings["random_forest"]:
        model = RandomForestClassifier(random_state=42)
    elif model_choice == strings["svm"]:
        model = SVC(random_state=42)
    elif model_choice == strings["knn"]:
        model = KNeighborsClassifier()
    elif model_choice == strings["naive_bayes"]:
        model = GaussianNB()
    elif model_choice == strings["mlp"]:
        model = MLPClassifier(random_state=42)

    if st.button(strings["train_model"], key="train_model_button"):
        try:
            model.fit(X_train_scaled, y_train)
            st.session_state["model"] = model
            st.success(strings["model_trained"])
        except Exception as e:
            st.error(f"Erreur lors de l'entraînement du modèle : {str(e)}")
            return None

    # Sauvegarde du modèle
    if "model" in st.session_state and st.button(
        strings["save_model"], key="save_model_button"
    ):
        try:
            os.makedirs(strings["models_dir"], exist_ok=True)
            joblib.dump(st.session_state["model"], strings["model_path"])
            joblib.dump(scaler, strings["scaler_path"])
            st.success(strings["model_saved"])
        except Exception as e:
            st.error(f"Erreur lors de la sauvegarde du modèle : {str(e)}")

    # Prédiction sur de nouvelles données
    if "model" in st.session_state and st.checkbox(
        strings["predict_new_data"], key="predict_new_data_checkbox"
    ):
        new_data = {}
        for feature in features:
            new_data[feature] = st.number_input(
                strings["feature_input"].format(feature=feature),
                key=f"input_{feature}",
            )
        new_df = pd.DataFrame([new_data])
        new_df_scaled = scaler.transform(new_df)
        prediction = st.session_state["model"].predict(new_df_scaled)
        st.write(strings["prediction_result"].format(prediction=prediction[0]))

    if "model" in st.session_state:
        return st.session_state["model"], X_test_scaled, y_test
    else:
        return None
