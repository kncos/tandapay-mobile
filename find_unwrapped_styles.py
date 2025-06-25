#!/usr/bin/env python3

import os
import re
import subprocess

def find_unwrapped_styles():
    """Find all style definitions that aren't wrapped in StyleSheet.create"""
    tandapay_dir = "src/tandapay"
    unwrapped_files = []
    
    # Get all JavaScript files in tandapay directory
    result = subprocess.run(['find', tandapay_dir, '-name', '*.js', '-type', 'f'], 
                          capture_output=True, text=True)
    js_files = result.stdout.strip().split('\n') if result.stdout.strip() else []
    
    for file_path in js_files:
        if not os.path.exists(file_path):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Look for style definitions that aren't using StyleSheet.create
            # Pattern: const [something]styles = {
            style_pattern = r'const\s+(\w*[Ss]tyles?\w*)\s*=\s*{'
            stylesheet_pattern = r'StyleSheet\.create'
            
            # Find style definitions
            style_matches = re.findall(style_pattern, content)
            
            if style_matches:
                # Check if this file uses StyleSheet.create
                has_stylesheet_create = re.search(stylesheet_pattern, content) is not None
                
                if not has_stylesheet_create:
                    unwrapped_files.append({
                        'file': file_path,
                        'style_vars': style_matches
                    })
                    print(f"❌ {file_path}: {', '.join(style_matches)} (no StyleSheet.create)")
                else:
                    print(f"✅ {file_path}: {', '.join(style_matches)} (has StyleSheet.create)")
        except Exception as e:
            print(f"⚠️  Error reading {file_path}: {e}")
    
    return unwrapped_files

if __name__ == "__main__":
    print("🔍 Searching for style definitions that need StyleSheet.create wrapping...\n")
    unwrapped = find_unwrapped_styles()
    
    print(f"\n📊 Summary:")
    print(f"Found {len(unwrapped)} files with unwrapped styles")
    
    if unwrapped:
        print("\n🔧 Files that need fixing:")
        for item in unwrapped:
            print(f"  - {item['file']}")
