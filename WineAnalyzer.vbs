Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strPath

' Exécute le script PowerShell pour créer le raccourci
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -File """ & strPath & "\app.ps1""", 0, True

' Vérifie si le raccourci a été créé
If fso.FileExists(strPath & "\Wine Analyzer.lnk") Then
    ' Lance l'application via le raccourci
    WshShell.Run chr(34) & strPath & "\Wine Analyzer.lnk" & Chr(34), 0, False
Else
    ' Si le raccourci n'existe pas, lance directement le fichier batch
    WshShell.Run chr(34) & strPath & "\launch_wine_analysis.bat" & Chr(34), 0, False
End If

Set WshShell = Nothing
Set fso = Nothing