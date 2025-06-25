In `src/tandapay/styles-refactoring-workspace.md` is a list of all JavaScript files in TandaPay excluding `styles`, `definitions`, and TandaPay.js which is just a solidity build artifact.

I want you to go through each one systematically and identify any CSS style sheets, then copy+paste the contents of those style sheets in the centralized markdown file at `src/tandapay/styles-refactoring-workspace.md`.

You will use the format:
```
// File: <filename>
<contents of the CSS style sheet>
```
or:
```
// File <filename>
// No styles in this file.
```

and put every CSS style sheet in the `styles-refactoring-workspace.md` file. You should not modify any of the contents, just copy+paste them as they are.
If a file does not contain any CSS style sheets, you will write a comment in the `styles-refactoring-workspace.md` file indicating that there are no styles in that file.