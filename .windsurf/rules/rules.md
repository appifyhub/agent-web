## Code Style

### JavaScript/TypeScript

In JavaScript and TypeScript, use types as much as possible: strict mode will be turned on! If in doubt, follow Java standard formatting. Finally, we also always want trailing commas in multi-line code blocks.

---

## MANDATORY PROJECT RULES

### Environment Management

- ALWAYS use both `bun` and `npm` for dependency management
- ALWAYS use `bun` for commands and task execution, you can ignore `npm` other than dependency management
- ALL commands must be run from project root (where `package.json` exists)

### Development Workflow

- Use tools from `package.json` for everything – linting, internationalization, translation keys, rebuilding, tests (if any), etc.
- Always run lint using `bun` before commits and at the end of tasks / plan chapters
- Bun scripts set up their environments, so there's nothing extra that you need to do

### Project Structure

- Version is managed through the `version` property of the `package.json` file
- You can see the CI/CD pipeline in `.github/workflows` directory
- It's best to base API implementation on API docs. If you don't have any, ask for them

### Internationalization

- All user-facing labels and messages must always be translated. Use the i18n directory for doing that. Never add any placeholders, and always manually update all translation files to ensure proper translation from day 0 across all languages
- All tasks and tools that you need are defined in `package.json`; for example, never run any translation scripts yourself – always just run `bun run lint` to understand the current state of the project and regenerate translation keys

### API Error Handling

- API errors must use `parseApiError()` in services and be displayed via `PageError.fromApiError()` with the ErrorMessage component (never use toast for API errors). Non-blocker errors auto-dismiss after 5 seconds with a visual timer; blocker errors remain visible until resolved

---

## Component Guidelines

### Prop Naming Conventions

- Use generic prop names instead of specific ones (e.g., `onActionClicked` instead of `onSaveClicked`)
- Use generic boolean flags (e.g., `showActionButton` instead of `showSaveButton`)
- Add configurable text props with sensible defaults (e.g., `actionButtonText` with default `t("save")`)

#### Example Pattern from existing components

```typescript
interface GenericControlsProps {
  onActionClicked: () => void;
  showActionButton?: boolean;
  actionButtonText?: string; // Defaults to t("save")
}
```

### Using Translations

1. **Update all translations** - Look at the i18n folder to find all editable translation files
2. **Check the keys** - Update translation keys using the translation keys task from `package.json`
3. **Never hard-code strings** - Always use translated versions of strings!

### When Changing Existing Component Interfaces

1. **Update the component interface** - Change prop names and add new optional props
2. **Search for all usages** - Use grep/search to find all files using the component
3. **Update all usages systematically** - Update each usage site with new prop names
4. **Maintain backward compatibility** - Use sensible defaults for new props

Whatever you do, always run the lint and rebuild bun tasks to check what you did.
