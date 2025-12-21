import os

# Pokemon exclusifs à Ultra Soleil (retirer 'um')
ultra_sun_exclusives = [
    '138', '139', '228', '229', '243', '250', '347', '348', '381', '383',
    '408', '409', '483', '485', '546', '547', '564', '565', '622', '623',
    '627', '628', '641', '643', '692', '693', '696', '697', '716', '766',
    '776', '791', '794', '798', '806'
]

# Pokemon exclusifs à Ultra Lune (retirer 'us')
ultra_moon_exclusives = [
    '140', '141', '309', '310', '244', '249', '345', '346', '380', '382',
    '410', '411', '484', '486', '548', '549', '566', '567', '343', '344',
    '629', '630', '642', '644', '690', '691', '698', '699', '717', '765',
    '780', '792', '795', '797', '805'
]

file_path = r'c:\Users\omega\Documents\Xalarian-Dev\PokeTracker\data\games.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    stripped = line.strip()
    
    # Vérifier les exclusifs Ultra Soleil (retirer 'um')
    for id in ultra_sun_exclusives:
        if stripped.startswith(f"'{id}': ["):
            if "'um'" in line:
                # Retirer 'um' de la liste
                line = line.replace(", 'um'", "")
                line = line.replace("'um', ", "")
                line = line.replace("'um'", "")
            break
    
    # Vérifier les exclusifs Ultra Lune (retirer 'us')
    for id in ultra_moon_exclusives:
        if stripped.startswith(f"'{id}': ["):
            if "'us'" in line:
                # Retirer 'us' de la liste
                line = line.replace(", 'us'", "")
                line = line.replace("'us', ", "")
                line = line.replace("'us'", "")
            break
    
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Done updating version exclusives!')
