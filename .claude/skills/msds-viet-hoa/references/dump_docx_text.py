import sys,zipfile,re
z=zipfile.ZipFile(sys.argv[1]); x=z.read('word/document.xml').decode('utf8')
x=re.sub(r'<mc:Fallback>.*?</mc:Fallback>','',x,flags=re.S)
out=[]
for p in re.findall(r'<w:p[ >].*?</w:p>',x,flags=re.S):
    t=''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>',p))
    red='EE0000' in p
    if t.strip(): out.append(('[R] ' if red else '')+t)
print('\n'.join(out))
