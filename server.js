const express = require('express');
const path = require('path');
const open = require('open');
const app = express();

// Servir les fichiers statiques du build React
app.use(express.static(path.join(__dirname, 'build')));

// Toutes les requêtes non API seront redirigées vers index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
  
  // Ouvrir le navigateur par défaut
  open(`http://localhost:${port}`).catch(() => {
    console.log('Impossible d\'ouvrir le navigateur automatiquement. Veuillez ouvrir manuellement http://localhost:3000');
  });
});

// Gérer la fermeture propre du serveur
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});