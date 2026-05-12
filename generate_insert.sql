import openpyxl

wb = openpyxl.load_workbook(r'C:\Users\Admin\.openclaw\media\inbound\杨凌国合_2_4---daef7de9-d8a8-432f-a2e7-21ba82d122c8.xlsx')
ws = wb['Sheet1']
rows = [row for row in ws.iter_rows(values_only=True) if any(cell is not None for cell in row) and row[0] is not None and str(row[0]).replace('.','').isdigit()]

values = []
for row in rows:
    seq = row[0]
    container_no = row[2]
    box_type = row[4] if len(row) > 4 else '40HC'
    status = row[7] if len(row) > 7 else ''
    # Escape single quotes
    status_escaped = status.replace("'", "''")
    values.append(f"('{container_no}', '{box_type}', E'{status_escaped}', '')")

with open(r'C:\Users\Admin\.openclaw\workspace\container-platform\insert_containers.sql', 'w', encoding='utf-8') as f:
    f.write('insert into public.containers (container_no, type, status, remark) values\n')
    f.write(',\n'.join(values))
    f.write(';\n')

print(f'Total rows: {len(values)}')
