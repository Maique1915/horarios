#!/usr/bin/env python3
"""
Script to convert Physics course CSV to SQL INSERT statements
CSV Format:
  code, name, period, credits, prerequisites
  
Example:
  1A,Introdução às Ciências Experimentais,1,"[1, 2, 0, 0]",[]
  
Output: SQL statements ready to paste into Supabase
"""

import csv
import json
import sys

# Configuration - MODIFY THESE VALUES
COURSE_ID = 5  # ID for Physics course in your system
MAKE_OPTIONAL = False  # Set to True to mark subjects as optional (electives)

def parse_credits(credits_str):
    """
    Parse credits from array format "[1, 2, 0, 0]" to ARRAY[1, 2, 0, 0]
    Format: [theory, practice, complementary, other]
    """
    try:
        credits_list = json.loads(credits_str.strip())
        return f"ARRAY[{', '.join(map(str, credits_list))}]"
    except:
        return "ARRAY[0, 0, 0, 0]"

def parse_prerequisites(prereq_str):
    """
    Parse prerequisites from JSON array format "["1A", "1D"]" to list
    Returns: list of prerequisite acronyms
    """
    try:
        if prereq_str.strip() == "[]" or not prereq_str.strip():
            return []
        return json.loads(prereq_str.strip())
    except:
        return []

def csv_to_sql(csv_file_path, output_file_path=None):
    """
    Convert CSV to SQL INSERT statements
    """
    subjects = []
    prerequisites_map = {}  # acronym -> list of prerequisite acronyms
    
    # Read CSV
    with open(csv_file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = row['code'].strip()
            name = row['name'].strip()
            period = int(row['period'].strip())
            credits = row['credits'].strip()
            prerequisites = row['prerequisites'].strip()
            
            subjects.append({
                'code': code,
                'name': name,
                'period': period,
                'credits': credits,
                'prerequisites': prerequisites
            })
            
            # Store prerequisites for later
            prerequisites_map[code] = parse_prerequisites(prerequisites)
    
    # Generate SQL
    sql_lines = [
        "-- Physics Course Subjects (Course ID: {})".format(COURSE_ID),
        "-- Generated from CSV",
        "-- Copy and paste this into Supabase SQL Editor\n",
    ]
    
    # Start INSERT statement
    sql_lines.append("INSERT INTO subjects (")
    sql_lines.append("    course_id,")
    sql_lines.append("    semester,")
    sql_lines.append("    name,")
    sql_lines.append("    active,")
    sql_lines.append("    acronym,")
    sql_lines.append("    workload,")
    sql_lines.append("    category,")
    sql_lines.append("    optional,")
    sql_lines.append("    credits")
    sql_lines.append(")")
    sql_lines.append("VALUES")
    
    # Add subject rows
    for i, subj in enumerate(subjects):
        is_optional = MAKE_OPTIONAL or ("Optativa" in subj['name'])
        category = "ELECTIVE" if is_optional else "MANDATORY"
        
        # Parse credits
        credits_array = parse_credits(subj['credits'])
        
        # Format name for SQL (escape single quotes)
        name_sql = subj['name'].replace("'", "''")
        
        # Build VALUES tuple
        values = (
            f"    ({COURSE_ID}, {subj['period']}, '{name_sql}', "
            f"TRUE, '{subj['code']}', 0, '{category}', {str(is_optional).lower()}, {credits_array})"
        )
        
        # Add comma if not last
        if i < len(subjects) - 1:
            values += ","
        else:
            values += ";"
        
        sql_lines.append(values)
    
    # Generate full SQL string
    sql_output = "\n".join(sql_lines)
    
    # Print to console
    print(sql_output)
    
    # Optionally save to file
    if output_file_path:
        with open(output_file_path, 'w', encoding='utf-8') as f:
            f.write(sql_output)
        print(f"\n✓ SQL saved to: {output_file_path}")
    
    # Print prerequisites info (for manual setup if needed)
    print("\n\n-- PREREQUISITES MAPPING (for reference)")
    print("-- You may need to create a separate INSERT for subject_requirements")
    print("-- after the subjects are inserted and have IDs\n")
    
    for code, prereqs in prerequisites_map.items():
        if prereqs:
            print(f"-- {code} requires: {', '.join(prereqs)}")
    
    return sql_output

if __name__ == "__main__":
    # Check command line arguments
    if len(sys.argv) < 2:
        print("Usage: python csv_to_sql_physics.py <csv_file> [output_file]")
        print("\nExample:")
        print("  python csv_to_sql_physics.py fisica.csv physics_subjects.sql")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        csv_to_sql(csv_file, output_file)
    except FileNotFoundError:
        print(f"Error: File '{csv_file}' not found")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
