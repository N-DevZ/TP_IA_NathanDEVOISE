import streamlit as st
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
import joblib
import os
from configparser import ConfigParser

config = ConfigParser()
config.read(
    os.path.join(os.path.dirname(__file__), "..", "Strings.ini"), encoding="utf-8"
)
strings = config["machine_learning"]


def run_machine_learning(data, features, target):
    st.title(strings["ml_title"])

    X = data[features]
    y = data[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model_choice = st.selectbox(
        strings["model_choice"],
        [
            strings["logistic_regression"],
            strings["decision_tree"],
            strings["random_forest"],
        ],
    )

    if model_choice == strings["logistic_regression"]:
        model = LogisticRegression()
    elif model_choice == strings["decision_tree"]:
        model = DecisionTreeClassifier()
    else:
        model = RandomForestClassifier()

    if st.button(strings["train_model"]):
        model.fit(X_train_scaled, y_train)
        st.session_state["model"] = model
        st.success(strings["model_trained"])

    if st.button(strings["save_model"]):
        if "model" in st.session_state:
            os.makedirs(strings["models_dir"], exist_ok=True)
            joblib.dump(st.session_state["model"], strings["model_path"])
            st.success(strings["model_saved"])
        else:
            st.warning(strings["train_model_first"])

    if st.checkbox(strings["predict_new_data"]):
        if "model" in st.session_state:
            new_data = {}
            for feature in features:
                new_data[feature] = st.number_input(
                    strings["enter_value"].format(feature=feature)
                )
            new_df = pd.DataFrame([new_data])
            new_df_scaled = scaler.transform(new_df)
            prediction = st.session_state["model"].predict(new_df_scaled)
            st.write(strings["prediction"].format(prediction=prediction[0]))
        else:
            st.warning(strings["train_model_first"])

    return st.session_state.get("model")
