import requests
from bs4 import BeautifulSoup
import collections
import re

def decodeMessage(url):
    resp = requests.get(url)
    od = collections.OrderedDict()
    if resp.ok:
        Parse = BeautifulSoup(resp.text, features="html.parser")
        i = 0
        for tag in Parse.find_all('tr'):
            if i == 0:
                i = i + 1
                continue
            else:
                coords = re.split("[^0-9]", tag.text)
                char = re.findall("[^0-9]", tag.text)
                if(int(coords[1]) not in od):
                    od[int(coords[1])] = {}
                od[int(coords[1])][int(coords[0])] = char[0]
        od = sorted(od.items(), key=lambda x: x[0], reverse=True)
        for item in od:
            a = sorted(item[1].items(), key=lambda x: x[0])
            i = 0
            line = ""
            while i < len(a):
                j = 0
                if(i != 0):
                    while j < (a[i][0]-1)-a[i-1][0]:
                        line+=" "
                        j+=1
                    line+="{}".format(a[i][1])
                else:
                    line+="{}".format(a[i][1])
                i+=1
            print(line)
    else:
        print ("Error: {}".format(resp.status_code))
        print (resp.text)

decodeMessage("https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub")
