#!/usr/bin/python
import re
def parse(file):
    f = open(file)
    s = f.read()
    regex = re.compile('<OPTION\s\sVALUE=[^1]{51}')#<\\OPTION>')
    m = regex.findall(s)
    l = [x[21:] for x in m]
    l1 = [(x[0:-4],x[-3:-1]) for x in l]
    l2  = [(x[0:x.find('  ')], y) for (x, y) in l1]
    return dict(l2)

d = parse('dept_names.html')
print d
