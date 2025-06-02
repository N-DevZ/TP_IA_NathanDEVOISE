import streamlit as st
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
import joblib
import pandas as pd
import os


def run_machine_learning(data, initial_features, target):
    st.title("Machine Learning")

    # Permettre à l'utilisateur de modifier la sélection des features
    features = st.multiselect(
        "Affiner la sélection des features",
        data.columns[:-2],
        default=initial_features,
        key="feature_selection_ml",
    )

    if features:
        # Préparation des données
        X = data[features]
        y = data[target]

        # Split des données
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Stockage des données dans la session
        st.session_state["X_train"] = X_train
        st.session_state["X_test"] = X_test
        st.session_state["y_train"] = y_train
        st.session_state["y_test"] = y_test
        st.session_state["features"] = features

        # Choix de l'algorithme
        algorithm = st.selectbox(
            "Choisissez un algorithme",
            ["Logistic Regression", "Decision Tree", "Random Forest"],
        )

        if algorithm == "Logistic Regression":
            model = LogisticRegression()
        elif algorithm == "Decision Tree":
            model = DecisionTreeClassifier()
        else:
            model = RandomForestClassifier()

        # Entraînement du modèle
        if st.button("Entraîner le modèle"):
            model.fit(X_train, y_train)
            st.session_state["model"] = model
            st.success("Modèle entraîné avec succès!")

        # Sauvegarde du modèle
        if st.button("Sauvegarder le modèle"):
            if "model" in st.session_state:
                # Créer le dossier 'models' s'il n'existe pas
                os.makedirs("models", exist_ok=True)

                # Sauvegarder le modèle
                joblib.dump(st.session_state["model"], "models/wine_model.joblib")
                st.success("Modèle sauvegardé avec succès!")
            else:
                st.warning("Veuillez d'abord entraîner le modèle.")
        # Prédiction sur de nouvelles données
        if st.checkbox("Prédire sur de nouvelles données"):
            if "model" in st.session_state:
                new_data = {}
                for feature in features:
                    new_data[feature] = st.number_input(
                        f"Entrez la valeur pour {feature}"
                    )
                new_df = pd.DataFrame([new_data])
                prediction = st.session_state["model"].predict(new_df)
                st.write(f"Prédiction : {prediction[0]}")
            else:
                st.warning("Veuillez d'abord entraîner le modèle.")

        return st.session_state.get("model")
    else:
        st.warning("Veuillez sélectionner au moins une feature pour continuer.")
        return None
