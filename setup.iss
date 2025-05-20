[Setup]
AppName=MiloSIPJS
AppVersion=1.0
DefaultDirName={pf}\MiloSIPJS
OutputDir=C:\Users\idrys\Downloads\Nathan\MiloSIPJS\Output
OutputBaseFilename=MiloSIPInstaller
Compression=lzma
SolidCompression=yes

[Files]
Source: "C:\Users\idrys\Downloads\Nathan\MiloSIPJS\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{group}\MiloSIPJS"; Filename: "{app}\MiloSIP.exe"
