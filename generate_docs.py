import os
import ast


def generate_documentation():
    project_dir = os.path.abspath(os.path.dirname(__file__))
    docs_dir = os.path.join(project_dir, "docs")
    src_dir = os.path.join(project_dir, "src")

    os.makedirs(docs_dir, exist_ok=True)

    # Générer le fichier CSS
    with open(os.path.join(docs_dir, "style.css"), "w", encoding="utf-8") as css_file:
        css_file.write(
            """
            body {
                font-family: Arial, sans-serif;
                background-color: #1e1e1e;
                color: #ffffff;
                line-height: 1.6;
                padding: 20px;
            }
            h1, h2, h3, h4, h5, h6 {
                color: #4ec9b0;
            }
            pre {
                background-color: #252526;
                padding: 10px;
                border-radius: 5px;
            }
            a {
                color: #569cd6;
            }
            code {
                background-color: #252526;
                padding: 2px 4px;
                border-radius: 3px;
            }
        """
        )

    excluded_files = {"generate_docs.py", "app.py", "src/app.py"}

    # Fichiers à la racine
    python_files = [
        f
        for f in os.listdir(project_dir)
        if f.endswith(".py") and f not in excluded_files
    ]

    # Fichiers dans src/
    if os.path.exists(src_dir):
        python_files += [
            os.path.join("src", f)
            for f in os.listdir(src_dir)
            if f.endswith(".py") and f"src/{f}" not in excluded_files
        ]

    python_files = list(set(python_files))  # Supprimer les doublons

    for file in python_files:
        if file.startswith("src/") or file.startswith("src\\"):
            module_name = file[4:-3].replace("/", ".").replace("\\", ".")
            file_name = f"{module_name}.html"
        else:
            module_name = file[:-3].replace("/", ".").replace("\\", ".")
            file_name = f"{module_name}.html"

        file_path = os.path.join(project_dir, file)

        with open(file_path, "r", encoding="utf-8") as source_file:
            node = ast.parse(source_file.read())

        with open(os.path.join(docs_dir, file_name), "w", encoding="utf-8") as f:
            f.write(
                f"""
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Documentation - {module_name}</title>
                    <link rel="stylesheet" href="style.css">
                </head>
                <body>
                <h1>Module: {module_name}</h1>
            """
            )

            module_docstring = ast.get_docstring(node)
            if module_docstring:
                f.write(f"<h2>Description du module</h2>\n<p>{module_docstring}</p>\n")

            f.write("<h2>Contenu du module</h2>\n")

            # Ajouter une section pour les imports
            f.write("<h3>Imports</h3>\n<ul>\n")
            for item in node.body:
                if isinstance(item, ast.Import):
                    for name in item.names:
                        f.write(f"<li><code>import {name.name}</code></li>\n")
                elif isinstance(item, ast.ImportFrom):
                    names = ", ".join(name.name for name in item.names)
                    f.write(
                        f"<li><code>from {item.module} import {names}</code></li>\n"
                    )
            f.write("</ul>\n")

            for item in node.body:
                if isinstance(item, (ast.FunctionDef, ast.ClassDef)):
                    f.write(f"<h3>{item.__class__.__name__}: {item.name}</h3>\n")
                    docstring = ast.get_docstring(item)
                    if docstring:
                        f.write(
                            "<h4>Description</h4>\n<pre>{}</pre>\n".format(docstring)
                        )

                    if isinstance(item, ast.FunctionDef):
                        f.write("<h4>Arguments</h4>\n<ul>\n")
                        for arg in item.args.args:
                            f.write(f"<li><code>{arg.arg}</code></li>\n")
                        f.write("</ul>\n")

                        # Ajouter une description détaillée du contenu de la fonction
                        f.write("<h4>Contenu de la fonction</h4>\n<pre>\n")
                        for stmt in item.body:
                            if isinstance(stmt, ast.If):
                                f.write(f"Si {ast.unparse(stmt.test)}:\n")
                                for substmt in stmt.body:
                                    f.write(f"    {ast.unparse(substmt)}\n")
                                if stmt.orelse:
                                    f.write("Sinon:\n")
                                    for substmt in stmt.orelse:
                                        f.write(f"    {ast.unparse(substmt)}\n")
                            else:
                                f.write(f"{ast.unparse(stmt)}\n")
                        f.write("</pre>\n")

                    if isinstance(item, ast.ClassDef):
                        f.write("<h4>Méthodes</h4>\n")
                        for method in item.body:
                            if isinstance(
                                method, ast.FunctionDef
                            ) and not method.name.startswith("_"):
                                f.write(f"<h5>{method.name}</h5>\n")
                                method_doc = ast.get_docstring(method)
                                if method_doc:
                                    f.write(
                                        "<h6>Description</h6>\n<pre>{}</pre>\n".format(
                                            method_doc
                                        )
                                    )
                                f.write("<h6>Arguments</h6>\n<ul>\n")
                                for arg in method.args.args:
                                    if arg.arg != "self":
                                        f.write(f"<li><code>{arg.arg}</code></li>\n")
                                f.write("</ul>\n")

            f.write("</body></html>")

    # Page index
    with open(os.path.join(docs_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(
            """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Documentation du Projet ML - Analyse de Vin</title>
                <link rel="stylesheet" href="style.css">
            </head>
            <body>
            <h1>Documentation du Projet ML - Analyse de Vin</h1>
            <h2>Modules du projet</h2>
            <ul>
        """
        )
        for file in python_files:
            if file.startswith("src/") or file.startswith("src\\"):
                module_name = file[4:-3].replace("/", ".").replace("\\", ".")
            else:
                module_name = file[:-3].replace("/", ".").replace("\\", ".")
            f.write(f'<li><a href="{module_name}.html">{module_name}</a></li>\n')
        f.write("</ul>\n</body></html>")

    print(f"✅ Documentation générée dans : {docs_dir}")


if __name__ == "__main__":
    generate_documentation()
