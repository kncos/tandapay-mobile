#!/usr/bin/env python3

import os
import re
import subprocess

def fix_stylesheet_imports(file_path):
    """Add StyleSheet import if not present"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if StyleSheet is already imported
    if 'StyleSheet' in content:
        return content
    
    # Find React Native import line and add StyleSheet
    rn_import_pattern = r"from 'react-native';"
    if re.search(rn_import_pattern, content):
        # Add StyleSheet to existing import
        content = re.sub(
            r"from 'react-native';", 
            r"} from 'react-native';", 
            content
        )
        content = re.sub(
            r"import\s*{\s*([^}]+)\s*}\s*from 'react-native';",
            r"import { \1, StyleSheet } from 'react-native';",
            content
        )
    else:
        # Add new import line after React import
        react_import_pattern = r"(import React[^;]*;)"
        if re.search(react_import_pattern, content):
            content = re.sub(
                react_import_pattern,
                r"\1\nimport { StyleSheet } from 'react-native';",
                content
            )
    
    return content

def wrap_styles_with_stylesheet(file_path):
    """Wrap style objects with StyleSheet.create"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already using StyleSheet.create
    if 'StyleSheet.create' in content:
        print(f"  ✅ {file_path} already uses StyleSheet.create")
        return False
    
    # Add StyleSheet import
    content = fix_stylesheet_imports(file_path)
    
    # Pattern to find style objects
    style_patterns = [
        (r'const\s+(\w*[Ss]tyles?\w*)\s*=\s*{', r'const \1 = StyleSheet.create({'),
    ]
    
    modified = False
    for pattern, replacement in style_patterns:
        matches = re.findall(pattern, content)
        if matches:
            # Replace the style definition
            content = re.sub(pattern, replacement, content)
            
            # Find the matching closing brace for each style object
            # This is a simplified approach - we'll look for the last }; in the object
            # We need to be more careful about nested objects
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if re.match(r'const\s+\w*[Ss]tyles?\w*\s*=\s*StyleSheet\.create\({', line.strip()):
                    # Find the matching closing brace
                    brace_count = 0
                    for j in range(i, len(lines)):
                        brace_count += lines[j].count('{') - lines[j].count('}')
                        if brace_count == 0 and '}' in lines[j]:
                            # This should be our closing line
                            if lines[j].strip() == '};':
                                lines[j] = lines[j].replace('};', '});')
                                modified = True
                            break
            
            content = '\n'.join(lines)
            modified = True
            print(f"  🔧 Modified {file_path}: {', '.join(matches)}")
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    return modified

def main():
    # List of files that need fixing (from our earlier analysis)
    files_to_fix = [
        "src/tandapay/wallet/wallet-setup/components/VerificationRow.js",
        "src/tandapay/wallet/wallet-setup/components/WordChip.js", 
        "src/tandapay/wallet/WalletSendScreen.js",
        "src/tandapay/wallet/TransactionDetailsModal.js",
        "src/tandapay/wallet/WalletBalanceCard.js",
        "src/tandapay/tokens/TokenManagementScreen.js",
        "src/tandapay/components/ContractAddressConfiguration.js",
        "src/tandapay/components/NumberInput.js",
        "src/tandapay/components/NetworkSelector.js",
        "src/tandapay/components/TransactionEstimateAndSend.js",
        "src/tandapay/components/NetworkPerformanceSettings.js",
        "src/tandapay/components/WalletNetworkInfo.js",
        "src/tandapay/components/ScrollableTextBox.js",
        "src/tandapay/components/AddressArrayInput.js",
        "src/tandapay/components/TandaRibbon.js",
        "src/tandapay/components/TransactionParameterForm.js",
        "src/tandapay/components/TokenPicker.js",
        "src/tandapay/components/ModalContainer.js",
    ]
    
    print("🔧 Fixing StyleSheet.create wrapping for remaining files...\n")
    
    fixed_count = 0
    for file_path in files_to_fix:
        if os.path.exists(file_path):
            if wrap_styles_with_stylesheet(file_path):
                fixed_count += 1
        else:
            print(f"  ⚠️  File not found: {file_path}")
    
    print(f"\n📊 Summary: Fixed {fixed_count} files")

if __name__ == "__main__":
    main()
