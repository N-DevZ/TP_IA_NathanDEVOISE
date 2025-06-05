import pandas as pd
from src.data.data_loader import load_data
import os
from configparser import ConfigParser

# Chemin absolu vers le fichier Strings.ini
strings_ini_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "conf", "Strings.ini")
)

config = ConfigParser()
config.read(strings_ini_path, encoding="utf-8")

if "data_cleaner" not in config:
    raise KeyError(
        f"La section 'data_cleaner' n'existe pas dans le fichier {strings_ini_path}"
    )

strings = config["data_cleaner"]


def clean_data(data):
    # Corriger "Vin éuilibré" en "Vin équilibré"
    data["target"] = data["target"].replace("Vin éuilibré", "Vin équilibré")

    print(
        strings.get(
            "cleaning_message",
            "Nettoyage des données effectué : 'Vin éuilibré' corrigé en 'Vin équilibré'",
        )
    )

    # Sauvegarder les données nettoyées
    cleaned_data_path = strings.get("cleaned_data_path")
    if cleaned_data_path:
        os.makedirs(os.path.dirname(cleaned_data_path), exist_ok=True)
        data.to_csv(cleaned_data_path, index=False, encoding="utf-8")
        print(
            strings.get(
                "saving_message",
                f"Données nettoyées sauvegardées dans {cleaned_data_path}",
            )
        )
    else:
        print(
            "Attention : Le chemin pour sauvegarder les données nettoyées n'est pas spécifié dans le fichier de configuration."
        )

    return data


if __name__ == "__main__":
    data = load_data()
    clean_data(data)
