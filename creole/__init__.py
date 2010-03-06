from creole2html import Parser, HtmlEmitter

def convert(src):
    document = Parser(src).parse()
    return HtmlEmitter(document).emit().encode('utf-8', 'ignore')