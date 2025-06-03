import streamlit as st
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from configparser import ConfigParser
import os

config = ConfigParser()
config.read(
    os.path.join(os.path.dirname(__file__), "..", "conf", "Strings.ini"),
    encoding="utf-8",
)
strings = config["preprocessing"]


def run_preprocessing(data):
    st.title(strings["preprocessing_title"])

    st.subheader(strings["missing_values"])
    st.write(data.isnull().sum())

    st.subheader(strings["data_types"])
    st.write(data.dtypes)

    le = LabelEncoder()
    data["target_encoded"] = le.fit_transform(data["target"])

    st.subheader(strings["encoded_target"])
    st.write(
        pd.DataFrame(
            {
                strings["original_target"]: data["target"],
                strings["encoded_target"]: data["target_encoded"],
            }
        )
    )

    return data
