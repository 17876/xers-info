# generating events for mongo db from old database.json
import json


def find_dict(list_of_dicts, key, value):
    """
    Returns the first dictionary in the list where dict[key] == value.
    If not found, returns None.
    """
    for d in list_of_dicts:
        if d.get(key) == value:
            return d
    return None


with open("../public/database.json", "r") as file:
    data = json.load(file)

projects_en = data['en']['projects']
projects_de = data['de']['projects']

projects = []

for project_key in projects_en:
    cur_project_en = projects_en[project_key]
    cur_project_de = projects_de[project_key]
    
    # dealing with media
    cur_media = []
    if cur_project_en['media'] !=0:
        for i in range(len(cur_project_en['media'])):
            cur_type = cur_project_en['media'][i]['type']
            if cur_type == 'img' or cur_type == 'youtube':
                if 'title' in cur_project_en['media'][i]:
                    cur_label = {
                    "en": cur_project_en['media'][i]['title'],
                    "de": cur_project_de['media'][i]['title']
                } 
                else:
                    cur_label = 0
                cur_media.append(
                    {
                    "type": cur_project_en['media'][i]['type'],
                    "label": cur_label,
                    "src": cur_project_en['media'][i]['src']
                    }
                )
            
            elif cur_type == 'gallery':
                if 'title' in cur_project_en['media'][i]:
                    cur_label = {
                    "en": cur_project_en['media'][i]['title'],
                    "de": cur_project_de['media'][i]['title']
                } 
                else:
                    cur_label = 0
                
                cur_media.append(
                    {
                    "type": cur_project_en['media'][i]['type'],
                    "label": cur_label,
                    "images": cur_project_en['media'][i]['images']
                    }
                )
                            
    else:
        cur_media = 0
    

    # dealing with meta
    cur_meta = {
        "title": {
            "en": cur_project_en['project_meta']['title'],
            "de": cur_project_de['project_meta']['title']
        },
        "items": []
    }
    
    cur_meta_list = []
    
    if cur_project_en['project_meta'] !=0:
        for i in range(len(cur_project_en['project_meta']['meta'])):
            cur_meta_dict_en = cur_project_en['project_meta']['meta'][i]
            cur_meta_type = cur_meta_dict_en['type']
            cur_meta_dict_de = find_dict(cur_project_de['project_meta']['meta'], 'type', cur_meta_type)     
            if cur_meta_type != 'link-list':
                cur_meta_list.append(
                    {
                        "type": cur_meta_dict_en['type'],
                        "label": {
                            "en": cur_meta_dict_en['name'],
                            "de": cur_meta_dict_de['name']
                        },
                        "value":{
                            "en": cur_meta_dict_en['value'],
                            "de": cur_meta_dict_de['value']
                        } 
                    }
                )
            else:
                cur_link_list = []
                for j in range(len(cur_meta_dict_en['links'])):
                    cur_link_list.append(
                        {
                        "text": {
                            "en": cur_meta_dict_en['links'][j]['text'],
                            "de": cur_meta_dict_de['links'][j]['text']
                        },
                        "src": cur_meta_dict_en['links'][j]['link']
                        }
                    )
                
                cur_meta_list.append(
                    {
                    "type": cur_meta_dict_en['type'],
                    "label": {
                        "en": cur_meta_dict_en['name'],
                        "de": cur_meta_dict_de['name']
                    },
                    "value": cur_link_list
                    }
                )
        cur_meta['items'] = cur_meta_list
    else:
        cur_meta = 0
    
    # generating slug
    cur_slug = cur_project_en['src'].split('/')[-1]
    cur_project = {
                    "_id": cur_project_en['id'],
                    "slug": cur_slug,
                    "src": cur_project_en['src'],
                    "img_src": cur_project_en['img_src'],
                    "icon_src": "/projects/echo_chamber/img/echo_chamber_logo.png",
                    "title": cur_project_en['title'],
                    "subtitle": {
                        "en": cur_project_en['subtitle'],
                        "de": cur_project_de['subtitle']
                    },
                    "description": {
                        "en": cur_project_en['description'],
                        "de": cur_project_de['description']
                    },
                    "categories": cur_project_en['categories'],
                    "media": cur_media,
                    "meta":  cur_meta
    }
    projects.append(cur_project)

with open("projects_.json", "w") as f:
    json.dump(projects, f, indent=4)
