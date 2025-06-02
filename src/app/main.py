import streamlit as st
import os
import webbrowser
from configparser import ConfigParser
from src.data.data_loader import load_data
from src.analysis.data_analysis import run_data_analysis
from src.preprocessing.preprocessing import run_preprocessing
from src.models.machine_learning import run_machine_learning
from src.models.deep_learning.deep_learning import run_deep_learning

# Charger les chaînes de caractères depuis Strings.ini
config = ConfigParser()
config.read(
    os.path.join(os.path.dirname(__file__), "..", "Strings.ini"), encoding="utf-8"
)
strings = config["main"]

st.set_page_config(
    page_title=strings["project_title"],
    page_icon=strings["wine_emoji"],
    layout=strings["layout"],
    initial_sidebar_state=strings["sidebar_state"],
)


def show_documentation():
    st.title(strings["technical_documentation"])
    docs_dir = os.path.join(
        os.path.dirname(__file__), strings["parent_dir"], strings["docs_dir"]
    )
    if not os.path.exists(docs_dir):
        st.warning(strings["docs_not_generated"])
        return
    index_path = os.path.join(docs_dir, strings["index_file"])
    if os.path.exists(index_path):
        webbrowser.open(f"{strings['file_protocol']}{os.path.realpath(index_path)}")
        st.success(strings["docs_opened"])
    else:
        st.error(strings["index_not_found"])


def main():
    data = load_data()
    st.sidebar.title(strings["navigation"])
    page = st.sidebar.radio(
        strings["navigation_prompt"],
        [
            strings["home"],
            strings["data_analysis"],
            strings["preprocessing"],
            strings["machine_learning"],
            strings["evaluation"],
            strings["bonus"],
            strings["documentation"],
        ],
    )

    if page == strings["home"]:
        st.title(strings["project_title"])
        st.markdown(
            f"""
        <a href="{strings['github_repo']}" target="{strings['blank_target']}">
            <img src="{strings['github_icon']}" width="{strings['github_icon_size']}">
        </a>
        """,
            unsafe_allow_html=True,
        )
        st.write(strings["welcome_message"])
        st.dataframe(data.head())
    elif page == strings["data_analysis"]:
        run_data_analysis(data)
    elif page == strings["preprocessing"]:
        run_preprocessing(data)
    elif page == strings["machine_learning"]:
        features = st.multiselect(
            strings["select_features"],
            data.columns[:-2],
            key=strings["feature_selection_key"],
        )
        target = strings["target_encoded"]
        if features:
            run_machine_learning(data, features, target)
        else:
            st.warning(strings["select_feature_warning"])
    elif page == strings["evaluation"]:
        st.title(strings["evaluation"])
        st.write(strings["development_message"])
    elif page == strings["bonus"]:
        run_deep_learning(data)
    elif page == strings["documentation"]:
        show_documentation()

    st.sidebar.markdown(strings["separator"])
    st.sidebar.text(strings["copyright"])


if __name__ == "__main__":
    main()
