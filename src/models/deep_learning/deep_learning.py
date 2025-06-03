import streamlit as st
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
from configparser import ConfigParser
import os

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
        "train_deep_learning": "Entraîner le modèle de Deep Learning",
        "epoch_progress": "Époque {epoch}/{epochs}, Perte: {loss:.4f}",
        "training_complete": "Entraînement terminé !",
        "evaluate_model": "Évaluer le modèle",
        "model_accuracy": "Précision du modèle: {accuracy:.2f}%",
    }


def run_deep_learning(data):
    st.title(strings["deep_learning_title"])

    X = data.drop([strings["target"], strings["target_encoded"]], axis=1)
    y = data[strings["target_encoded"]]

    X_tensor = torch.FloatTensor(X.values)
    y_tensor = torch.LongTensor(y.values)

    dataset = TensorDataset(X_tensor, y_tensor)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

    class WineNet(nn.Module):
        def __init__(self, input_size):
            super(WineNet, self).__init__()
            self.fc1 = nn.Linear(input_size, 64)
            self.fc2 = nn.Linear(64, 32)
            self.fc3 = nn.Linear(32, 3)

        def forward(self, x):
            x = torch.relu(self.fc1(x))
            x = torch.relu(self.fc2(x))
            x = self.fc3(x)
            return x

    model = WineNet(X.shape[1])
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters())

    if st.button(strings["train_deep_learning"]):
        epochs = 50
        for epoch in range(epochs):
            for inputs, labels in dataloader:
                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

            if (epoch + 1) % 10 == 0:
                st.write(
                    strings["epoch_progress"].format(
                        epoch=epoch, epochs=epochs, loss=loss
                    )
                )

        st.success(strings["training_complete"])

    if st.button(strings["evaluate_model"]):
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
            st.write(strings["model_accuracy"].format(accuracy=accuracy))
