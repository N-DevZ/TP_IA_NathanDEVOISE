import streamlit as st
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import pandas as pd


def run_preprocessing(data):
    st.title("Prétraitement des données")

    # Sélection des colonnes
    selected_columns = st.multiselect(
        "Sélectionnez les colonnes à conserver", data.columns[:-2]
    )
    if selected_columns:
        data_preprocessed = data[selected_columns + ["target_encoded"]]
    else:
        data_preprocessed = data.drop("target", axis=1)

    # Gestion des valeurs manquantes
    if st.checkbox("Gérer les valeurs manquantes"):
        impute_method = st.selectbox(
            "Choisissez la méthode d'imputation", ["mean", "median", "most_frequent"]
        )
        imputer = SimpleImputer(strategy=impute_method)
        data_imputed = pd.DataFrame(
            imputer.fit_transform(data_preprocessed), columns=data_preprocessed.columns
        )
        st.write(data_imputed)

    # Standardisation
    if st.checkbox("Standardiser les données"):
        scaler = StandardScaler()
        data_scaled = pd.DataFrame(
            scaler.fit_transform(data_preprocessed.drop("target_encoded", axis=1)),
            columns=data_preprocessed.columns[:-1],
        )
        data_scaled["target_encoded"] = data_preprocessed["target_encoded"]
        st.write(data_scaled)
        data_preprocessed = data_scaled

    return data_preprocessed
