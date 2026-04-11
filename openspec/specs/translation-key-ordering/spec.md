## Requirements

### Requirement: Key ordering matches English source

The system SHALL ensure that all non-English i18n JSON files have their keys ordered to match `en.json` at every nesting level. `en.json` itself SHALL NOT be modified.

#### Scenario: Keys are already in correct order
- **WHEN** a non-English file has all keys in the same order as `en.json` at every nesting level
- **THEN** the file is not rewritten

#### Scenario: Keys are out of order at top level
- **WHEN** a non-English file has the same keys as `en.json` but in a different top-level order
- **THEN** the file is rewritten with keys reordered to match `en.json`
- **AND** the file's values are preserved exactly

#### Scenario: Keys are out of order in nested objects
- **WHEN** a non-English file has nested object keys in a different order than the corresponding nested object in `en.json`
- **THEN** the nested keys are reordered to match `en.json` recursively at every depth

#### Scenario: Plural form key ordering
- **WHEN** a plural form object (containing keys like `zero`, `one`, `two`, `few`, `many`, `other`) has keys in a different order than `en.json`
- **THEN** the plural form keys are reordered to match `en.json`

### Requirement: Reorder logging

The system SHALL log which files were reordered during the validation run.

#### Scenario: Files were reordered
- **WHEN** one or more non-English files are rewritten due to key ordering mismatch
- **THEN** the script logs a message identifying each reordered file

#### Scenario: No files need reordering
- **WHEN** all non-English files already match `en.json` key order
- **THEN** the script logs a success message indicating all files are correctly ordered

### Requirement: Validation ordering

The key ordering check SHALL run after all correctness validations (JSON syntax, duplicate keys, key matching, placeholder validation) and before TypeScript type generation.

#### Scenario: File has correctness errors
- **WHEN** a file fails syntax, duplicate, key matching, or placeholder validation
- **THEN** the script fails with the correctness error before reaching the ordering step

#### Scenario: File passes all validations
- **WHEN** a file passes all correctness validations but has misordered keys
- **THEN** the file is auto-fixed and type generation proceeds with correctly ordered data
