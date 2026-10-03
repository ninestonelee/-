"""Convert the generated workbook .docx (docx-js output) into print-ready HTML.
Handles only the constructs build.js emits: paragraphs, runs, headings, numbering,
bottom-border writing lines, tables with grid widths/shading/spans, page breaks."""
import sys, zipfile, html
import xml.etree.ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
def q(tag): return W + tag
def attr(el, name): return el.get(q(name)) if el is not None else None

src, out, fontdir = sys.argv[1], sys.argv[2], sys.argv[3]
z = zipfile.ZipFile(src)
doc = ET.fromstring(z.read('word/document.xml'))
num_xml = ET.fromstring(z.read('word/numbering.xml')) if 'word/numbering.xml' in z.namelist() else None

# numId -> ('bullet'|'decimal')
num_format = {}
if num_xml is not None:
    abstract = {}
    for a in num_xml.findall(q('abstractNum')):
        lvl = a.find(q('lvl'))
        fmt = attr(lvl.find(q('numFmt')), 'val') if lvl is not None else 'bullet'
        abstract[attr(a, 'abstractNumId')] = fmt
    for n in num_xml.findall(q('num')):
        num_format[attr(n, 'numId')] = abstract.get(attr(n.find(q('abstractNumId')), 'val'), 'bullet')

def twips_pt(v): return int(v) / 20.0

def render_runs(p):
    parts = []
    for r in p.findall(q('r')):
        rpr = r.find(q('rPr'))
        style = []
        if rpr is not None:
            b = rpr.find(q('b'))
            if b is not None and attr(b, 'val') not in ('false', '0'): style.append('font-weight:700')
            i = rpr.find(q('i'))
            if i is not None and attr(i, 'val') not in ('false', '0'): style.append('font-style:italic')
            c = rpr.find(q('color'))
            if c is not None and attr(c, 'val') not in (None, 'auto'): style.append('color:#' + attr(c, 'val'))
            sz = rpr.find(q('sz'))
            if sz is not None: style.append('font-size:%.1fpt' % (int(attr(sz, 'val')) / 2))
        text = ''
        for child in r:
            if child.tag == q('t'):
                t = child.text or ''
                text += '&nbsp;' if t and not t.strip() else html.escape(t)
            elif child.tag == q('br') and attr(child, 'type') == 'page': return '__PAGEBREAK__'
            elif child.tag == q('tab'): text += '&emsp;'
        parts.append('<span style="%s">%s</span>' % (';'.join(style), text) if style else text)
    return ''.join(parts)

def render_p(p, in_cell=False):
    ppr = p.find(q('pPr'))
    inner = render_runs(p)
    if inner == '__PAGEBREAK__': return '<div class="pb"></div>'
    cls, style = [], []
    tag = 'p'
    if ppr is not None:
        ps = ppr.find(q('pStyle'))
        if ps is not None:
            s = attr(ps, 'val')
            if s == 'Heading1': tag = 'h1'
            elif s == 'Heading2': tag = 'h2'
            elif s == 'Heading3': tag = 'h3'
        jc = ppr.find(q('jc'))
        if jc is not None:
            v = attr(jc, 'val')
            style.append('text-align:' + ('center' if v in ('center', 'both') else v))
        sp = ppr.find(q('spacing'))
        if sp is not None:
            if attr(sp, 'before'): style.append('margin-top:%.1fpt' % twips_pt(attr(sp, 'before')))
            if attr(sp, 'after'): style.append('margin-bottom:%.1fpt' % twips_pt(attr(sp, 'after')))
            if attr(sp, 'line'): style.append('line-height:%.1fpt' % twips_pt(attr(sp, 'line')) if tag == 'p' else '')
        bdr = ppr.find(q('pBdr'))
        if bdr is not None:
            b = bdr.find(q('bottom'))
            if b is not None:
                v = attr(b, 'val')
                if v == 'dotted': cls.append('wline')
                elif tag == 'h1': pass
                else: style.append('border-bottom:1.5pt solid #1F3864;padding-bottom:3pt')
        npr = ppr.find(q('numPr'))
        if npr is not None:
            nid = attr(npr.find(q('numId')), 'val')
            fmt = num_format.get(nid, 'bullet')
            cls.append('li-' + ('bul' if fmt == 'bullet' else 'num'))
            cls.append('n' + nid)
    if not inner.strip(): inner = '&nbsp;'
    return '<%s class="%s" style="%s">%s</%s>' % (tag, ' '.join(cls), ';'.join(s for s in style if s), inner, tag)

def render_tbl(t):
    grid = [int(attr(g, 'w')) for g in t.findall(q('tblGrid') + '/' + q('gridCol'))]
    total = sum(grid) or 1
    cols = ''.join('<col style="width:%.2f%%">' % (g * 100.0 / total) for g in grid)
    rows_html, header_html = [], []
    for tr in t.findall(q('tr')):
        trpr = tr.find(q('trPr'))
        th = trpr.find(q('tblHeader')) if trpr is not None else None
        is_header = th is not None and attr(th, 'val') not in ('false', '0')
        cells = []
        for tc in tr.findall(q('tc')):
            tcpr = tc.find(q('tcPr'))
            st, span = [], ''
            if tcpr is not None:
                shd = tcpr.find(q('shd'))
                if shd is not None and attr(shd, 'fill') not in (None, 'auto', 'FFFFFF'): st.append('background:#' + attr(shd, 'fill'))
                gs = tcpr.find(q('gridSpan'))
                if gs is not None: span = ' colspan="%s"' % attr(gs, 'val')
                bd = tcpr.find(q('tcBorders'))
                if bd is not None:
                    top = bd.find(q('top'))
                    if top is not None and attr(top, 'val') in ('nil', 'none'): st.append('border:none')
            body = ''.join(render_p(p, True) for p in tc.findall(q('p')))
            cells.append('<td%s style="%s">%s</td>' % (span, ';'.join(st), body))
        row = '<tr>' + ''.join(cells) + '</tr>'
        (header_html if is_header else rows_html).append(row)
    return '<table><colgroup>%s</colgroup>%s<tbody>%s</tbody></table>' % (
        cols, '<thead>' + ''.join(header_html) + '</thead>' if header_html else '', ''.join(rows_html))

body = doc.find(q('body'))
chunks = []
for el in body:
    if el.tag == q('p'): chunks.append(render_p(el))
    elif el.tag == q('tbl'): chunks.append(render_tbl(el))

# Running header text
hdr = '2027학년도 특목고 자기소개서 자습서  |  대일외고 중국어과'

css = """
@font-face { font-family: 'NotoKR'; src: url('file://%(f)s/NotoSansKR-Regular.ttf'); font-weight: 400; }
@font-face { font-family: 'NotoKR'; src: url('file://%(f)s/NotoSansKR-Bold.ttf'); font-weight: 700; }
@page { size: A4; margin: 20mm 20mm 18mm 20mm;
  @top-right { content: '%(h)s'; font-family: 'NotoKR'; font-size: 8pt; color: #808080; }
  @bottom-center { content: counter(page); font-family: 'NotoKR'; font-size: 8pt; color: #808080; } }
html, body { margin: 0; padding: 0; }
body { font-family: 'NotoKR', 'Malgun Gothic', sans-serif; font-size: 10pt; color: #000; word-break: keep-all; }
p { margin: 3pt 0; line-height: 15pt; }
h1 { font-size: 17pt; color: #1F3864; margin: 10pt 0 8pt; border-bottom: 1.5pt solid #1F3864; padding-bottom: 3pt; }
h2 { font-size: 13pt; color: #1F3864; margin: 12pt 0 5pt; }
h3 { font-size: 11pt; margin: 8pt 0 3pt; }
h1, h2, h3 { page-break-after: avoid; }
.pb { page-break-after: always; height: 0; }
.wline { border-bottom: 1.2pt dotted #7F7F7F; height: 24pt; line-height: 24pt !important; margin: 0 !important; }
.li-bul { margin-left: 24pt; position: relative; }
.li-bul::before { content: '•'; position: absolute; left: -12pt; }
.li-num { margin-left: 24pt; position: relative; counter-increment: item; }
.li-num::before { content: counter(item) '.'; position: absolute; left: -15pt; }
h2 { counter-reset: item; }
table { width: 100%%; border-collapse: collapse; table-layout: fixed; margin: 4pt 0; }
td { border: 0.5pt solid #808080; padding: 3pt 5pt; vertical-align: top; font-size: 9.5pt; }
td p { line-height: 14pt; margin: 2pt 0; }
td .wline { height: 22pt; line-height: 22pt !important; }
thead td { background: #E7E6E6; font-weight: 700; }
tr { page-break-inside: avoid; }
thead { display: table-header-group; }
""" % {'f': fontdir, 'h': hdr}

with open(out, 'w', encoding='utf-8') as f:
    f.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>자습서</title><style>%s</style></head><body>%s</body></html>' % (css, ''.join(chunks)))
print('html written', out, len(chunks), 'blocks')
