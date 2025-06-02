# 🍷 Projet d'Analyse de Vin avec Machine Learning

![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)
![Streamlit](https://img.shields.io/badge/Streamlit-1.0+-red.svg)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-0.24+-green.svg)

## 📊 À propos du projet

Ce projet est une application web interactive développée avec Streamlit pour analyser un dataset de vins. L'application présente un pipeline complet de Machine Learning, de l'analyse exploratoire des données jusqu'à l'évaluation des modèles, offrant une expérience immersive dans le monde de la data science appliquée à l'œnologie.

## ✨ Fonctionnalités

- **🔍 Exploration des données** : Visualisation interactive du dataset de vins.
- **🧹 Prétraitement** : Gestion des valeurs manquantes, standardisation, et sélection de features.
- **📈 Analyse exploratoire** : Distributions, pairplots, et matrices de corrélation.
- **🤖 Modélisation ML** : Choix entre plusieurs algorithmes de classification.
- **📊 Évaluation** : Métriques de performance et visualisations des résultats.
- **🔮 Prédictions** : Interface pour prédire sur de nouvelles données.
- **🚀 Bonus** : Fonctionnalités avancées de machine learning et deep learning.

## 🚀 Comment démarrer

1. **Clonez le repository** :

    ```bash
    git clone https://github.com/votre-username/votre-repo.git
    cd votre-repo
    ```

2. **Installez les dépendances** :

    ```bash
    pip install -r requirements.txt
    ```

3. **Lancez l'application Streamlit** :

    ```bash
    streamlit run src/app.py
    ```

---

## 🗂 Structure du projet

```plaintext
votre-repo/
│
├── src/
│   ├── app.py              # Script principal Streamlit
│   ├── data_loader.py      # Chargement des données
│   ├── data_analysis.py    # Analyse exploratoire des données
│   ├── preprocessing.py    # Prétraitement des données
│   ├── machine_learning.py # Modélisation et prédictions
│   ├── evaluation.py       # Évaluation des modèles
│   ├── deep_learning.py    # Fonctionnalités de deep learning
│   └── bonus.py            # Fonctionnalités bonus
│
├── data/
│   └── vin.csv             # Dataset des vins
│
├── models/
│   └── wine_model.joblib   # Modèle ML sauvegardé (généré par l'application)
│
├── requirements.txt        # Fichier listant les dépendances Python
└── README.md               # Fichier de documentation du projet