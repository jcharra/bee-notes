import json 

files = ['./de.json', './en.json']

i18n = {}
for file in files:
  with open(file) as f:
    i18n[file] = json.load(f)

for i18n_file, trans in i18n.items():
  for area, items in trans.items():
    for i in items:
      for other_i18n, other_trans in i18n.items():
        if not other_trans.get(area):
          print("Area {} missing in {}".format(area, other_i18n))
          continue
        
        if not other_trans[area].get(i):
          print("Item {}.{} missing in {}".format(area, i, other_i18n))