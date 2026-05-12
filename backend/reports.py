import os
from typing import List, Dict
from datetime import datetime

# Placeholder for WeasyPrint import
# In a real environment with weasyprint installed:
# from weasyprint import HTML

def generate_relief_audit_report(teachers: List[Dict], assignments: List[Dict]) -> str:
    """
    Generates an HTML/PDF audit report summarizing relief duties.
    """
    
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica', sans-serif; color: #333; }}
            h1 {{ color: #0284c7; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
            th {{ background-color: #f8fafc; }}
            .summary {{ margin-top: 30px; font-weight: bold; }}
        </style>
    </head>
    <body>
        <h1>SchoolSync Relief Audit Report</h1>
        <p>Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>
        
        <table>
            <thead>
                <tr>
                    <th>Teacher Name</th>
                    <th>Department</th>
                    <th>Relief Count (Term)</th>
                    <th>Cap Violations</th>
                </tr>
            </thead>
            <tbody>
    """
    
    for t in teachers:
        count = sum(1 for a in assignments if a['teacher_id'] == t['id'])
        html_content += f"""
                <tr>
                    <td>{t['name']}</td>
                    <td>{t['department']}</td>
                    <td>{count}</td>
                    <td>0</td>
                </tr>
        """
        
    html_content += """
            </tbody>
        </table>
        
        <div class="summary">
            <p>Total Relief Assignments: {len(assignments)}</p>
            <p>Average per Teacher: {len(assignments) / max(len(teachers), 1):.2f}</p>
        </div>
    </body>
    </html>
    """
    
    # Save to file
    file_path = f"reports/audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
    os.makedirs("reports", exist_ok=True)
    with open(file_path, "w") as f:
        f.write(html_content)
        
    return file_path
