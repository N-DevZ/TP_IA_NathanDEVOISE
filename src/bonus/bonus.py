import streamlit as st
from lazypredict.Supervised import LazyClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.linear_model import LogisticRegression
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
from configparser import ConfigParser
import os

config = ConfigParser()
config.read(
    os.path.join(os.path.dirname(__file__), "..", "Strings.ini"), encoding="utf-8"
)
strings = config["bonus"]


def run_bonus(X_train, X_test, y_train, y_test, features):
    st.title(strings["bonus_features"])

    if st.checkbox(strings["run_lazy_predict"]):
        clf = LazyClassifier(verbose=0, ignore_warnings=True, custom_metric=None)
        models, predictions = clf.fit(X_train, X_test, y_train, y_test)
        st.write(models)

    if st.checkbox(strings["run_gridsearch"]):
        param_grid = {"C": [0.1, 1, 10], "penalty": ["l2"]}
        grid_search = GridSearchCV(LogisticRegression(solver="lbfgs"), param_grid, cv=5)
        grid_search.fit(X_train, y_train)
        st.write(strings["best_params"], grid_search.best_params_)
        st.write(strings["best_score"], grid_search.best_score_)

    if st.checkbox(strings["train_deep_learning"]):
        run_deep_learning(X_train, y_train, features)


def run_deep_learning(X_train, y_train, features):
    class WineNet(nn.Module):
        def __init__(self, input_dim):
            super(WineNet, self).__init__()
            self.fc1 = nn.Linear(input_dim, 64)
            self.relu1 = nn.ReLU()
            self.fc2 = nn.Linear(64, 32)
            self.relu2 = nn.ReLU()
            self.fc3 = nn.Linear(32, 3)

        def forward(self, x):
            x = self.relu1(self.fc1(x))
            x = self.relu2(self.fc2(x))
            x = self.fc3(x)
            return x

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    X_train_t = torch.tensor(X_train.values, dtype=torch.float32).to(device)
    y_train_t = torch.tensor(y_train.values, dtype=torch.long).to(device)
    dataset = TensorDataset(X_train_t, y_train_t)
    loader = DataLoader(dataset, batch_size=32, shuffle=True)
    model = WineNet(len(features)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    epochs = 50
    loss_history = []
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for inputs, labels in loader:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        loss_history.append(running_loss / len(loader))

    st.line_chart(loss_history)
    st.success(strings["deep_learning_trained"])
