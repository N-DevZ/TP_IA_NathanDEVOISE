import streamlit as st
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import matplotlib.pyplot as plt
import seaborn as sns


def run_evaluation(model, X_test, y_test, le):
    st.title("Évaluation du modèle")

    if model is not None:
        # Prédictions
        y_pred = model.predict(X_test)

        # Conversion des prédictions numériques en étiquettes originales
        y_pred_labels = le.inverse_transform(y_pred)
        y_test_labels = le.inverse_transform(y_test)

        # Métriques d'évaluation
        accuracy = accuracy_score(y_test, y_pred)
        st.write(f"Précision : {accuracy:.2f}")

        # Matrice de confusion
        fig, ax = plt.subplots()
        sns.heatmap(
            confusion_matrix(y_test_labels, y_pred_labels), annot=True, fmt="d", ax=ax
        )
        plt.title("Matrice de confusion")
        st.pyplot(fig)

        # Rapport de classification
        st.write("Rapport de classification:")
        st.text(classification_report(y_test_labels, y_pred_labels))
    else:
        st.warning(
            "Veuillez d'abord entraîner un modèle dans la section Machine Learning."
        )
