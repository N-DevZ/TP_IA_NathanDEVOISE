import pandas as pd
import streamlit as st
import os
from sklearn.preprocessing import LabelEncoder


@st.cache_data
def load_data():
    # Obtenez le chemin absolu du répertoire du script actuel (src)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Remontez d'un niveau pour atteindre le répertoire racine du projet
    project_root = os.path.dirname(current_dir)
    # Construisez le chemin vers le fichier de données dans le dossier 'data'
    data_path = os.path.join(project_root, "data", "vin.csv")

    # Vérifiez si le fichier existe
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Le fichier {data_path} n'existe pas.")

    data = pd.read_csv(data_path)
    le = LabelEncoder()
    data["target_encoded"] = le.fit_transform(data["target"])
    return data
