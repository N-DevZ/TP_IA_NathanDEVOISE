import ast
import os
from configparser import ConfigParser

config = ConfigParser()
config.read("Strings.ini")
strings = config["documentation_technique.generate_docs"]


def generate_documentation():
    project_dir = os.path.abspath(os.path.dirname(__file__))
    docs_dir = os.path.join(project_dir, strings["docs_dir"])
    src_dir = os.path.join(project_dir, strings["src_dir"])

    os.makedirs(docs_dir, exist_ok=True)

    with open(
        os.path.join(docs_dir, strings["css_file"]),
        strings["write_mode"],
        encoding=strings["utf8_encoding"],
    ) as css_file:
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

    excluded_files = {
        strings["generate_docs_file"],
        strings["app_file"],
        strings["src_app_file"],
    }

    python_files = [
        f
        for f in os.listdir(project_dir)
        if f.endswith(strings["py_extension"]) and f not in excluded_files
    ]

    if os.path.exists(src_dir):
        python_files += [
            os.path.join(strings["src_prefix"], f)
            for f in os.listdir(src_dir)
            if f.endswith(strings["py_extension"])
            and strings["src_file_pattern"].format(f=f) not in excluded_files
        ]

    python_files = list(set(python_files))

    for file in python_files:
        if file.startswith(strings["src_prefix"]) or file.startswith(
            strings["src_backslash"]
        ):
            module_name = (
                file[4:-3]
                .replace(strings["forward_slash"], strings["dot"])
                .replace(strings["backslash"], strings["dot"])
            )
            file_name = f"{module_name}.html"
        else:
            module_name = (
                file[:-3]
                .replace(strings["forward_slash"], strings["dot"])
                .replace(strings["backslash"], strings["dot"])
            )
            file_name = f"{module_name}.html"

        file_path = os.path.join(project_dir, file)

        with open(
            file_path, strings["read_mode"], encoding=strings["utf8_encoding"]
        ) as source_file:
            node = ast.parse(source_file.read())

        with open(
            os.path.join(docs_dir, file_name),
            strings["write_mode"],
            encoding=strings["utf8_encoding"],
        ) as f:
            f.write(
                f"""
                <!DOCTYPE html>
                <html lang="{strings['lang_code']}">
                <head>
                    <meta charset="{strings['utf8_charset']}">
                    <meta name="{strings['viewport_meta']}" content="{strings['viewport_content']}">
                    <title>Documentation - {module_name}</title>
                    <link rel="{strings['stylesheet_link']}" href="{strings['css_file']}">
                </head>
                <body>
                <h1>Module: {module_name}</h1>
            """
            )

            module_docstring = ast.get_docstring(node)
            if module_docstring:
                f.write(
                    strings["module_description"].format(
                        module_docstring=module_docstring
                    )
                )

            f.write(strings["module_content"])

            f.write(strings["imports_header"])
            for item in node.body:
                if isinstance(item, ast.Import):
                    for name in item.names:
                        f.write(strings["import_item"].format(name=name))
                elif isinstance(item, ast.ImportFrom):
                    names = strings["comma"].join(name.name for name in item.names)
                    f.write(strings["import_from"].format(item=item, names=names))
            f.write(strings["ul_close"])

            for item in node.body:
                if isinstance(item, (ast.FunctionDef, ast.ClassDef)):
                    f.write(strings["item_header"].format(item=item))
                    docstring = ast.get_docstring(item)
                    if docstring:
                        f.write(strings["description_header"].format(docstring))

                    if isinstance(item, ast.FunctionDef):
                        f.write(strings["arguments_header"])
                        for arg in item.args.args:
                            f.write(strings["argument_item"].format(arg=arg))
                        f.write(strings["ul_close"])

                        f.write(strings["function_content"])
                        for stmt in item.body:
                            if isinstance(stmt, ast.If):
                                f.write(
                                    strings["if_statement"].format(
                                        ast.unparse(stmt.test)
                                    )
                                )
                                for substmt in stmt.body:
                                    f.write(
                                        strings["unparse_substmt"].format(
                                            ast.unparse(substmt)
                                        )
                                    )
                                if stmt.orelse:
                                    f.write(strings["else_statement"])
                                    for substmt in stmt.orelse:
                                        f.write(
                                            strings["unparse_substmt"].format(
                                                ast.unparse(substmt)
                                            )
                                        )
                            else:
                                f.write(
                                    strings["unparse_stmt"].format(ast.unparse(stmt))
                                )
                        f.write(strings["pre_close"])

                    if isinstance(item, ast.ClassDef):
                        f.write(strings["methods_header"])
                        for method in item.body:
                            if isinstance(
                                method, ast.FunctionDef
                            ) and not method.name.startswith(strings["underscore"]):
                                f.write(strings["method_name"].format(method=method))
                                method_doc = ast.get_docstring(method)
                                if method_doc:
                                    f.write(
                                        strings["description_subheader"].format(
                                            method_doc
                                        )
                                    )
                                f.write(strings["arguments_subheader"])
                                for arg in method.args.args:
                                    if arg.arg != strings["self_param"]:
                                        f.write(
                                            strings["argument_item"].format(arg=arg)
                                        )
                                f.write(strings["ul_close"])

            f.write(strings["html_close"])

    with open(
        os.path.join(docs_dir, strings["index_file"]),
        strings["write_mode"],
        encoding=strings["utf8_encoding"],
    ) as f:
        f.write(
            f"""
            <!DOCTYPE html>
            <html lang="{strings['lang_code']}">
            <head>
                <meta charset="{strings['utf8_charset']}">
                <meta name="{strings['viewport_meta']}" content="{strings['viewport_content']}">
                <title>Documentation du Projet ML - Analyse de Vin</title>
                <link rel="{strings['stylesheet_link']}" href="{strings['css_file']}">
            </head>
            <body>
            <h1>Documentation du Projet ML - Analyse de Vin</h1>
            <h2>Modules du projet</h2>
            <ul>
        """
        )
        for file in python_files:
            if file.startswith(strings["src_prefix"]) or file.startswith(
                strings["src_backslash"]
            ):
                module_name = (
                    file[4:-3]
                    .replace(strings["forward_slash"], strings["dot"])
                    .replace(strings["backslash"], strings["dot"])
                )
            else:
                module_name = (
                    file[:-3]
                    .replace(strings["forward_slash"], strings["dot"])
                    .replace(strings["backslash"], strings["dot"])
                )
            f.write(strings["module_link"].format(module_name=module_name))
        f.write(strings["ul_body_close"])

    print(strings["docs_generated"].format(docs_dir=docs_dir))


if __name__ == strings["main_module"]:
    generate_documentation()
