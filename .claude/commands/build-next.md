# Build Next.js Application

Performs a comprehensive pre-build check and fixes issues before running the full Next.js build.

## Process

### 1. Initial Git Status Check
First, run `git status` to identify all modified or new frontend-related files (files in `frontend/` directory or with extensions like `.tsx`, `.ts`, `.jsx`, `.js`, `.css`, `.scss`).

### 2. File-by-File Analysis
For each modified or new frontend file:

#### Step 2.1: Read Full File
- Use the Read tool to read the entire file content
- Don't use offset/limit unless the file is extremely large (>2000 lines)

#### Step 2.2: Manual Code Review
Check for obvious issues:
- **Incomplete implementations**: Look for TODO comments, placeholder text, or unfinished functions
- **Missing imports**: Check if all used components/functions are imported
- **Unused imports**: Check for imports that aren't used in the file
- **Type issues**: Look for `any` types that should be properly typed
- **Missing error handling**: Check try-catch blocks and error states
- **Incomplete JSX**: Look for components with missing props or incomplete rendering
- **Console logs**: Check for debug console.log statements that should be removed
- **Commented code**: Look for large blocks of commented-out code
- **Missing translations**: Check if all user-facing text uses translation keys
- **Security issues**: Look for exposed API keys, credentials, or unsafe operations

#### Step 2.3: Report Issues to User
If any issues are found:
- Report to the user with specific line numbers and descriptions
- Ask: "Found potential issues in [filename]. Should I fix these issues, or would you like to handle them? Issues found: [list issues]"
- Wait for user confirmation before proceeding

#### Step 2.4: ESLint Check
If no manual issues found, or after user approves fixes:
```bash
npx eslint [specific-file-path] --ext .ts,.tsx,.js,.jsx
```

#### Step 2.5: TypeScript Check
Run TypeScript compiler check:
```bash
npx tsc --noEmit --skipLibCheck
```
**Note**: TypeScript's tsc doesn't check individual files in isolation. Look for errors related to the current file in the output.

#### Step 2.6: Fix ALL Issues
**CRITICAL**: Fix ALL ESLint warnings and TypeScript errors found:
- Use Edit or MultiEdit tools to fix issues
- Common fixes:
  - Remove unused imports
  - Add missing dependencies to useEffect
  - Fix type errors (avoid using type assertions unless necessary)
  - Fix deprecated API usage (e.g., onKeyPress → onKeyDown)
  - Add missing alt attributes (but recognize false positives for icon components)
  - Fix toast variant types ('success'/'error' → 'default'/'destructive')

#### Step 2.7: Verify Fixes (MANDATORY)
**MUST DO BEFORE MARKING COMPLETE**:
1. Run ESLint again on the specific file:
   ```bash
   npx eslint [specific-file-path] --ext .ts,.tsx,.js,.jsx
   ```
2. Run TypeScript check again:
   ```bash
   npx tsc --noEmit --skipLibCheck
   ```
3. Verify the file has ZERO errors and warnings
4. **DO NOT** mark the file task as complete until both checks pass
5. **DO NOT** move to the next file until current file is completely clean

### 3. Run Full Build
**ONLY** after ALL individual files are checked, fixed, and verified clean:
```bash
npm run build
```

### 4. Handle Build Errors
If build fails:
1. Identify the error type and file
2. Read the specific file mentioned in the error
3. Fix the issue
4. Run build again
5. Repeat until build succeeds

### 5. Final Verification
Once build succeeds:
- Report: "Build completed successfully. [X] files were checked and [Y] issues were fixed."
- List summary of fixes made

## Common Issues and Fixes

### TypeScript Errors
- **Unused imports**: Remove them
- **Type 'undefined' not assignable**: Add proper null checks or optional chaining
- **Object is possibly 'undefined'**: Use optional chaining (?.) or null checks

### ESLint Warnings
- **Missing dependencies in useEffect**: Wrap functions in useCallback or add to dependencies
- **Alt text missing**: Add alt="" for decorative images, meaningful text for content images
- **Deprecated APIs**: Update to modern equivalents

### False Positives
- Lucide-react icons triggering alt-text warnings (these are SVG components, not img elements)
- Some complex dependency scenarios in useEffect hooks

## Example Usage

```
/build-next
```

The assistant will:
1. Check git status for frontend changes
2. Thoroughly review each changed file
3. Report any issues and get approval
4. Fix all linting and type errors
5. Run the full build
6. Fix any remaining issues
7. Confirm successful build

## Critical Requirements

1. **Task Completion Criteria**: A file task can ONLY be marked 'completed' when:
   - ESLint reports zero errors/warnings for that file
   - TypeScript compilation shows no errors related to that file
   - All fixes have been verified with a re-check

2. **Sequential Processing**: 
   - Complete one file entirely before moving to the next
   - Do not run full project build until all individual files are verified clean
   - Do not skip verification steps

3. **Error Handling**:
   - If TypeScript shows errors, fix ALL of them before proceeding
   - If ESLint shows warnings, fix ALL of them before proceeding
   - Re-run checks after fixes to ensure they're resolved

## Notes

- Always fix issues file-by-file before running the full build
- Be thorough in the initial review to catch logic issues, not just syntax
- Ask for user input when issues might be intentional
- Recognize false positives (especially for icon components)
- Ensure all fixes maintain the intended functionality
- Use TodoWrite tool to track progress and ensure nothing is missed