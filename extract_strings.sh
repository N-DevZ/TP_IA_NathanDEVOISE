#!/bin/bash

# Fonction pour extraire les chaînes de caractères d'un fichier
extract_strings() {
    grep -oP "(?<=')[^']+(?=')|(?<=\")[^\"]+(?=\")" "$1" | sort | uniq
}

# Chemin vers le répertoire src
SRC_DIR="$(dirname "$0")/src"

# Créer ou vider le fichier Strings.ini
> Strings.ini

# Parcourir tous les fichiers Python dans src et ses sous-dossiers
find "$SRC_DIR" -name "*.py" | while read -r file; do
    # Obtenir le chemin relatif et le convertir en nom de section
    relative_path="${file#$SRC_DIR/}"
    section_name="${relative_path%.py}"
    section_name="${section_name//\//.}"

    # Extraire les chaînes et les écrire dans Strings.ini
    strings=$(extract_strings "$file")
    if [ -n "$strings" ]; then
        echo "[$section_name]" >> Strings.ini
        i=1
        echo "$strings" | while read -r line; do
            echo "string_$i = $line" >> Strings.ini
            ((i++))
        done
        echo "" >> Strings.ini
    fi
done

echo "Strings.ini has been created successfully!"