from matplotlib import pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import streamlit as st
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
from configparser import ConfigParser
import os
import numpy as np

config = ConfigParser()
config.read(
    os.path.join(os.path.dirname(__file__), "..", "..", "Strings.ini"), encoding="utf-8"
)

# Vérifiez si la section "deep_learning" existe, sinon utilisez une section par défaut
if "deep_learning" in config:
    strings = config["deep_learning"]
else:
    # Utilisez un dictionnaire de chaînes par défaut
    strings = {
        "deep_learning_title": "Deep Learning avec PyTorch",
        "target": "target",
        "target_encoded": "target_encoded",
        "train_deep_learning": "Lancer le Deep Learning",
        "epoch_progress": "Époque {epoch}/{epochs}, Perte: {loss:.4f}",
        "training_complete": "Entraînement terminé !",
        "model_accuracy": "Précision du modèle: {accuracy:.2f}%",
    }


def run_deep_learning(data):
    st.title(strings["deep_learning_title"])

    X = data.drop([strings["target"], strings["target_encoded"]], axis=1)
    y = data[strings["target_encoded"]]

    # Affichage de la distribution des classes
    st.write("Distribution des classes:")
    st.write(y.value_counts(normalize=True))

    # Normalisation des données
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split des données
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    X_train_tensor = torch.FloatTensor(X_train)
    y_train_tensor = torch.LongTensor(y_train.values)
    X_test_tensor = torch.FloatTensor(X_test)
    y_test_tensor = torch.LongTensor(y_test.values)

    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    train_dataloader = DataLoader(train_dataset, batch_size=32, shuffle=True)

    class WineNet(nn.Module):
        def __init__(self, input_size):
            super(WineNet, self).__init__()
            self.fc1 = nn.Linear(input_size, 32)
            self.fc2 = nn.Linear(32, 3)
            self.dropout = nn.Dropout(0.3)

        def forward(self, x):
            x = torch.relu(self.fc1(x))
            x = self.dropout(x)
            x = self.fc2(x)
            return x

    model = WineNet(X.shape[1])
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-5)

    if "trained_model" not in st.session_state:
        st.session_state.trained_model = None

    if st.button(strings["train_deep_learning"]):
        epochs = 40
        losses = []
        accuracies = []
        for epoch in range(epochs):
            model.train()
            epoch_loss = 0
            for inputs, labels in train_dataloader:
                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item()

            avg_loss = epoch_loss / len(train_dataloader)
            losses.append(avg_loss)

            # Calcul de la précision sur l'ensemble d'entraînement
            model.eval()
            with torch.no_grad():
                train_outputs = model(X_train_tensor)
                _, train_predicted = torch.max(train_outputs.data, 1)
                train_accuracy = (
                    (train_predicted == y_train_tensor).float().mean().item()
                )
                accuracies.append(train_accuracy * 100)

            if (epoch + 1) % 10 == 0:
                st.write(
                    strings["epoch_progress"].format(
                        epoch=epoch + 1, epochs=epochs, loss=avg_loss
                    )
                )
                st.write(f"Précision d'entraînement: {train_accuracy * 100:.2f}%")

        # Afficher le message "Entraînement terminé" après la boucle
        st.success(strings["training_complete"])

        # Créer une figure avec deux sous-graphiques côte à côte
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))  # 1 ligne, 2 colonnes

        # Graphique de la perte
        ax1.plot(range(1, epochs + 1), losses)
        ax1.set_xlabel("Époque")
        ax1.set_ylabel("Perte moyenne")
        ax1.set_title("Évolution de la perte pendant l'entraînement")

        # Graphique de la précision
        ax2.plot(range(1, epochs + 1), accuracies)
        ax2.set_xlabel("Époque")
        ax2.set_ylabel("Précision (%)")
        ax2.set_title("Évolution de la précision pendant l'entraînement")

        plt.tight_layout()  # Ajustement automatique de l'espacement

        # Créez une colonne Streamlit avec une largeur spécifiée
        col1, col2, col3 = st.columns(
            [1, 3, 1]
        )  # Ajustez ces valeurs selon vos besoins

        # Affichez la figure dans la colonne du milieu
        with col2:
            st.pyplot(fig, use_container_width=True)

        # Afficher la précision finale
        final_accuracy = accuracies[-1]
        st.write(f"Précision finale : {final_accuracy:.2f}%")

        st.session_state.trained_model = model
