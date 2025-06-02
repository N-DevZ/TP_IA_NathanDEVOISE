import streamlit as st
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import pandas as pd


def run_deep_learning(data):
    st.title("Deep Learning avec PyTorch")

    # Préparation des données
    X = data.drop(["target", "target_encoded"], axis=1)
    y = data["target_encoded"]

    # Conversion en tenseurs PyTorch
    X_tensor = torch.FloatTensor(X.values)
    y_tensor = torch.LongTensor(y.values)

    # Création du dataset et du dataloader
    dataset = TensorDataset(X_tensor, y_tensor)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

    # Définition du modèle
    class WineNet(nn.Module):
        def __init__(self, input_size):
            super(WineNet, self).__init__()
            self.fc1 = nn.Linear(input_size, 64)
            self.fc2 = nn.Linear(64, 32)
            self.fc3 = nn.Linear(32, 3)  # 3 classes de vin

        def forward(self, x):
            x = torch.relu(self.fc1(x))
            x = torch.relu(self.fc2(x))
            x = self.fc3(x)
            return x

    model = WineNet(X.shape[1])

    # Définition de la fonction de perte et de l'optimiseur
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters())

    # Entraînement du modèle
    if st.button("Entraîner le modèle de Deep Learning"):
        epochs = 50
        for epoch in range(epochs):
            for inputs, labels in dataloader:
                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

            if (epoch + 1) % 10 == 0:
                st.write(f"Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}")

        st.success("Entraînement terminé!")

    # Évaluation du modèle
    if st.button("Évaluer le modèle"):
        model.eval()
        with torch.no_grad():
            correct = 0
            total = 0
            for inputs, labels in dataloader:
                outputs = model(inputs)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()

            accuracy = 100 * correct / total
            st.write(f"Précision du modèle: {accuracy:.2f}%")
