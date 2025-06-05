import streamlit as st
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import plotly.figure_factory as ff
import pandas as pd
from configparser import ConfigParser
import os

config = ConfigParser()
config_path = os.path.join(os.path.dirname(__file__), "..", "conf", "Strings.ini")
config.read(config_path, encoding="utf-8")

if "evaluation" not in config.sections():
    raise KeyError(
        "La section 'evaluation' n'existe pas dans le fichier de configuration"
    )
strings = config["evaluation"]


def run_evaluation(model, X_test, y_test, le):
    st.title(strings["evaluation_title"])

    if model is not None:
        y_pred = model.predict(X_test)
        y_pred_labels = le.inverse_transform(y_pred)
        y_test_labels = le.inverse_transform(y_test)

        # Métriques principales
        accuracy = accuracy_score(y_test, y_pred)
        precision = classification_report(
            y_test_labels, y_pred_labels, output_dict=True
        )["weighted avg"]["precision"]
        recall = classification_report(y_test_labels, y_pred_labels, output_dict=True)[
            "weighted avg"
        ]["recall"]

        # Affichage horizontal
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric(label="Recall", value=f"{recall:.2f}")
        with col2:
            st.metric(label="Accuracy", value=f"{accuracy:.2f}")
        with col3:
            st.metric(label="Precision", value=f"{precision:.2f}")

        # Matrice de confusion
        st.subheader(strings["confusion_matrix"])
        cm = confusion_matrix(y_test_labels, y_pred_labels)
        class_labels = le.classes_.tolist()
        fig = ff.create_annotated_heatmap(
            cm, x=class_labels, y=class_labels, colorscale="Viridis"
        )
        fig.update_layout(
            title_text="Matrice de Confusion",
            xaxis_title="Prédictions",
            yaxis_title="Valeurs Réelles",
            width=600,
            height=500,
        )
        st.plotly_chart(fig, use_container_width=True)

        # Rapport de classification
        st.subheader(strings["classification_report"])
        report = classification_report(y_test_labels, y_pred_labels, output_dict=True)
        df_report = pd.DataFrame(report).transpose()
        st.dataframe(df_report.style.highlight_max(axis=0))

    else:
        st.warning(strings["train_model_warning"])
