#!/usr/bin/python
import re
f = open('dept_names.html')
s = f.read()
regex = re.compile('<OPTION\s\sVALUE=[^1]{51}')#<\\OPTION>')
m = regex.findall(s)
l = [x[21:] for x in m]
l1 = [(x[0:-4],x[-3:-1]) for x in l]
l2  = [(x[0:x.find('  ')], y) for (x, y) in l1]
d = dict(l2)
print d
