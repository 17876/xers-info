# generating events for mongo db from old database.json
import json
with open("../deprecated/database.json", "r") as file:
    data = json.load(file)

events_en = data['en']['events']['events']  #list of objects
events_de = data['de']['events']['events']  #list of objects

events = []

for i in range(len(events_en)):
    cur_event_en = events_en[i]
    cur_event_de = events_de[i]
    # dealing with collab
    cur_collab = {}
    if cur_event_en['collab']:
        cur_label = {
                    "en": cur_event_en['collab']['text'],
                    "de": cur_event_de['collab']['text']
                    }
        cur_value = []
        for i in range(len(cur_event_de['collab']['who'])):
            cur_value.append(f"[{cur_event_en['collab']['who'][i]['name']}]({cur_event_en['collab']['who'][i]['link']})")
            
        cur_collab = {
            "label": cur_label,
            "value": cur_value
        }
    else:
        cur_collab = None
    
    cur_id = cur_event_en['id']
    cur_past = cur_event_en['past']

    cur_datetime = {}
    if cur_event_en['datetime']:
        cur_datetime = {
                        "en": cur_event_en['datetime'],
                        "de":cur_event_de['datetime']
                    }
    else:
        cur_datetime = None
    
    cur_venue = {}
    if cur_event_en['venue']:
        cur_venue = {
                        "en": cur_event_en['venue'],
                        "de":cur_event_de['venue']
                    }
    else:
        cur_venue = None

    cut_title = ""
    if cur_event_en['project-link'] != "":
        cut_title = f"[{cur_event_en['title']}]({cur_event_en['project-link']})"
    else:
        cut_title = cur_event_en['title']
    
    cur_subtitle = {}
    if cur_event_en['subtitle']:
        cur_subtitle = {
                        "en": cur_event_en['subtitle'],
                        "de":cur_event_de['subtitle']
                    }
    else:
        cur_subtitle = None
    
    cur_description = {}
    if cur_event_en['description']:
        cur_description = {
                        "en": cur_event_en['description'],
                        "de":cur_event_de['description']
                    }
    else:
        cur_description = None

    cur_extra = {}
    if cur_event_en['extra']:
        cur_extra = {
                        "en": cur_event_en['extra'],
                        "de":cur_event_de['extra']
                    }
    else:
        cur_extra = None
    
    cur_event = {
                    "_id": cur_id,
                    "past": cur_past,
                    "title": cut_title,
                    "subtitle": cur_subtitle,
                    "datetime": cur_datetime,
                    "venue": cur_venue,
                    "collab": cur_collab,
                    "description": cur_description,
                    "extra": cur_extra
    }

    events.append(cur_event)

with open("events.json", "w") as f:
    json.dump(events, f, indent=4)
