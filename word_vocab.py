import json
from wordfreq import top_n_list

words = [w for w in top_n_list("en", 1000) if w.isalpha()]

with open("./Typing-speed-test/public/english-top-1000.json", "w", encoding = "utf-8") as f:
    json.dump(words, f, ensure_ascii = False, indent = 2)