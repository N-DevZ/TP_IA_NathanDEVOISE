import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer    
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from lazypredict.Supervised import LazyClassifier
import joblib
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense

# Configuration de la page Streamlit
st.set_page_config(
    page_title="Projet ML - Analyse de Vin",
    page_icon=":wine_glass:",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Fonction pour charger les données
@st.cache_data
def load_data():
    data = pd.read_csv("vin.csv")
    return data

# Chargement des données
data = load_data()

# Encodage de la variable cible
le = LabelEncoder()
data['target_encoded'] = le.fit_transform(data['target'])

features = []
X_train, X_test, y_train, y_test = None, None, None, None

# Sidebar pour la navigation
st.sidebar.title("Navigation")
page = st.sidebar.radio("Aller à", ["Accueil", "Analyse des données", "Prétraitement", "Machine Learning", "Évaluation", "Bonus"])

if page == "Accueil":
    st.title("Projet ML - Analyse de Vin")
    st.write("Bienvenue dans notre application d'analyse de vin!")
    st.dataframe(data.head())

elif page == "Analyse des données":
    st.title("Analyse des données")
    
    # Analyse descriptive
    if st.checkbox("Afficher l'analyse descriptive"):
        st.write(data.describe())
    
    # Graphiques de distribution
    if st.checkbox("Afficher les graphiques de distribution"):
        column = st.selectbox("Choisissez une colonne", data.columns[:-1])  # Exclure 'target_encoded'
        fig, ax = plt.subplots()
        sns.histplot(data[column], ax=ax)
        st.pyplot(fig)
    
    # Matrice de corrélation
    if st.checkbox("Afficher la matrice de corrélation"):
        fig, ax = plt.subplots(figsize=(10, 8))
        sns.heatmap(data.drop(['target', 'target_encoded'], axis=1).corr(), annot=True, cmap='coolwarm', ax=ax)
        st.pyplot(fig)
    
    # Pairplot
    if st.checkbox("Afficher le pairplot"):
        fig = sns.pairplot(data.drop('target_encoded', axis=1), hue='target')
        st.pyplot(fig)
    
    # Fréquences
    if st.checkbox("Afficher les fréquences"):
        column = st.selectbox("Choisissez une colonne pour les fréquences", data.columns[:-1])
        st.write(data[column].value_counts())

elif page == "Prétraitement":
    st.title("Prétraitement des données")
    
    # Sélection des colonnes
    selected_columns = st.multiselect("Sélectionnez les colonnes à conserver", data.columns[:-2])
    if selected_columns:
        data_preprocessed = data[selected_columns + ['target_encoded']]
    else:
        data_preprocessed = data.drop('target', axis=1)
    
    # Gestion des valeurs manquantes
    if st.checkbox("Gérer les valeurs manquantes"):
        impute_method = st.selectbox("Choisissez la méthode d'imputation", ["mean", "median", "most_frequent"])
        imputer = SimpleImputer(strategy=impute_method)
        data_imputed = pd.DataFrame(imputer.fit_transform(data_preprocessed), columns=data_preprocessed.columns)
        st.write(data_imputed)
    
    # Standardisation
    if st.checkbox("Standardiser les données"):
        scaler = StandardScaler()
        data_scaled = pd.DataFrame(scaler.fit_transform(data_preprocessed.drop('target_encoded', axis=1)), 
                                   columns=data_preprocessed.columns[:-1])
        data_scaled['target_encoded'] = data_preprocessed['target_encoded']
        st.write(data_scaled)
        data_preprocessed = data_scaled

elif page == "Machine Learning":
    st.title("Machine Learning")
    
    # Sélection des features et de la target
    features = st.multiselect("Sélectionnez les features", data.columns[:-2])
    target = 'target_encoded'
    
    if features:
        # Préparation des données
        X = data[features]
        y = data[target]
        
        # Split des données
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Stockage des données dans la session
        st.session_state['X_train'] = X_train
        st.session_state['X_test'] = X_test
        st.session_state['y_train'] = y_train
        st.session_state['y_test'] = y_test
        st.session_state['features'] = features
        
        # Choix de l'algorithme
        algorithm = st.selectbox("Choisissez un algorithme", ["Logistic Regression", "Decision Tree", "Random Forest"])
        
        if algorithm == "Logistic Regression":
            model = LogisticRegression()
        elif algorithm == "Decision Tree":
            model = DecisionTreeClassifier()
        else:
            model = RandomForestClassifier()
        
        # Entraînement du modèle
        if st.button("Entraîner le modèle"):
            model.fit(X_train, y_train)
            st.session_state['model'] = model  # Sauvegarder le modèle dans la session
            st.success("Modèle entraîné avec succès!")
        
        # Prédiction sur de nouvelles données
        if st.checkbox("Prédire sur de nouvelles données"):
            if 'model' in st.session_state:
                new_data = {}
                for feature in features:
                    new_data[feature] = st.number_input(f"Entrez la valeur pour {feature}")
                new_df = pd.DataFrame([new_data])
                prediction = st.session_state['model'].predict(new_df)
                st.write(f"Prédiction : {le.inverse_transform(prediction)[0]}")
            else:
                st.warning("Veuillez d'abord entraîner le modèle.")
        
        # Sauvegarde du modèle
        if st.button("Sauvegarder le modèle"):
            if 'model' in st.session_state:
                joblib.dump(st.session_state['model'], "wine_model.joblib")
                st.success("Modèle sauvegardé avec succès!")
            else:
                st.warning("Veuillez d'abord entraîner le modèle.")

elif page == "Évaluation":
    st.title("Évaluation du modèle")
    
    if 'model' in st.session_state and 'X_test' in st.session_state and 'y_test' in st.session_state:
        model = st.session_state['model']
        X_test = st.session_state['X_test']
        y_test = st.session_state['y_test']
        
        # Prédictions
        y_pred = model.predict(X_test)
        
        # Conversion des prédictions numériques en étiquettes originales
        y_pred_labels = le.inverse_transform(y_pred)
        y_test_labels = le.inverse_transform(y_test)
        
        # Métriques d'évaluation
        accuracy = accuracy_score(y_test, y_pred)
        st.write(f"Précision : {accuracy:.2f}")
        
        # Matrice de confusion
        fig, ax = plt.subplots()
        sns.heatmap(confusion_matrix(y_test_labels, y_pred_labels), annot=True, fmt='d', ax=ax)
        plt.title("Matrice de confusion")
        st.pyplot(fig)
        
        # Rapport de classification
        st.write("Rapport de classification:")
        st.text(classification_report(y_test_labels, y_pred_labels))
    else:
        st.warning("Veuillez d'abord sélectionner des features et entraîner un modèle dans la section Machine Learning.")

elif page == "Bonus":
    st.title("Fonctionnalités bonus")
    
    if 'X_train' in st.session_state and 'y_train' in st.session_state:
        X_train = st.session_state['X_train']
        X_test = st.session_state['X_test']
        y_train = st.session_state['y_train']
        y_test = st.session_state['y_test']
        features = st.session_state['features']
        
        # Lazy Predict
        if st.checkbox("Exécuter Lazy Predict"):
            clf = LazyClassifier(verbose=0, ignore_warnings=True, custom_metric=None)
            models, predictions = clf.fit(X_train, X_test, y_train, y_test)
            st.write(models)
        
        # GridSearchCV
        if st.checkbox("Exécuter GridSearchCV"):
            param_grid = {'C': [0.1, 1, 10], 'penalty': ['l2']}
            grid_search = GridSearchCV(LogisticRegression(solver='lbfgs'), param_grid, cv=5)
            grid_search.fit(X_train, y_train)
            st.write("Meilleurs paramètres:", grid_search.best_params_)
            st.write("Meilleur score:", grid_search.best_score_)
        
        # Deep Learning
        if st.checkbox("Entraîner un modèle de Deep Learning"):
            model = Sequential([
                Dense(64, activation='relu', input_shape=(len(features),)),
                Dense(32, activation='relu'),
                Dense(3, activation='softmax')  # 3 classes pour les types de vin
            ])
            model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
            history = model.fit(X_train, y_train, epochs=50, validation_split=0.2, verbose=0)
            st.line_chart(pd.DataFrame(history.history))
    else:
        st.warning("Veuillez d'abord sélectionner des features et entraîner un modèle dans la section Machine Learning.")

# Ajout d'un pied de page
st.sidebar.markdown("---")
st.sidebar.text("© 2023 Projet ML - Analyse de Vin")