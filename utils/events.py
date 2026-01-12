# generating events for mongo db from old database.json
import json
with open("../public/database.json", "r") as file:
    data = json.load(file)

events_en = data['en']['events']['events']  #list of objects
events_de = data['de']['events']['events']  #list of objects

events = []

for i in range(len(events_en)):
    cur_event_en = events_en[i]
    cur_event_de = events_de[i]
    # dealing with collab
    cur_collab = {}
    if cur_event_en['collab'] !=0:
        cur_text = {
                    "en": cur_event_en['collab']['text'],
                    "de": cur_event_de['collab']['text']
                    }
        cur_who = []
        for i in range(len(cur_event_de['collab']['who'])):
            cur_who.append(
                {
                "name": cur_event_en['collab']['who'][i]['name'],
                "link": cur_event_en['collab']['who'][i]['link']
                } 
            )
        cur_collab = {
            "text": cur_text,
            "who": cur_who
        }
    else:
        cur_collab = 0
        
    cur_event = {
                    "_id": cur_event_en['id'],
                    "past": cur_event_en['past'],
                    "datetime": {
                        "en": cur_event_en['datetime'],
                        "de":cur_event_de['datetime']
                    },
                    "venue": {
                        "en": cur_event_en['venue'],
                        "de":cur_event_de['venue']
                    },
                    "title": cur_event_en['title'],
                    "subtitle": {
                        "en": cur_event_en['subtitle'],
                        "de":cur_event_de['subtitle']
                    },
                    "projectLink": cur_event_en['project-link'],
                    "collab": cur_collab,
                    "description": {
                        "en": cur_event_en['description'],
                        "de":cur_event_de['description']
                    },
                    "extra": {
                        "en": cur_event_en['extra'],
                        "de":cur_event_de['extra']
                     },
                    "link": cur_event_en['link']
    }
    events.append(cur_event)

with open("events.json", "w") as f:
    json.dump(events, f, indent=4)
