#!/usr/bin/python
import re
def parse(file):
    f = open(file)
    s = f.read()
    regex = re.compile('<OPTION\s\sVALUE=[^$]{51}')#<\\OPTION>')
    m = regex.findall(s)
    l = [x[21:] for x in m]
    l1 = [(x[0:-4],x[-3:-1]) for x in l]
    l2 = [(x[0:x.find('  ')].lower(), y) for (x, y) in l1]
    l3 = []
    ignore = ['the', 'on', 'at', 'with', 'in', 'as', 'for', 'through',
              'of', 'his', 'a', 'and', 'an', 'or', 'to', 'from']
    LARGE_NUM = 720*7*8 #Can handle upto 8 words in the title
    for (x, y) in l2:
        s1 = (x.replace(':', ' ')).replace('&', '')
        s2 = (s1.replace('(', '')).replace(')', '')
        s3 = s2.replace('-', ' ')
        def removeSp(s):
            if(s == ' ' or s == '' or s in ignore):
                return False
            else :
                return True
        l4 = filter(removeSp, (s3.split(' ')));
        size = len(l4)
        l5 = [(n, [[y, LARGE_NUM/size]]) for n in l4]
        l3 += l5
    l3.sort()
    l6 = []
    temp = [l3[0][0], l3[0][1]]
    for i in range(len(l3))[1:]:
        if((l3[i])[0] == temp[0]):
            temp[1] += l3[i][1]
        else :
            rdup = []
            temp[1].sort()
            elem = temp[1][0]
            for j in temp[1][1:]:
                if(j[0] != elem[0]):
                    rdup.append(elem)
                    elem = j
            rdup.append(elem)
            l6.append((temp[0], rdup))
            temp = [l3[i][0], l3[i][1]]
        l6.append(temp)
    return dict(l6)

d = parse('dept_names.html')
print d
