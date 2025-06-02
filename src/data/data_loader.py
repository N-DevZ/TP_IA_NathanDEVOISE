import pandas as pd
import os
from configparser import ConfigParser

config = ConfigParser()
config.read(
    os.path.join(os.path.dirname(__file__), "..", "Strings.ini"), encoding="utf-8"
)
strings = config["data_loader"]


def load_data():
    data_path = strings["data_path"]
    if not os.path.exists(data_path):
        raise FileNotFoundError(strings["file_not_found"].format(data_path=data_path))
    data = pd.read_csv(data_path, encoding="utf-8")
    return data
