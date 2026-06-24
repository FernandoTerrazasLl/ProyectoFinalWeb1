import tokenize
import os
import glob

def remove_comments_from_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        source = f.read()
    
    with open(filepath, 'rb') as f:
        tokens = list(tokenize.tokenize(f.readline))
    
    out = []
    prev_toktype = tokenize.INDENT
    last_lineno = -1
    last_col = 0
    
    for tok in tokens:
        token_type = tok.type
        token_string = tok.string
        start_line, start_col = tok.start
        end_line, end_col = tok.end
        
        if start_line > last_lineno:
            last_col = 0
        if start_col > last_col:
            out.append(" " * (start_col - last_col))
        
        if token_type == tokenize.COMMENT:
            pass # ignore
        else:
            out.append(token_string)
            
        last_lineno = end_line
        last_col = end_col
        
    out_source = "".join(out)
    
    # Clean up empty lines created by comment removal
    cleaned_lines = []
    for line in out_source.split('\n'):
        if line.strip() == '' and len(cleaned_lines) > 0 and cleaned_lines[-1].strip() == '':
            continue
        cleaned_lines.append(line)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("\n".join(cleaned_lines))

if __name__ == "__main__":
    for py_file in glob.glob("src/**/*.py", recursive=True):
        print(f"Stripping {py_file}")
        remove_comments_from_file(py_file)
