from html.parser import HTMLParser
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
page = root / '.dev/privacy-site/privacidade/index.html'

class PolicyParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.labels = []
        self.h1 = 0
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        assert tag not in ('script', 'iframe', 'form', 'img'), tag
        assert not any(k.startswith('on') for k in values), 'inline event'
        if tag == 'html':
            assert values.get('lang') == 'pt-BR'
        if tag == 'h1':
            self.h1 += 1
        if 'id' in values:
            self.ids.append(values['id'])
        if 'aria-labelledby' in values:
            self.labels.extend(values['aria-labelledby'].split())
        if 'href' in values:
            self.links.append((tag, values['href']))
            if tag == 'link' and values.get('rel') == 'stylesheet':
                assert not values['href'].startswith(('https:', 'http:', '//')), 'remote stylesheet'

text = page.read_text(encoding='utf-8')
parser = PolicyParser()
parser.feed(text)
assert parser.h1 == 1
assert len(parser.ids) == len(set(parser.ids))
assert set(parser.labels) <= set(parser.ids)
for tag, href in parser.links:
    if href.startswith('#'):
        assert href[1:] in parser.ids
    elif not href.startswith(('https://', 'mailto:')):
        assert (page.parent / href).is_file(), href
assert 'suporte.orbity@gmail.com' in text
assert 'Sessões de foco' in text
assert 'SQLCipher' in text
assert 'criptografia própria' in text
url_source = (root / 'src/model/entities/privacyPolicy.ts').read_text(encoding='utf-8')
url = re.search(r'"(https://[^"]+)"', url_source)[1]
assert ('link', url) in parser.links
assert 'fetch(' not in text
css = (page.parent.parent / 'privacy.css').read_text(encoding='utf-8')
assert '@import' not in css and 'url(' not in css, 'remote CSS resource'
tokens = (page.parent.parent / 'tokens.css').read_text(encoding='utf-8')
assert set(re.findall(r'var\((--[^)]+)\)', css)) <= set(re.findall(r'(--[\w-]+):', tokens))
print(f'HTML verificado: {len(parser.ids)} âncoras únicas, rótulos acessíveis, links locais, URL oficial, contato, conteúdo e tokens; sem scripts/formulários/recursos remotos.')
