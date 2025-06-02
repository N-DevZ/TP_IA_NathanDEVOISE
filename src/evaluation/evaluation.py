import streamlit as st
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import seaborn as sns
import matplotlib.pyplot as plt
from configparser import ConfigParser
import os

config = ConfigParser()
config.read(
    os.path.join(os.path.dirname(__file__), "..", "Strings.ini"), encoding="utf-8"
)
strings = config["evaluation"]


def run_evaluation(model, X_test, y_test, le):
    st.title(strings["evaluation_title"])

    if model is not None:
        y_pred = model.predict(X_test)

        y_pred_labels = le.inverse_transform(y_pred)
        y_test_labels = le.inverse_transform(y_test)

        accuracy = accuracy_score(y_test, y_pred)
        st.write(strings["accuracy"].format(accuracy=accuracy))

        fig, ax = plt.subplots()
        sns.heatmap(
            confusion_matrix(y_test_labels, y_pred_labels), annot=True, fmt="d", ax=ax
        )
        plt.title(strings["confusion_matrix"])
        st.pyplot(fig)

        st.write(strings["classification_report"])
        st.text(classification_report(y_test_labels, y_pred_labels))
    else:
        st.warning(strings["train_model_warning"])
