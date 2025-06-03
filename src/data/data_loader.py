import pandas as pd
import os
from configparser import ConfigParser

# Chemin absolu vers le fichier Strings.ini
strings_ini_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "src", "conf", "Strings.ini")
)

config = ConfigParser()
config.read(strings_ini_path, encoding="utf-8")

if "data_loader" not in config:
    raise KeyError(
        f"La section 'data_loader' n'existe pas dans le fichier {strings_ini_path}"
    )

strings = config["data_loader"]


def load_data():
    data_path = strings["data_path"]
    if not os.path.exists(data_path):
        raise FileNotFoundError(strings["file_not_found"].format(data_path=data_path))
    data = pd.read_csv(data_path, encoding="utf-8")
    return data
